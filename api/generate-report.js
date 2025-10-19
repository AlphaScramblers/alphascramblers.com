import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QuickChart from "quickchart-js";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, mobile, email, scienceScore, commerceScore, humanitiesScore, maxStream } = req.body;

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText("Alpha Scrambler - Psychometric Report", { x: 50, y: height - 50, size: 20, font, color: rgb(0.1, 0.1, 0.5) });
    page.drawText(`Name: ${name}`, { x: 50, y: height - 90, size: 14, font });
    page.drawText(`Mobile: ${mobile}`, { x: 50, y: height - 110, size: 14, font });
    page.drawText(`Email: ${email}`, { x: 50, y: height - 130, size: 14, font });
    page.drawText(`Recommended Stream: ${maxStream}`, { x: 50, y: height - 160, size: 16, font, color: rgb(0.8, 0.1, 0.1) });

    const aboutText = `The student has shown interest in multiple streams. Science: ${scienceScore}, Commerce: ${commerceScore}, Humanities: ${humanitiesScore}. Recommended Stream: ${maxStream}.`;
    page.drawText(aboutText, { x: 50, y: height - 200, size: 12, font, lineHeight: 16 });

    // Charts (optional)
    try {
      const barChartUrl = new QuickChart().setConfig({
        type: "bar",
        data: {
          labels: ["Science", "Commerce", "Humanities"],
          datasets: [{ label: "Scores", data: [scienceScore, commerceScore, humanitiesScore] }],
        },
      }).getUrl();

      const barRes = await fetch(barChartUrl);
      const barBytes = await barRes.arrayBuffer();
      const barImage = await pdfDoc.embedPng(barBytes);
      page.drawImage(barImage, { x: 50, y: 300, width: 250, height: 200 });
    } catch (err) {
      console.log("Bar chart error, skipping:", err.message);
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${name}_report.pdf`);
    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: err.message });
  }
}