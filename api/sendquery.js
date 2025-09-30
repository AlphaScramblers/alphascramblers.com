import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { queryMessage, userEmail } = req.body;

  if (!queryMessage || !userEmail) {
    return res.status(400).json({ message: "Email or query missing" });
  }

  // Create Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MY_EMAIL,       // your Gmail
      pass: process.env.MY_EMAIL_PASS,  // Gmail App Password, no spaces
    },
  });

  try {
    await transporter.sendMail({
      from: userEmail,
      to: process.env.MY_EMAIL,
      subject: "New Query",
      text: queryMessage,
    });

    res.status(200).json({ message: "Query sent successfully!" });
  } catch (error) {
    console.error("Nodemailer error:", error);
    res.status(500).json({ message: "Failed to send query", error: error.message });
  }
}
