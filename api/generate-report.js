// import { PDFDocument } from "pdf-lib";
// import fs from "fs";
// import path from "path";
// import QuickChart from "quickchart-js";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const {
//       name,
//       scienceScore,
//       commerceScore,
//       humanitiesScore,
//       behaviorScience,
//       behaviorCommerce,
//       behaviorHumanities,
//       mentalScience,
//       mentalCommerce,
//       mentalHumanities,
//       aptitudeScore,
//       maxStream,
//     } = req.body;

//     if (
//       !name ||
//       scienceScore == null ||
//       commerceScore == null ||
//       humanitiesScore == null ||
//       !maxStream
//     ) {
//       return res
//         .status(400)
//         .json({ error: "Missing required fields in request body" });
//     }

//     const firstName = name.split("")[0];
//     const alpha = `Alpha ${firstName}`;
//     const stream = maxStream.trim().toLowerCase();

//     // Pick template
//     let templateFile;
//     switch (stream) {
//       case "commerce":
//         templateFile = "ctemplate.pdf";
//         break;
//       case "science":
//         templateFile = "stemplate.pdf";
//         break;
//       case "humanities":
//         templateFile = "htemplate.pdf";
//         break;
//       default:
//         templateFile = "ctemplate.pdf";
//     }

//     const templatePath = path.join(process.cwd(), "streamtemplates", templateFile);
//     if (!fs.existsSync(templatePath)) {
//       return res.status(404).json({ error: `Template not found: ${templateFile}` });
//     }

//     const existingPdfBytes = fs.readFileSync(templatePath);
//     const pdfDoc = await PDFDocument.load(existingPdfBytes);
//     const form = pdfDoc.getForm();

//     form.getTextField("name")?.setText(String(name));
//     form.getTextField("science")?.setText(String(scienceScore));
//     form.getTextField("commerce")?.setText(String(commerceScore));
//     form.getTextField("humanities")?.setText(String(humanitiesScore));
//     form.getTextField("stream")?.setText(maxStream);
//     form.getTextField("alphaname")?.setText(alpha);

//     form.flatten();

//     // ---------- Charts ----------
//     const chart1 = new QuickChart()
//       .setWidth(600)
//       .setHeight(300)
//       .setBackgroundColor("white")
//       .setConfig({
//         type: "doughnut",
//         data: {
//           labels: ["Science", "Commerce", "Humanities"],
//           datasets: [
//             {
//               label: "Total Scores",
//               data: [scienceScore, commerceScore, humanitiesScore],
//               backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
//             },
//           ],
//         },
//       });
//     const chart1Image = await chart1.toDataUrl();

//     const chart2 = new QuickChart()
//       .setWidth(400)
//       .setHeight(400)
//       .setConfig({
//         type: "bar",
//         data: {
//           labels: ["Science", "Commerce", "Humanities"], // X-axis labels
//           datasets: [
//             {
//               data: [behaviorScience, behaviorCommerce, behaviorHumanities],
//               backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
//               borderColor: ["#4CAF50", "#2196F3", "#FFC107"],
//               borderWidth: 1
//               // ❌ remove 'labels' from here
//             }
//           ]
//         },
//         options: {
//           plugins: { legend: { display: false } },
//           scales: { y: { beginAtZero: true } }
//         }
//       });
//     const chart2Image = await chart2.toDataUrl();

//     const chart3 = new QuickChart()
//       .setWidth(400)
//       .setHeight(400)
//       .setConfig({
//         type: "bar",
//         data: {
//           labels: ["Science", "Commerce", "Humanities"], // X-axis labels
//           datasets: [
//             {
//               data: [mentalScience, mentalCommerce, mentalHumanities],
//               backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
//               borderColor: ["#4CAF50", "#2196F3", "#FFC107"],
//               borderWidth: 1
//               // ❌ remove 'labels' from here
//             }
//           ]
//         },
//         options: {
//           plugins: { legend: { display: false } },
//           scales: { y: { beginAtZero: true } }
//         }
//       });
//     const chart3Image = await chart3.toDataUrl();


//     const totalAptitudeQs = 10;
//     const chart4 = new QuickChart()
//       .setWidth(300)
//       .setHeight(300)
//       .setConfig({
//         type: "pie",
//         data: {
//           labels: ["Correct", "Incorrect"],
//           datasets: [
//             {
//               data: [aptitudeScore, totalAptitudeQs - aptitudeScore],
//               backgroundColor: ["#4CAF50", "#F44336"],
//             },
//           ],
//         },
//       });
//     const chart4Image = await chart4.toDataUrl();

