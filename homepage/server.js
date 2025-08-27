const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const OPENAI_API_KEY = "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";

app.post("/submit", async (req, res) => {
    const { answers, email } = req.body;

   
    const answersText = Object.entries(answers)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

    
    const aiResponse = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: `Analyze the following psychometric test answers:\n${answersText}\nProvide a detailed personality assessment.`,
            max_tokens: 200
        })
    });

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].text.trim();

    
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "alphascramblers@gmail.com",
            pass: "abcd efgh ijkl mnop"
        }
    });

    let mailOptions = {
        from: "alphascramblers@gmail.com",
        to: email,
        subject: "Your Psychometric Test Results",
        text: analysis
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "AI-generated results sent successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send email" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
