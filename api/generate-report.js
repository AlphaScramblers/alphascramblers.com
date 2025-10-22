import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import QuickChart from "quickchart-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      scienceScore,
      commerceScore,
      humanitiesScore,
      behaviorScience,
      behaviorCommerce,
      behaviorHumanities,
      mentalScience,
      mentalCommerce,
      mentalHumanities,
      aptitudeScore,
      maxStream,
    } = req.body;

    if (
      !name ||
      scienceScore == null ||
      commerceScore == null ||
      humanitiesScore == null ||
      !maxStream
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields in request body" });
    }

    const firstName = name.split(" ")[0];
    const alpha = `Alpha ${firstName}`;
    const stream = maxStream.trim().toLowerCase();

    // Pick template
    let templateFile;
    switch (stream) {
      case "commerce":
        templateFile = "ctemplate.pdf";
        break;
      case "science":
        templateFile = "stemplate.pdf";
        break;
      case "humanities":
        templateFile = "htemplate.pdf";
        break;
      default:
        templateFile = "ctemplate.pdf";
    }

    const templatePath = path.join(process.cwd(), "streamtemplates", templateFile);
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: `Template not found: ${templateFile}` });
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    form.getTextField("name")?.setText(String(name));
    form.getTextField("science")?.setText(String(scienceScore));
    form.getTextField("commerce")?.setText(String(commerceScore));
    form.getTextField("humanities")?.setText(String(humanitiesScore));
    form.getTextField("stream")?.setText(maxStream);
    form.getTextField("alphaname")?.setText(alpha);

    form.flatten();

    // ---------- Charts ----------
    const chart1 = new QuickChart()
      .setWidth(600)
      .setHeight(300)
      .setBackgroundColor("white")
      .setConfig({
        type: "doughnut",
        data: {
          labels: ["Science", "Commerce", "Humanities"],
          datasets: [
            {
              label: "Total Scores",
              data: [scienceScore, commerceScore, humanitiesScore],
              backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
            },
          ],
        },
      });
    const chart1Image = await chart1.toDataUrl();

    const chart2 = new QuickChart()
      .setWidth(400)
      .setHeight(400)
      .setConfig({
        type: "radar",
        data: {
          labels: ["Science", "Commerce", "Humanities"],
          datasets: [
            {
              label: "Behavior Scores",
              data: [behaviorScience, behaviorCommerce, behaviorHumanities],
              backgroundColor: "rgba(54,162,235,0.2)",
              borderColor: "rgba(54,162,235,1)",
            },
          ],
        },
      });
    const chart2Image = await chart2.toDataUrl();

    const chart3 = new QuickChart()
      .setWidth(400)
      .setHeight(400)
      .setConfig({
        type: "radar",
        data: {
          labels: ["Science", "Commerce", "Humanities"],
          datasets: [
            {
              label: "Mental Scores",
              data: [mentalScience, mentalCommerce, mentalHumanities],
              backgroundColor: "rgba(255,99,132,0.2)",
              borderColor: "rgba(255,99,132,1)",
            },
          ],
        },
      });
    const chart3Image = await chart3.toDataUrl();

    const totalAptitudeQs = 10;
    const chart4 = new QuickChart()
      .setWidth(300)
      .setHeight(300)
      .setConfig({
        type: "pie",
        data: {
          labels: ["Correct", "Incorrect"],
          datasets: [
            {
              data: [aptitudeScore, totalAptitudeQs - aptitudeScore],
              backgroundColor: ["#4CAF50", "#F44336"],
            },
          ],
        },
      });
    const chart4Image = await chart4.toDataUrl();

    // ---------- Embed ----------
    const chart1Embed = await pdfDoc.embedPng(chart1Image);
    const chart2Embed = await pdfDoc.embedPng(chart2Image);
    const chart3Embed = await pdfDoc.embedPng(chart3Image);
    const chart4Embed = await pdfDoc.embedPng(chart4Image);

    const pages = pdfDoc.getPages();
    while (pages.length < 6) pdfDoc.addPage();

    const page1 = pages[0];
    const page4 = pages[3];
    const page5 = pages[4];

    page1.drawImage(chart1Embed, { x: 375, y: 380, width: 250, height: 125 });
    page4.drawImage(chart2Embed, { x: 150, y: 20, width: 300, height: 300 });
    page5.drawImage(chart3Embed, { x: 150, y: 440, width: 300, height: 300 });
    page5.drawImage(chart4Embed, { x: 150, y: 100, width: 300, height: 300 });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${alpha}_Report.pdf"`
    );
    return res.end(Buffer.from(pdfBytes));

  } catch (error) {
    console.error("💥 Error generating PDF:", error);
    return res.status(500).json({ error: error.message || "Error generating PDF" });
  }
}