//     // ---------- Embed ----------
//     const chart1Embed = await pdfDoc.embedPng(chart1Image);
//     const chart2Embed = await pdfDoc.embedPng(chart2Image);
//     const chart3Embed = await pdfDoc.embedPng(chart3Image);
//     const chart4Embed = await pdfDoc.embedPng(chart4Image);

//     const pages = pdfDoc.getPages();
//     while (pages.length < 6) pdfDoc.addPage();

//     const page1 = pages[0];
//     const page4 = pages[3];
//     const page5 = pages[4];

//     page1.drawImage(chart1Embed, { x: 375, y: 380, width: 250, height: 125 });
//     page4.drawImage(chart2Embed, { x: 150, y: 35, width: 300, height: 300 });
//     page5.drawImage(chart3Embed, { x: 150, y: 440, width: 300, height: 300 });
//     page5.drawImage(chart4Embed, { x: 150, y: 85, width: 300, height: 300 });

//     const pdfBytes = await pdfDoc.save();

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${alpha}_Report.pdf"`
//     );
//     return res.end(Buffer.from(pdfBytes));

//   } catch (error) {
//     console.error("💥 Error generating PDF:", error);
//     return res.status(500).json({ error: error.message || "Error generating PDF" });
//   }
// }
// import { PDFDocument } from "pdf-lib";
// import fs from "fs";
// import path from "path";
// import QuickChart from "quickchart-js";
// import jwt from "jsonwebtoken";
// import { ObjectId } from "mongodb";
// import { connectDB } from "../lib/mongo.js";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { token } = req.body;
//     if (!token) {
//       return res.status(400).json({ error: "Token missing" });
//     }

//     // ---------------------- VERIFY TOKEN ----------------------
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     // ---------------------- FETCH USER FROM DB ----------------------
//     const { db } = await connectDB();
//     const users = db.collection("users");

//     const user = await users.findOne({ _id: new ObjectId(userId) });

//     if (!user || !user.lastTestResult) {
//       return res.status(404).json({ error: "No test results found" });
//     }

//     const result = user.lastTestResult;

//     // ---------------------- VALUES FROM MONGODB ----------------------
//     const name = result.name;
//     const scienceScore = result.scienceScore;
//     const commerceScore = result.commerceScore;
//     const humanitiesScore = result.humanitiesScore;

//     const behaviorScience = result.behaviorScience;
//     const behaviorCommerce = result.behaviorCommerce;
//     const behaviorHumanities = result.behaviorHumanities;

//     const mentalScience = result.mentalScience;
//     const mentalCommerce = result.mentalCommerce;
//     const mentalHumanities = result.mentalHumanities;

//     const aptitudeScore = result.aptitudeScore;
//     const maxStream = result.maxStream;

//     // Alpha name
//     const firstName = name.split("")[0];
//     const alpha = `Alpha ${firstName}`;
//     const stream = maxStream.trim().toLowerCase();

//     // ---------------------- PICK TEMPLATE ----------------------
//     let templateFile;
//     switch (stream) {
//       case "commerce":
//         templateFile = "ctemplate.pdf";
//         break;
//       case "science":
//         templateFile = "stemplate.pdf";
//         break;
//       case "humanities":
//         templateFile = "htemplate.pdf";
//         break;
//       default:
//         templateFile = "ctemplate.pdf";
//     }

//     const templatePath = path.join(process.cwd(), "streamtemplates", templateFile);
//     const existingPdfBytes = fs.readFileSync(templatePath);

//     const pdfDoc = await PDFDocument.load(existingPdfBytes);
//     const form = pdfDoc.getForm();

//     // ---------------------- SET FIELDS ----------------------
//     form.getTextField("name")?.setText(String(name));
//     form.getTextField("science")?.setText(String(scienceScore));
//     form.getTextField("commerce")?.setText(String(commerceScore));
//     form.getTextField("humanities")?.setText(String(humanitiesScore));
//     form.getTextField("stream")?.setText(maxStream);
//     form.getTextField("alphaname")?.setText(alpha);

//     form.flatten();

