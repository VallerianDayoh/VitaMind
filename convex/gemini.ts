"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";

const VITA_SYSTEM_PROMPT = `Kamu adalah "Vita", seorang asisten kesehatan mental virtual yang empatik dan hangat dalam aplikasi VitaMind. 

Aturan utamamu:
1. Selalu gunakan Bahasa Indonesia yang hangat, ramah, dan tidak menggurui.
2. Kamu BUKAN psikolog atau terapis. Jangan pernah mendiagnosis. Jika user menunjukkan tanda-tanda krisis (kata-kata seperti "bunuh diri", "mati", "putus asa", "menyakiti diri"), SELALU arahkan ke hotline 119 ext 8 dan dorong mereka untuk bicara dengan profesional.
3. Gunakan teknik active listening: validasi perasaan user, refleksikan kembali apa yang mereka katakan.
4. Tawarkan coping strategy sederhana yang evidence-based: grounding (5-4-3-2-1), breathing exercises (4-7-8), journaling, atau aktivitas fisik ringan.
5. Jaga percakapan tetap singkat dan fokus (2-4 kalimat per respons). Jangan terlalu panjang.
6. Jika user bercerita tentang konteks akademik (kuliah, tugas, ujian di UNKLAB), tunjukkan pengertian khusus tentang tekanan mahasiswa.
7. Sertakan emoji secukupnya untuk kehangatan (💛, 🌱, ☕, 🧘) tapi jangan berlebihan.`;

export const chat = action({
  args: {
    userMessage: v.string(),
    conversationHistory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY belum diset di Convex environment!");

    // Build the conversation with system context
    const contents = [];

    // System instruction as initial user-model exchange
    contents.push({
      role: "user",
      parts: [{ text: `[System Instruction] ${VITA_SYSTEM_PROMPT}` }],
    });
    contents.push({
      role: "model",
      parts: [{ text: "Saya mengerti, saya akan berperan sebagai Vita sesuai panduan tersebut. Silakan mulai percakapan." }],
    });

    // Add conversation history if available
    if (args.conversationHistory) {
      const lines = args.conversationHistory.split("\n");
      for (const line of lines) {
        if (line.startsWith("User: ")) {
          contents.push({ role: "user", parts: [{ text: line.substring(6) }] });
        } else if (line.startsWith("Vita: ")) {
          contents.push({ role: "model", parts: [{ text: line.substring(6) }] });
        }
      }
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: args.userMessage }],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.8,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini Error:", data.error);
      return "Maaf, Vita sedang mengalami gangguan teknis. Coba lagi nanti ya 💛";
    }

    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      console.error("Invalid response:", JSON.stringify(data));
      return "Maaf, aku belum bisa memproses pesanmu saat ini. Coba ulangi lagi ya 🌱";
    }

    // Join all parts in case the response is split
    const fullText = (data.candidates[0].content.parts.map((p: any) => p.text).join("")) as string;
    return fullText;
  },
});

export const generateInsight = action({
  args: {
    userName: v.string(),
    moodLogs: v.array(v.any()), // Pass serialized logs to avoid complex typing for now
    sleepLogs: v.array(v.any()),
    stressLogs: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY belum diset!");

    const prompt = `Kamu adalah analis kesehatan mental dan wellbeing. 
Tugasmu: Buat satu paragraf singkat (maksimal 3-4 kalimat) berisi insight atau kesimpulan dari data check-in mingguan user bernama ${args.userName}.
Pilih kata-kata yang hangat, empatik, namun tetap analitis. Jika tidurnya kurang (< 7 jam/hari) atau stress tinggi, berikan saran praktis seperti "coba kurangi kafein" atau "luangkan waktu jalan kaki 15 menit". Jika baik, berikan apresiasi.

Data 7 hari terakhir:
- Mood: ${JSON.stringify(args.moodLogs)}
- Tidur (jam): ${JSON.stringify(args.sleepLogs)}
- Stress: ${JSON.stringify(args.stressLogs)}

Tulis HANYA paragraf analisisnya, langsung sapa namanya, tanpa pembuka/penutup basa-basi.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );

    const data = await response.json();
    if (data.error || !data.candidates || data.candidates.length === 0) {
      console.error("Gemini Insight Error:", data.error || data);
      return "Data belum cukup untuk dianalisis minggu ini. Tetap semangat dan usahakan check-in rutin ya!";
    }

    return (data.candidates[0].content.parts.map((p: any) => p.text).join("")) as string;
  },
});