import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QuickChart from "quickchart-js";
import fetch from "node-fetch";

const app = express();
const __dirname = path.resolve();

app.use(cors());
app.use(bodyParser.json());

// -----------------------------
// Generate Bar Chart URL
// -----------------------------
function generateBarChart(science, commerce, humanities) {
  const qc = new QuickChart();
  qc.setConfig({
    type: "bar",
    data: {
      labels: ["Science", "Commerce", "Humanities"],
      datasets: [
        { label: "Scores", data: [science, commerce, humanities], backgroundColor: ["#4caf50", "#2196f3", "#ff9800"] },
      ],
    },
    options: { plugins: { title: { display: true, text: "Stream Scores", font: { size: 18 } } }, scales: { y: { beginAtZero: true, max: 100 } } },
  });
  return qc.getUrl();
}

// -----------------------------
// Generate Pie Chart URL
// -----------------------------
function generatePieChart(science, commerce, humanities) {
  const qc = new QuickChart();
  qc.setConfig({
    type: "pie",
    data: {
      labels: ["Science", "Commerce", "Humanities"],
      datasets: [{ data: [science, commerce, humanities], backgroundColor: ["#4caf50", "#2196f3", "#ff9800"] }],
    },
    options: { plugins: { title: { display: true, text: "Score Distribution", font: { size: 18 } } } },
  });
  return qc.getUrl();
}

// -----------------------------
// Generate About Text Offline
// -----------------------------
function generateAboutText(science, commerce, humanities, maxStream) {
  let about = `The student has shown interest in multiple streams. `;
  about += `Science score: ${science}, Commerce score: ${commerce}, Humanities score: ${humanities}. `;
  about += `Based on the scores, the recommended stream is ${maxStream}. `;
  about += "The student demonstrates potential in analytical, numerical, and creative thinking areas.";
  return about;
}

// -----------------------------
// Endpoint to generate PDF
// -----------------------------
app.post("/generate-report", async (req, res) => {
  const { name, mobile, email, scienceScore, commerceScore, humanitiesScore, maxStream } = req.body;

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Title
    page.drawText("Alpha Scrambler - Psychometric Report", { x: 50, y: height - 50, size: 20, font, color: rgb(0.1, 0.1, 0.5) });

    // Basic Info
    page.drawText(`Name: ${name}`, { x: 50, y: height - 90, size: 14, font });
    page.drawText(`Mobile: ${mobile}`, { x: 50, y: height - 110, size: 14, font });
    page.drawText(`Email: ${email}`, { x: 50, y: height - 130, size: 14, font });

    // Recommended Stream
    page.drawText(`Recommended Stream: ${maxStream}`, { x: 50, y: height - 160, size: 16, font, color: rgb(0.8, 0.1, 0.1) });

    // About Section
    const aboutText = generateAboutText(scienceScore, commerceScore, humanitiesScore, maxStream);
    page.drawText(`About:\n${aboutText}`, { x: 50, y: height - 200, size: 12, font, lineHeight: 16, maxWidth: 500 });

    // Add charts
    const barChartBytes = await fetch(await generateBarChart(scienceScore, commerceScore, humanitiesScore)).then(r => r.arrayBuffer());
    const barChartImage = await pdfDoc.embedPng(barChartBytes);
    page.drawImage(barChartImage, { x: 50, y: 300, width: 250, height: 200 });

    const pieChartBytes = await fetch(await generatePieChart(scienceScore, commerceScore, humanitiesScore)).then(r => r.arrayBuffer());
    const pieChartImage = await pdfDoc.embedPng(pieChartBytes);
    page.drawImage(pieChartImage, { x: 300, y: 300, width: 250, height: 200 });

    // Send PDF
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${name}_report.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Serve frontend if needed
app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));