//     // ---------------------- CHARTS ----------------------
//     const chart1 = new QuickChart()
//       .setWidth(600)
//       .setHeight(300)
//       .setBackgroundColor("white")
//       .setConfig({
//         type: "doughnut",
//         data: {
//           labels: ["Science", "Commerce", "Humanities"],
//           datasets: [
//             {
//               data: [scienceScore, commerceScore, humanitiesScore],
//               backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
//             },
//           ],
//         },
//       });

//     const chart1Image = await chart1.toDataUrl();

//     const chart2 = new QuickChart()
//       .setWidth(400)
//       .setHeight(400)
//       .setConfig({
//         type: "bar",
//         data: {
//           labels: ["Science", "Commerce", "Humanities"],
//           datasets: [
//             {
//               data: [behaviorScience, behaviorCommerce, behaviorHumanities],
//               backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
//               borderWidth: 1,
//             },
//           ],
//         },
//         options: {
//           plugins: { legend: { display: false } },
//           scales: { y: { beginAtZero: true } },
//         },
//       });

//     const chart2Image = await chart2.toDataUrl();

//     const chart3 = new QuickChart()
//       .setWidth(400)
//       .setHeight(400)
//       .setConfig({
//         type: "bar",
//         data: {
//           labels: ["Science", "Commerce", "Humanities"],
//           datasets: [
//             {
//               data: [mentalScience, mentalCommerce, mentalHumanities],
//               backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
//               borderWidth: 1,
//             },
//           ],
//         },
//         options: {
//           plugins: { legend: { display: false } },
//           scales: { y: { beginAtZero: true } },
//         },
//       });

//     const chart3Image = await chart3.toDataUrl();

//     const chart4 = new QuickChart()
//       .setWidth(300)
//       .setHeight(300)
//       .setConfig({
//         type: "pie",
//         data: {
//           labels: ["Correct", "Incorrect"],
//           datasets: [
//             {
//               data: [aptitudeScore, 10 - aptitudeScore],
//               backgroundColor: ["#4CAF50", "#F44336"],
//             },
//           ],
//         },
//       });

//     const chart4Image = await chart4.toDataUrl();

//     // ---------------------- EMBED IMAGES ----------------------
//     const chart1Embed = await pdfDoc.embedPng(chart1Image);
//     const chart2Embed = await pdfDoc.embedPng(chart2Image);
//     const chart3Embed = await pdfDoc.embedPng(chart3Image);
//     const chart4Embed = await pdfDoc.embedPng(chart4Image);

//     const pages = pdfDoc.getPages();
//     while (pages.length < 6) pdfDoc.addPage();

//     const page1 = pages[0];
//     const page4 = pages[3];
//     const page5 = pages[4];

//     page1.drawImage(chart1Embed, { x: 375, y: 380, width: 250, height: 125 });
//     page4.drawImage(chart2Embed, { x: 150, y: 35, width: 300, height: 300 });
//     page5.drawImage(chart3Embed, { x: 150, y: 440, width: 300, height: 300 });
//     page5.drawImage(chart4Embed, { x: 150, y: 85, width: 300, height: 300 });

//     const pdfBytes = await pdfDoc.save();

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${alpha}_Report.pdf"`
//     );

//     return res.end(Buffer.from(pdfBytes));

//   } catch (error) {
//     console.error("PDF ERROR:", error);
//     return res.status(500).json({ error: error.message || "PDF generation failed" });
//   }
// }
// import { PDFDocument } from "pdf-lib";
// import fs from "fs";
// import path from "path";
// import QuickChart from "quickchart-js";
// import jwt from "jsonwebtoken";
// import { ObjectId } from "mongodb";
// import { connectDB } from "../lib/mongo.js";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { token } = req.body;
//     if (!token) {
//       return res.status(400).json({ error: "Token missing" });
//     }

//     // ---------------------- VERIFY TOKEN ----------------------
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     // ---------------------- FETCH USER FROM DB ----------------------
//     const { db } = await connectDB();
//     const users = db.collection("users");

//     const user = await users.findOne({ _id: new ObjectId(userId) });

//     if (!user || !user.lastTestResult) {
//       return res.status(404).json({ error: "No test results found" });
//     }

//     const result = user.lastTestResult;

//     // ---------------------- USER DETAILS ----------------------
//     const name = `${user.firstName} ${user.lastName}`;
//     const firstName = user.firstName?.charAt(0) || "A";
//     const alpha = `Alpha ${firstName}`;

