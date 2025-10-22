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
      console.error("❌ Missing fields in request body:", req.body);
      return res
        .status(400)
        .json({ error: "Missing required fields in request body" });
    }

    const firstName = name.split(" ")[0];
    const alpha = `Alpha ${firstName}`;
    const stream = maxStream.trim().toLowerCase();

    // Select correct PDF template
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
        console.warn(`⚠️ Unknown stream "${maxStream}", defaulting to commerce`);
        templateFile = "ctemplate.pdf";
    }

    const templatePath = path.join(process.cwd(), "streamtemplates", templateFile);
    if (!fs.existsSync(templatePath)) {
      console.error("❌ Template file not found:", templatePath);
      return res
        .status(404)
        .json({ error: `Template not found: ${templateFile}` });
    }

    // Load PDF template
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Fill form fields
    form.getTextField("name")?.setText(String(name));
    form.getTextField("science")?.setText(String(scienceScore));
    form.getTextField("commerce")?.setText(String(commerceScore));
    form.getTextField("humanities")?.setText(String(humanitiesScore));
    form.getTextField("stream")?.setText(maxStream);
    form.getTextField("alphaname")?.setText(alpha);

    form.flatten();

    // ---------- 🧠 Generate Charts ----------

    // Chart 1: Bar chart for total scores
    const chart1 = new QuickChart();
    chart1.setWidth(600).setHeight(300).setBackgroundColor("white");
    chart1.setConfig({
      type: "bar",
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
      options: {
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } },
      },
    });
    const chart1Image = await chart1.toDataUrl();

    // Chart 2: Behavior Radar
    const chart2 = new QuickChart();
    chart2.setWidth(400).setHeight(400);
    chart2.setConfig({
      type: "radar",
      data: {
        labels: ["Science", "Commerce", "Humanities"],
        datasets: [
          {
            label: "Behavior Scores",
            data: [behaviorScience, behaviorCommerce, behaviorHumanities],
            backgroundColor: "rgba(54,162,235,0.2)",
            borderColor: "rgba(54,162,235,1)",
            borderWidth: 2,
          },
        ],
      },
    });
    const chart2Image = await chart2.toDataUrl();

    // Chart 3: Mental Radar
    const chart3 = new QuickChart();
    chart3.setWidth(400).setHeight(400);
    chart3.setConfig({
      type: "radar",
      data: {
        labels: ["Science", "Commerce", "Humanities"],
        datasets: [
          {
            label: "Mental Scores",
            data: [mentalScience, mentalCommerce, mentalHumanities],
            backgroundColor: "rgba(255,99,132,0.2)",
            borderColor: "rgba(255,99,132,1)",
            borderWidth: 2,
          },
        ],
      },
    });
    const chart3Image = await chart3.toDataUrl();

    // Chart 4: Aptitude Pie
    const totalAptitudeQs = 10; // adjust as needed
    const chart4 = new QuickChart();
    chart4.setWidth(300).setHeight(300);
    chart4.setConfig({
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

    // ---------- 🖼️ Embed Charts into PDF ----------

    const chart1Embed = await pdfDoc.embedPng(chart1Image);
    const chart2Embed = await pdfDoc.embedPng(chart2Image);
    const chart3Embed = await pdfDoc.embedPng(chart3Image);
    const chart4Embed = await pdfDoc.embedPng(chart4Image);

    const pages = pdfDoc.getPages();

    // Ensure there are at least 6 pages
    while (pages.length < 6) {
      pdfDoc.addPage();
    }
    const page1 = pages[0]
    const page4 = pages[3];
    const page5 = pages[4];

    // Chart placements (adjust freely)
    page1.drawImage(chart1Embed, { x: 300, y: 250, width: 300, height: 150 });
    page4.drawImage(chart2Embed, { x: 50, y: 350, width: 250, height: 250 });
    page5.drawImage(chart3Embed, { x: 320, y: 350, width: 250, height: 250 });
    page5.drawImage(chart4Embed, { x: 200, y: 50, width: 200, height: 200 });

    // ---------- 📄 Save and Return PDF ----------
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${alpha}_Report.pdf`
    );
    res.end(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("💥 Error generating PDF:", error);
    res.status(500).json({ error: error.message || "Error generating PDF" });
  }
}