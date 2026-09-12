import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyFakeKey" });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
      config: {
        systemInstruction: "You are a test."
      }
    });
    console.log("Success:", response.text);
  } catch (err: any) {
    console.log("Error:", err.message);
  }
}
test();
