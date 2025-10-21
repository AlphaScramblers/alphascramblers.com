import { PDFDocument } from "pdf-lib";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, mobile, email, scienceScore, commerceScore, humanitiesScore, maxStream } = req.body;

    // ✅ Derive Alpha name
    const firstName = name.split(" ")[0];
    const alpha = `Alpha ${firstName}`;

    // ✅ Fetch the fillable PDF template hosted in /public
    const templateUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://alphascramblers.com"}/ctemplate.pdf`;
    const existingPdfBytes = await fetch(templateUrl).then((r) => r.arrayBuffer());

    // ✅ Load the PDF template
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // ✅ Fill in fields (names must match your fillable PDF’s field names exactly)
    form.getTextField("name").setText(name);
    form.getTextField("mobile").setText(mobile);
    form.getTextField("email").setText(email);
    form.getTextField("science").setText(scienceScore.toString());
    form.getTextField("commerce").setText(commerceScore.toString());
    form.getTextField("humanities").setText(humanitiesScore.toString());
    form.getTextField("stream").setText(maxStream);
    form.getTextField("alpha").setText(alpha);

    // ✅ Make fields non-editable
    form.flatten();

    // ✅ Save final PDF
    const pdfBytes = await pdfDoc.save();

    // ✅ Send it as downloadable file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${alpha}_Report.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Error generating PDF" });
  }
}