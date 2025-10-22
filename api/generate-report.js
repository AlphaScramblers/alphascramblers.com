import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import QuickChart from "quickchart-js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      name,
      scienceScore,
      commerceScore,
      humanitiesScore,
      maxStream,
      behaviorScience = 0,
      behaviorCommerce = 0,
      behaviorHumanities = 0,
      mentalScience = 0,
      mentalCommerce = 0,
      mentalHumanities = 0,
      aptitudeScore = 0
    } = req.body;

    if (!name || !maxStream)
      return res.status(400).json({ error: "Missing required fields" });

    const firstName = name.split(" ")[0];
    const alpha = `Alpha ${firstName}`;
    const stream = maxStream.trim().toLowerCase();

    // ✅ Choose correct template
    let templateFile =
      stream === "science"
        ? "stemplate.pdf"
        : stream === "commerce"
        ? "ctemplate.pdf"
        : stream === "humanities"
        ? "htemplate.pdf"
        : "ctemplate.pdf";

    const templatePath = path.join(process.cwd(), "streamtemplates", templateFile);

    if (!fs.existsSync(templatePath))
      return res.status(404).json({ error: `Template not found: ${templateFile}` });

    // ✅ Load PDF template
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // ✅ Fill text fields
    const form = pdfDoc.getForm();
    form.getTextField("name")?.setText(String(name));
    form.getTextField("science")?.setText(String(scienceScore));
    form.getTextField("commerce")?.setText(String(commerceScore));
    form.getTextField("humanities")?.setText(String(humanitiesScore));
    form.getTextField("stream")?.setText(maxStream);
    form.getTextField("alphaname")?.setText(alpha);
    form.flatten();

    /* -----------------------------
       ✅ Generate and Embed Charts
    ----------------------------- */

    // Chart 1 - Overall Scores (Page 5)
    const chart1 = new QuickChart();
    chart1.setWidth(800);
    chart1.setHeight(400);
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
    const chart1Binary = await chart1.toBinary();
    const chart1Image = await pdfDoc.embedPng(chart1Binary);
    const page5 = pdfDoc.getPage(4);
    page5.drawImage(chart1Image, { x: 50, y: 200, width: 500, height: 300 });

    // Chart 2 - Behavior (Page 6)
    const chart2 = new QuickChart();
    chart2.setWidth(400);
    chart2.setHeight(400);
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
    const chart2Binary = await chart2.toBinary();
    const chart2Image = await pdfDoc.embedPng(chart2Binary);
    const page6 = pdfDoc.getPage(5);
    page6.drawImage(chart2Image, { x: 50, y: 400, width: 250, height: 250 });

    // Chart 3 - Mental (Page 6)
    const chart3 = new QuickChart();
    chart3.setWidth(400);
    chart3.setHeight(400);
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
    const chart3Binary = await chart3.toBinary();
    const chart3Image = await pdfDoc.embedPng(chart3Binary);
    page6.drawImage(chart3Image, { x: 330, y: 400, width: 250, height: 250 });

    // Chart 4 - Aptitude (Page 6)
    const totalAptitude = 10;
    const correct = aptitudeScore;
    const incorrect = totalAptitude - correct;

    const chart4 = new QuickChart();
    chart4.setWidth(400);
    chart4.setHeight(400);
    chart4.setConfig({
      type: 'pie',
      data: {
        labels: ['Correct', 'Incorrect'],
        datasets: [{
          data: [correct, incorrect],
          backgroundColor: ['#4e79a7', '#e15759']
        }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
    const chart4Binary = await chart4.toBinary();
    const chart4Image = await pdfDoc.embedPng(chart4Binary);
    page6.drawImage(chart4Image, { x: 180, y: 80, width: 250, height: 250 });

    // ✅ Save and send final PDF
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${alpha}_Report.pdf`);
    res.end(Buffer.from(pdfBytes));

  } catch (error) {
    console.error("💥 Error generating PDF:", error);
    res.status(500).json({ error: error.message || "Error generating PDF" });
  }
}