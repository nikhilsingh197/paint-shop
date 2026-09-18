import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000; // Uses Render's dynamic port or defaults to 10000

// Middleware
// FIX: default express.json() limit is 100kb — any base64 photo in the chat
// payload would 413 before reaching the handler. 10mb covers phone photos.
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---------------------------------------------------------
// 0. STARTUP VALIDATION
// ---------------------------------------------------------

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing — AI consultant will not work.");
}
if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith("YOUR_")) {
  console.error("❌ RAZORPAY_KEY_ID is missing or still a placeholder — payments will not work.");
}

// Initialize Razorpay instance securely using environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Initialize Gemini once and reuse
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// ---------------------------------------------------------
// 0.5 LIGHTWEIGHT IN-MEMORY RATE LIMITER (AI endpoint)
// ---------------------------------------------------------

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 15; // 15 requests/minute per IP
const rateBuckets = new Map<string, number[]>();

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const hits = (rateBuckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    return res.status(429).json({ reply: "Too many requests — please slow down and try again in a minute." });
  }
  hits.push(now);
  rateBuckets.set(ip, hits);
  next();
}

// ---------------------------------------------------------
// 1. RAZORPAY PAYMENT API ROUTES
// ---------------------------------------------------------

// Endpoint to create a new Razorpay order
app.post("/api/create-razorpay-order", async (req, res) => {
  try {
    // FIX: validate amount — previously any value (negative, 0, huge) was accepted.
    const amt = Number(req.body?.amount);
    if (!Number.isFinite(amt) || amt < 1 || amt > 500000) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be between ₹1 and ₹5,00,000" });
    }

    const options = {
      amount: Math.round(amt * 100), // Razorpay requires the amount in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint to verify the payment signature after customer pays
app.post("/api/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Create the expected signature using your secret key
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign)
      .digest("hex");

    // Compare the signatures
    if (razorpay_signature === expectedSign) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error: any) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------------------------------------------------------
// 2. AI CONSULTANT API ROUTE
// ---------------------------------------------------------

app.post("/api/consultant/chat", rateLimit, async (req, res) => {
  try {
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    const { message, history } = req.body;

    const systemPrompt = `You are the Expert Paint & Color Technical Consultant at Nikhil Paints and Hardware Jamshedpur.
You help customers with:
1. Paint brand comparison (Asian Paints, Berger, Birla Opus).
2. Shade suggestions (mention specific 4-digit shade codes like 7996, 0952, etc. if you suggest a color).
3. Waterproofing solutions and Damp-proofing methods.
4. Paint estimation and coverage logic.

Keep responses concise, helpful, and highly professional. Format with Markdown.
IMPORTANT: When suggesting a color, ALWAYS mention its exact 4-digit or alphanumeric code (e.g., L141, 8004, 0952, 7996) so the UI can detect it and show a color swatch!`;

    // FIX: cap history to the last 20 turns so a client can't send
    // unbounded context that blows the token limit or slows every request.
    const rawHistory = Array.isArray(history) ? history.slice(-20) : [];
    const chatHistory = rawHistory.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: String(msg.text ?? "") }]
    }));

    // Add the current message
    const currentParts: any[] = [{ text: String(message ?? "") }];
    if (req.body.image) {
      // image should be a base64 string without the data URL prefix
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
      currentParts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      });
    }

    chatHistory.push({
      role: 'user',
      parts: currentParts
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: chatHistory,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini AI Chat Error:", error);
    res.status(500).json({ reply: `I apologize, but my AI system is currently unavailable. Developer Error: ${error.message}` });
  }
});

// ---------------------------------------------------------
// 3. API 404 (FIX: unknown /api routes no longer fall through
//    to the SPA catch-all and return index.html)
// ---------------------------------------------------------

app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// ---------------------------------------------------------
// 4. PRODUCTION FRONTEND SERVING (For Render Deployment)
// ---------------------------------------------------------

// Serve the static files from the React/Vite 'dist' directory
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

// Catch-all route to serve index.html for React Router / SPA navigation
app.get("*", (req, res) => {
  const indexFile = path.join(distPath, "index.html");
  if (!fs.existsSync(indexFile)) {
    return res
      .status(503)
      .send("Frontend build not found. Run `npm run build` first.");
  }
  res.sendFile(indexFile);
});

// ---------------------------------------------------------
// 5. GLOBAL ERROR HANDLER
// ---------------------------------------------------------

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.type === "entity.too.large"
      ? "Payload too large — please use a smaller image."
      : "Internal server error",
  });
});

// ---------------------------------------------------------
// 6. START THE SERVER
// ---------------------------------------------------------

app.listen(PORT, () => {
  console.log(`🚀 Nikhil Paints Server is running on port ${PORT}`);
  console.log(
    `Razorpay Gateway: ${process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.startsWith("YOUR_") ? "Configured" : "Missing Keys!"}`,
  );
});