const apiKey = 'AIzaSyAQKCtgkAcU7M8wJvHKTJy15Qxe_VQ6Zlg';

async function run() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'aku lagi sedih nih, hibur dong pake lagu balonku ada lima' }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
      }),
    }
  );
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

run();
