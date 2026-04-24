// convex/gemini.ts
"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";

export const getAIPrompt = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY as string;
    if (!apiKey) throw new Error("GEMINI_API_KEY belum diset!");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: args.prompt }] }]
  })
});

    const data = await response.json();

    // --- BAGIAN INI YANG KITA PERBAIKI ---
    // Cek apakah response mengandung error atau tidak ada kandidat jawaban
    if (data.error) {
      console.error("Gemini Error:", data.error);
      throw new Error(`Gemini API Error: ${data.error.message}`);
    }

    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      console.error("Respons tidak valid:", JSON.stringify(data));
      throw new Error("AI tidak memberikan jawaban yang valid.");
    }
    // --------------------------------------

    return data.candidates[0].content.parts[0].text;
  },
});