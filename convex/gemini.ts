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
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY; // Fallback for env names
    if (!apiKey) throw new Error("API Key belum diset di Convex environment!");

    const messages = [];

    // System instruction
    messages.push({
      role: "system",
      content: VITA_SYSTEM_PROMPT
    });

    // Add conversation history if available
    if (args.conversationHistory) {
      const lines = args.conversationHistory.split("\n");
      for (const line of lines) {
        if (line.startsWith("User: ")) {
          messages.push({ role: "user", content: line.substring(6) });
        } else if (line.startsWith("Vita: ")) {
          messages.push({ role: "assistant", content: line.substring(6) });
        }
      }
    }

    // Add current message
    messages.push({
      role: "user",
      content: args.userMessage,
    });

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Groq fast model
          messages,
          temperature: 0.8,
          max_tokens: 280,
          top_p: 0.9
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Groq Error:", data.error);
      return "Maaf, Vita sedang mengalami gangguan teknis. Coba lagi nanti ya 💛";
    }

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      console.error("Invalid response:", JSON.stringify(data));
      return "Maaf, aku belum bisa memproses pesanmu saat ini. Coba ulangi lagi ya 🌱";
    }

    return data.choices[0].message.content as string;
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
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key belum diset!");

    // Optimalisasi Payload Data: Hanya ambil core value
    const moodScores: Record<string, number> = { rad: 5, good: 4, meh: 3, bad: 2, awful: 1 };
    const cleanMood = args.moodLogs.map((l: any) => moodScores[l.mood] || 3);
    const cleanSleep = args.sleepLogs.map((l: any) => l.durationInHours);
    const cleanStress = args.stressLogs.map((l: any) => ({ level: l.level, dl: l.hasDeadline }));

    const systemPrompt = `Kamu adalah analis kesehatan mental dan wellbeing untuk mahasiswa.`;
    const userPrompt = `Tugasmu: Buat satu paragraf singkat (maksimal 3-4 kalimat) berisi insight dari data check-in mingguan user bernama ${args.userName}.
Pilih kata-kata yang hangat, empatik, dan analitis. Jika tidur < 7 jam atau stres tinggi, berikan saran praktis (misal: kurangi kafein, peregangan) dan hubungkan empatimu dengan kemungkinan padatnya beban akademik, deadline, atau UKM. Jika tren data baik, berikan apresiasi atas konsistensinya.

Data 7 hari terakhir (Berurutan):
- Tren Mood (Skala 1-Awful s/d 5-Rad): ${JSON.stringify(cleanMood)}
- Tren Tidur (Jam/hari): ${JSON.stringify(cleanSleep)}
- Tren Stress (Level dan ada deadline): ${JSON.stringify(cleanStress)}

Tulis HANYA paragraf analisisnya, langsung sapa namanya, tanpa pembuka/penutup basa-basi.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Groq fast model
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7, 
          max_tokens: 350
        }),
      }
    );

    const data = await response.json();
    if (data.error || !data.choices || data.choices.length === 0) {
      console.error("Groq Insight Error:", data.error || data);
      return "Data belum cukup untuk dianalisis minggu ini. Tetap semangat dan usahakan check-in rutin ya!";
    }

    return data.choices[0].message.content as string;
  },
});