//     // ---------------------- TEST RESULTS ----------------------
//     const {
//       scienceScore,
//       commerceScore,
//       humanitiesScore,
//       behaviorScience,
//       behaviorCommerce,
//       behaviorHumanities,
//       mentalScience,
//       mentalCommerce,
//       mentalHumanities,
//       aptitudeScore,
//       maxStream,
//     } = result;

//     const stream = maxStream.trim().toLowerCase();

//     // ---------------------- PICK TEMPLATE ----------------------
//     let templateFile;
//     switch (stream) {
//       case "commerce":
//         templateFile = "ctemplate.pdf";
//         break;
//       case "science":
//         templateFile = "stemplate.pdf";
//         break;
//       case "humanities":
//         templateFile = "htemplate.pdf";
//         break;
//       default:
//         templateFile = "ctemplate.pdf";
//     }

//     const templatePath = path.join(process.cwd(), "streamtemplates", templateFile);
//     const existingPdfBytes = fs.readFileSync(templatePath);

//     const pdfDoc = await PDFDocument.load(existingPdfBytes);
//     const form = pdfDoc.getForm();

//     // ---------------------- SET FIELDS ----------------------
//     form.getTextField("name")?.setText(String(name));
//     form.getTextField("science")?.setText(String(scienceScore));
//     form.getTextField("commerce")?.setText(String(commerceScore));
//     form.getTextField("humanities")?.setText(String(humanitiesScore));
//     form.getTextField("stream")?.setText(maxStream);
//     form.getTextField("alphaname")?.setText(alpha);

//     form.flatten();

//     // ---------------------- CHARTS ----------------------
//     const chart1 = new QuickChart()
//       .setWidth(600)
//       .setHeight(300)
//       .setBackgroundColor("white")
//       .setConfig({
//         type: "doughnut",
//         data: {
//           labels: ["Science", "Commerce", "Humanities"],
//           datasets: [
//             {
//               data: [scienceScore, commerceScore, humanitiesScore],
//               backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
//             },
//           ],
//         },
//       });

//     const chart1Image = await chart1.toDataUrl();

//     const chart2 = new QuickChart()
//       .setWidth(400)
//       .setHeight(400)
//       .setConfig({
//         type: "bar",
//         data: {
//           labels: ["Science", "Commerce", "Humanities"],
//           datasets: [
//             {
//               data: [behaviorScience, behaviorCommerce, behaviorHumanities],
//               backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
//               borderWidth: 1,
//             },
//           ],
//         },
//         options: {
//           plugins: { legend: { display: false } },
//           scales: { y: { beginAtZero: true } },
//         },
//       });

//     const chart2Image = await chart2.toDataUrl();

//     const chart3 = new QuickChart()
//       .setWidth(400)
//       .setHeight(400)
//       .setConfig({
//         type: "bar",
//         data: {
//           labels: ["Science", "Commerce", "Humanities"],
//           datasets: [
//             {
//               data: [mentalScience, mentalCommerce, mentalHumanities],
//               backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
//               borderWidth: 1,
//             },
//           ],
//         },
//         options: {
//           plugins: { legend: { display: false } },
//           scales: { y: { beginAtZero: true } },
//         },
//       });

//     const chart3Image = await chart3.toDataUrl();

//     const chart4 = new QuickChart()
//       .setWidth(300)
//       .setHeight(300)
//       .setConfig({
//         type: "pie",
//         data: {
//           labels: ["Correct", "Incorrect"],
//           datasets: [
//             {
//               data: [aptitudeScore, 10 - aptitudeScore],
//               backgroundColor: ["#4CAF50", "#F44336"],
//             },
//           ],
//         },
//       });

//     const chart4Image = await chart4.toDataUrl();

//     // ---------------------- EMBED CHARTS ----------------------
//     const chart1Embed = await pdfDoc.embedPng(chart1Image);
//     const chart2Embed = await pdfDoc.embedPng(chart2Image);
//     const chart3Embed = await pdfDoc.embedPng(chart3Image);
//     const chart4Embed = await pdfDoc.embedPng(chart4Image);

//     const pages = pdfDoc.getPages();
//     while (pages.length < 6) pdfDoc.addPage();

//     const page1 = pages[0];
//     const page4 = pages[3];
//     const page5 = pages[4];

