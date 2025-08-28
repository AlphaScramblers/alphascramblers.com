import express from "express";
import cors from "cors";

// If you're on Node 18+, fetch is built-in. If on older Node, run: npm i node-fetch
// and uncomment the next line:
// import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// ❗️Put your OpenRouter API key in an env var instead of hardcoding
// On Mac/Linux:  OPENROUTER_API_KEY=sk-or-... node server.js
const API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_API_KEY_HERE";

app.post("/generateReport", async (req, res) => {
  try {
    const { answers = {} } = req.body;

    // Sum only numeric answers safely
    const totalScore = Object.values(answers).reduce((sum, v) => {
      const n = parseInt(v, 10);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

    const prompt = `
You are a career counselor generating a clear stream-selection report after Grade 10.
Use the psychometric responses to recommend a stream (Science/Commerce/Arts/vocational),
with reasons, top strengths, and 3-5 actionable improvement tips.

Total Score: ${totalScore}
Answers (1–5 per Q): ${JSON.stringify(answers, null, 2)}
Return plain text only.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "You are an expert career counselor." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1200,
      }),
    });

    const data = await response.json();

    // Basic guard rails / debugging
    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return res.status(502).json({ error: "AI provider error", detail: data });
    }

    const reportText = data?.choices?.[0]?.message?.content?.trim() || "No response generated.";
    res.json({ report: reportText });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
