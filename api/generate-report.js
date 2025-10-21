import { PDFDocument } from "pdf-lib";
import path from "path";
import fs from "fs/promises";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, scienceScore, commerceScore, humanitiesScore, maxStream } = req.body;

  try {
    // Load your fillable PDF template
    const templatePath = path.join(process.cwd(), "public", "templates", "AlphaFinal Commerce.pdf");
    const existingPdfBytes = await fs.readFile(templatePath);

    // Load PDF and get form fields
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Fill form fields (make sure names match those in your template)
    form.getTextField("name").setText(name || "");
    form.getTextField("science").setText(String(scienceScore || 0));
    form.getTextField("commerce").setText(String(commerceScore || 0));
    form.getTextField("humanities").setText(String(humanitiesScore || 0));
    form.getTextField("stream").setText(maxStream || "");

    // "Alpha + First Name"
    const firstName = name?.split(" ")[0] || "";
    form.getTextField("alpha").setText(`Alpha ${firstName}`);

    // Flatten fields (make them uneditable)
    form.flatten();

    // Generate filled PDF
    const pdfBytes = await pdfDoc.save();

    // Send PDF back as download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${name || "report"}_report.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate report", details: err.message });
  }
}