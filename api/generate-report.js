import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, scienceScore, commerceScore, humanitiesScore, maxStream } = req.body;
    const firstName = name.split(" ")[0];
    const alpha = `Alpha ${firstName}`;

    // ✅ Determine template based on maxStream
    let templateFile;
    switch (maxStream.toLowerCase()) {
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
        templateFile = "ctemplate.pdf"; // fallback
    }

    const templatePath = path.join(process.cwd(), "streamtemplates", templateFile);
    const existingPdfBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    form.getTextField("name").setText(name);
    form.getTextField("science").setText(scienceScore.toString());
    form.getTextField("commerce").setText(commerceScore.toString());
    form.getTextField("humanities").setText(humanitiesScore.toString());
    form.getTextField("stream").setText(maxStream);
    form.getTextField("alphaname").setText(alpha);

    form.flatten();

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${alpha}_Report.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Error generating PDF" });
  }
}