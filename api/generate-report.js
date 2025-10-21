import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import { createCanvas } from "canvas";
import Chart from "chart.js/auto";

//
// ==========  🧠 Chart Generators  ==========
//
async function generateBarChart(title, labels, data) {
  const width = 600;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: title,
          data,
          backgroundColor: ["#007bff", "#ffc107", "#28a745"],
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 18 },
        },
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  });

  return canvas.toBuffer("image/png");
}

async function generatePieChart(correct, total) {
  const wrong = total - correct;
  const width = 500,
    height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Correct", "Incorrect"],
      datasets: [
        {
          data: [correct, wrong],
          backgroundColor: ["#28a745", "#dc3545"],
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Aptitude Accuracy (${correct}/${total})`,
          font: { size: 18 },
        },
      },
    },
  });

  return canvas.toBuffer("image/png");
}

//
// ==========  📄 Main API Handler  ==========
//
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
      maxStream,
      behaviorScience,
      behaviorCommerce,
      behaviorHumanities,
      mentalScience,
      mentalCommerce,
      mentalHumanities,
      correctAptitude,
      totalAptitude,
    } = req.body;

    // 🧩 Validate incoming data
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

    // 🧠 Pick correct template
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

    // 🗂 Template path
    const templatePath = path.join(process.cwd(), "streamtemplates", templateFile);
    console.log("🧾 Using template:", templatePath);

    if (!fs.existsSync(templatePath)) {
      console.error("❌ Template file not found:", templatePath);
      return res
        .status(404)
        .json({ error: `Template not found: ${templateFile}` });
    }

    // 📄 Load and modify PDF
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // ✅ Fill basic fields
    form.getTextField("name")?.setText(String(name));
    form.getTextField("science")?.setText(String(scienceScore));
    form.getTextField("commerce")?.setText(String(commerceScore));
    form.getTextField("humanities")?.setText(String(humanitiesScore));
    form.getTextField("stream")?.setText(maxStream);
    form.getTextField("alphaname")?.setText(alpha);

    //
    // ==========  📊 Generate Charts  ==========
    //
    const mentalGraph = await generateBarChart(
      "Mental and Psychology Scores",
      ["Science", "Commerce", "Humanities"],
      [mentalScience, mentalCommerce, mentalHumanities]
    );

    const behaviorGraph = await generateBarChart(
      "Behavior Scores",
      ["Science", "Commerce", "Humanities"],
      [behaviorScience, behaviorCommerce, behaviorHumanities]
    );

    const aptitudeGraph = await generatePieChart(
      correctAptitude,
      totalAptitude
    );

    //
    // ==========  🖼 Embed Charts in PDF  ==========
    //
    const mentalImg = await pdfDoc.embedPng(mentalGraph);
    const behaviorImg = await pdfDoc.embedPng(behaviorGraph);
    const aptitudeImg = await pdfDoc.embedPng(aptitudeGraph);
    const pages = pdfDoc.getPages();

    // 💬 Behavior Section → Page index 4
    pages[4].drawImage(behaviorImg, {
      x: 130,
      y: 400,
      width: 350,
      height: 200,
    });

    // 🧠 Mental Section → Page index 5
    pages[5].drawImage(mentalImg, {
      x: 130,
      y: 390,
      width: 350,
      height: 200,
    });

    // 🎯 Aptitude Section → Page index 5 (below Mental)
    pages[5].drawImage(aptitudeImg, {
      x: 150,
      y: 180,
      width: 320,
      height: 200,
    });

    // Flatten form fields
    form.flatten();

    //
    // ==========  📦 Send Final PDF  ==========
    //
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