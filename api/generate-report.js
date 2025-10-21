import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

// ✅ If you're using Next.js:
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, scienceScore, commerceScore, humanitiesScore, maxStream } = req.body;

    // Derive Alpha name
    const firstName = name.split(" ")[0];
    const alpha = `Alpha ${firstName}`;

    // Load your fillable PDF template
    const templatePath = path.join(process.cwd(), "public", "ctemplate.pdf");
    const templateBytes = fs.readFileSync(templatePath);

    // Load and fill the PDF
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    // Fill fields (names must match your PDF form field names)
    form.getTextField("name").setText(name);
    form.getTextField("science").setText(scienceScore.toString());
    form.getTextField("commerce").setText(commerceScore.toString());
    form.getTextField("humanities").setText(humanitiesScore.toString());
    form.getTextField("stream").setText(maxStream);
    form.getTextField("alpha").setText(alpha);

    // Flatten to make fields non-editable
    form.flatten();

    // Save updated PDF
    const pdfBytes = await pdfDoc.save();

    // Return as downloadable PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Alpha${name}Report.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Error generating PDF" });
  }
}