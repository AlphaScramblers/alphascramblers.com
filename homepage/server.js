const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const OPENAI_API_KEY = "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";

app.post("/submit", async (req, res) => {
    try {
        const { answers, email } = req.body;

        // Convert answers object to text
        const answersText = Object.entries(answers)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");

        // Call OpenAI API
        const aiResponse = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: `Analyze the following psychometric test answers:\n${answersText}\nProvide a detailed personality assessment.`,
                max_tokens: 300
            })
        });

        const aiData = await aiResponse.json();
        const analysis = aiData.choices ? aiData.choices[0].text.trim() : "AI analysis failed.";

      
        res.json({ 
            message: "AI-generated report ready!", 
            report: analysis 
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to generate AI report" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