//     page1.drawImage(chart1Embed, { x: 375, y: 380, width: 250, height: 125 });
//     page4.drawImage(chart2Embed, { x: 150, y: 35, width: 300, height: 300 });
//     page5.drawImage(chart3Embed, { x: 150, y: 440, width: 300, height: 300 });
//     page5.drawImage(chart4Embed, { x: 150, y: 85, width: 300, height: 300 });

//     // ---------------------- SEND PDF ----------------------
//     const pdfBytes = await pdfDoc.save();

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${alpha}_Report.pdf"`
//     );

//     return res.end(Buffer.from(pdfBytes));

//   } catch (error) {
//     console.error("PDF ERROR:", error);
//     return res.status(500).json({ error: error.message || "PDF generation failed" });
//   }
// }
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import QuickChart from "quickchart-js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token missing" });
    }

    // ---------------------- VERIFY TOKEN ----------------------
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = decoded.id;

    // ---------------------- FETCH USER FROM DB ----------------------
    const { db } = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.lastTestResult) {
      return res.status(404).json({ error: "No test results found" });
    }

    const result = user.lastTestResult;

    // ---------------------- USER DETAILS ----------------------
    const name = `${user.firstName} ${user.lastName}`;
    const firstName = user.firstName?.charAt(0) || "A";
    const alpha = `Alpha ${firstName}`;

    // ---------------------- TEST RESULTS WITH SAFE FALLBACKS ----------------------
    const scienceScore = result.scienceScore ?? 0;
    const commerceScore = result.commerceScore ?? 0;
    const humanitiesScore = result.humanitiesScore ?? 0;

    const behaviorScience = result.behaviorScience ?? 0;
    const behaviorCommerce = result.behaviorCommerce ?? 0;
    const behaviorHumanities = result.behaviorHumanities ?? 0;

    const mentalScience = result.mentalScience ?? 0;
    const mentalCommerce = result.mentalCommerce ?? 0;
    const mentalHumanities = result.mentalHumanities ?? 0;

    const aptitudeScore = result.aptitudeScore ?? 0;

    // SAFE maxStream fallback
    const maxStream = result.maxStream || "Science";
    const stream = maxStream?.trim?.().toLowerCase() || "science";

    // ---------------------- PICK TEMPLATE ----------------------
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
    const existingPdfBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // ---------------------- SET FIELDS ----------------------
    form.getTextField("name")?.setText(name);
    form.getTextField("science")?.setText(String(scienceScore));
    form.getTextField("commerce")?.setText(String(commerceScore));
    form.getTextField("humanities")?.setText(String(humanitiesScore));
    form.getTextField("stream")?.setText(maxStream);
    form.getTextField("alphaname")?.setText(alpha);

    form.flatten();

    // ---------------------- CHARTS ----------------------
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
        type: "bar",
        data: {
          labels: ["Science", "Commerce", "Humanities"],
          datasets: [
            {
              data: [behaviorScience, behaviorCommerce, behaviorHumanities],
              backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });

    const chart2Image = await chart2.toDataUrl();

    const chart3 = new QuickChart()
      .setWidth(400)
      .setHeight(400)
      .setConfig({
        type: "bar",
        data: {
          labels: ["Science", "Commerce", "Humanities"],
          datasets: [
            {
              data: [mentalScience, mentalCommerce, mentalHumanities],
              backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });

    const chart3Image = await chart3.toDataUrl();

    const chart4 = new QuickChart()
      .setWidth(300)
      .setHeight(300)
      .setConfig({
        type: "pie",
        data: {
          labels: ["Correct", "Incorrect"],
          datasets: [
            {
              data: [aptitudeScore, 10 - aptitudeScore],
              backgroundColor: ["#4CAF50", "#F44336"],
            },
          ],
        },
      });

    const chart4Image = await chart4.toDataUrl();

    // ---------------------- EMBED IMAGES ----------------------
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
    page4.drawImage(chart2Embed, { x: 150, y: 35, width: 300, height: 300 });
    page5.drawImage(chart3Embed, { x: 150, y: 440, width: 300, height: 300 });
    page5.drawImage(chart4Embed, { x: 150, y: 85, width: 300, height: 300 });

    // ---------------------- SEND PDF ----------------------
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${alpha}_Report.pdf"`
    );

    return res.end(Buffer.from(pdfBytes));

  } catch (error) {
    console.error("PDF ERROR:", error);
    return res.status(500).json({ error: error.message || "PDF generation failed" });
  }
}