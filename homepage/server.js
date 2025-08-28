import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ Warning: This is a direct injection of a sensitive API key.
// This is not a recommended security practice.
// You should use environment variables for production environments.
const API_KEY = "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";

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