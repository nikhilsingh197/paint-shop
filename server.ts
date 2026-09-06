import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import path from "path";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000; // Uses Render's dynamic port or defaults to 10000

// Middleware
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// 1. RAZORPAY PAYMENT API ROUTES
// ---------------------------------------------------------

// Initialize Razorpay instance securely using environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Endpoint to create a new Razorpay order
app.post("/api/create-razorpay-order", async (req, res) => {
  try {
    const { amount } = req.body; // Amount received in INR

    if (!amount) {
      return res
        .status(400)
        .json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay requires the amount in paise (1 INR = 100 paise)
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
// 2. PRODUCTION FRONTEND SERVING (For Render Deployment)
// ---------------------------------------------------------

// Serve the static files from the React/Vite 'dist' directory
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

// Catch-all route to serve index.html for React Router / SPA navigation
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ---------------------------------------------------------
// 3. START THE SERVER
// ---------------------------------------------------------

app.listen(PORT, () => {
  console.log(`🚀 Nikhil Paints Server is running on port ${PORT}`);
  console.log(
    `Razorpay Gateway: ${process.env.RAZORPAY_KEY_ID ? "Configured" : "Missing Keys!"}`,
  );
});
