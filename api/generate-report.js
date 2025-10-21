import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, mobile, email, scienceScore, commerceScore, humanitiesScore, maxStream } = req.body;

    const firstName = name.split(" ")[0];
    const alpha = `Alpha ${firstName}`;

    const templatePath = path.join(process.cwd(), "public", "ctemplate.pdf");
    const templateBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    form.getTextField("name").setText(name);
    form.getTextField("science").setText(scienceScore.toString());
    form.getTextField("commerce").setText(commerceScore.toString());
    form.getTextField("humanities").setText(humanitiesScore.toString());
    form.getTextField("stream").setText(maxStream);
    form.getTextField("alpha").setText(alpha);

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