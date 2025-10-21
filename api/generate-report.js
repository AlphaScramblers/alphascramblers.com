import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // ✅ lightweight fetch for QuickChart API

// ======================================================
// 🌐 QuickChart.io graph generator (Vercel-safe)
// ======================================================
async function generateChartImage(config) {
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify(config)
  )}`;
  const response = await fetch(chartUrl);
  return Buffer.from(await response.arrayBuffer());
}

// ========== 📊 Chart Creation Helpers ==========
async function generateBarChart(title, labels, data) {
  const config = {
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
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 18 },
        },
        legend: { display: false },
      },
      scales: { y: { beginAtZero: true } },
    },
  };
  return await generateChartImage(config);
}

async function generatePieChart(correct, total) {
  const wrong = total - correct;
  const config = {
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
  };
  return await generateChartImage(config);
}

// ======================================================
// 📄 Main API Handler
// ======================================================
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

    // 🧩 Validation
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

    // 🧠 Choose correct template
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
    console.log("🧾 Using template:", templatePath);

    if (!fs.existsSync(templatePath)) {
      console.error("❌ Template file not found:", templatePath);
      return res
        .status(404)
        .json({ error: `Template not found: ${templateFile}` });
    }

    // 📄 Load PDF Template
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // ✍️ Fill basic fields
    form.getTextField("name")?.setText(String(name));
    form.getTextField("science")?.setText(String(scienceScore));
    form.getTextField("commerce")?.setText(String(commerceScore));
    form.getTextField("humanities")?.setText(String(humanitiesScore));
    form.getTextField("stream")?.setText(maxStream);
    form.getTextField("alphaname")?.setText(alpha);

    // ======================================================
    // 📊 Generate Graphs (using QuickChart)
    // ======================================================
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

    // ======================================================
    // 🖼 Embed Charts in PDF
    // ======================================================
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

    // Flatten form
    form.flatten();

    // ======================================================
    // 📦 Return Final PDF
    // ======================================================
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