import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, scienceScore, commerceScore, humanitiesScore, maxStream } = req.body;

    // 🧩 Validate incoming data
    if (!name || scienceScore == null || commerceScore == null || humanitiesScore == null || !maxStream) {
      console.error("❌ Missing fields in request body:", req.body);
      return res.status(400).json({ error: "Missing required fields in request body" });
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

    // 🗂 Template path (Vercel/public-safe)
    const templatePath = path.join(process.cwd(),"streamtemplates", templateFile);
    console.log("🧾 Using template:", templatePath);

    if (!fs.existsSync(templatePath)) {
      console.error("❌ Template file not found:", templatePath);
      return res.status(404).json({ error: `Template not found: ${templateFile}` });
    }

    // 📄 Load and modify the PDF
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // ✅ Check field existence
    const fields = ["name", "science", "commerce", "humanities", "stream", "alphaname"];
    fields.forEach((field) => {
      if (!form.getFieldMaybe(field)) {
        console.warn(`⚠️ Field "${field}" missing in ${templateFile}`);
      }
    });

    // ✍️ Fill fields safely
    form.getTextField("name")?.setText(String(name));
    form.getTextField("science")?.setText(String(scienceScore));
    form.getTextField("commerce")?.setText(String(commerceScore));
    form.getTextField("humanities")?.setText(String(humanitiesScore));
    form.getTextField("stream")?.setText(maxStream);
    form.getTextField("alphaname")?.setText(alpha);

    form.flatten();

    // 📦 Send generated PDF
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