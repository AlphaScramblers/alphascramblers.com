import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import QuickChart from "quickchart-js";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, scienceScore, commerceScore, humanitiesScore, maxStream } = req.body;

    if (!name || scienceScore == null || commerceScore == null || humanitiesScore == null || !maxStream) {
      console.error("❌ Missing fields in request body:", req.body);
      return res.status(400).json({ error: "Missing required fields in request body" });
    }

    const firstName = name.split(" ")[0];
    const alpha = `Alpha ${firstName}`;
    const stream = maxStream.trim().toLowerCase();

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

    const chart1 = new QuickChart();
chart1.setConfig({
  type: 'bar',
  data: {
    labels: ['Science', 'Commerce', 'Humanities'],
    datasets: [{
      label: 'Scores',
      data: [scienceScore, commerceScore, humanitiesScore],
      backgroundColor: ['#4e79a7', '#f28e2b', '#e15759']
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } }
  }
});
const chart1Image = await pdfDoc.embedPng(await chart1.toBinary());
const page5 = pdfDoc.getPage(4);
page5.drawImage(chart1Image, { x: 50, y: 200, width: 500, height: 300 });


const chart2 = new QuickChart();
chart2.setConfig({
  type: 'pie',
  data: {
    labels: ['Behavior Science', 'Behavior Commerce', 'Behavior Humanities'],
    datasets: [{
      data: [behaviorScience, behaviorCommerce, behaviorHumanities],
      backgroundColor: ['#59a14f', '#edc948', '#b07aa1']
    }]
  },
  options: { plugins: { legend: { position: 'bottom' } } }
});
const chart2Image = await pdfDoc.embedPng(await chart2.toBinary());
const page6 = pdfDoc.getPage(5);
page6.drawImage(chart2Image, { x: 50, y: 400, width: 250, height: 250 });


const chart3 = new QuickChart();
chart3.setConfig({
  type: 'pie',
  data: {
    labels: ['Mental Science', 'Mental Commerce', 'Mental Humanities'],
    datasets: [{
      data: [mentalScience, mentalCommerce, mentalHumanities],
      backgroundColor: ['#76b7b2', '#f28e2b', '#e15759']
    }]
  },
  options: { plugins: { legend: { position: 'bottom' } } }
});
const chart3Image = await pdfDoc.embedPng(await chart3.toBinary());
page6.drawImage(chart3Image, { x: 330, y: 400, width: 250, height: 250 });


const totalAptitude = 10; // or your total aptitude questions
const correct = aptitudeScore;
const incorrect = totalAptitude - aptitudeScore;

const chart4 = new QuickChart();
chart4.setConfig({
  type: 'pie',
  data: {
    labels: ['Correct', 'Incorrect'],
    datasets: [{
      data: [correct, incorrect],
      backgroundColor: ['#4e79a7', '#e15759']
    }]
  },
  options: {
    plugins: { legend: { position: 'bottom' } }
  }
});
const chart4Image = await pdfDoc.embedPng(await chart4.toBinary());
page6.drawImage(chart4Image, { x: 180, y: 80, width: 250, height: 250 });

    const templatePath = path.join(process.cwd(),"streamtemplates", templateFile);
    console.log("🧾 Using template:", templatePath);

    if (!fs.existsSync(templatePath)) {
      console.error("❌ Template file not found:", templatePath);
      return res.status(404).json({ error: `Template not found: ${templateFile}` });
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    const fields = ["name", "science", "commerce", "humanities", "stream", "alphaname"];
    fields.forEach((field) => {
      if (!form.getFieldMaybe(field)) {
        console.warn(`⚠️ Field "${field}" missing in ${templateFile}`);
      }
    });

    form.getTextField("name")?.setText(String(name));
    form.getTextField("science")?.setText(String(scienceScore));
    form.getTextField("commerce")?.setText(String(commerceScore));
    form.getTextField("humanities")?.setText(String(humanitiesScore));
    form.getTextField("stream")?.setText(maxStream);
    form.getTextField("alphaname")?.setText(alpha);

    form.flatten();

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