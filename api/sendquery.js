import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { queryMessage, userEmail, userName, userContact } = req.body;

  if (!queryMessage || !userEmail) {
    return res.status(400).json({ message: "Email or query missing" });
  }

  // Create Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MY_EMAIL,       // your Gmail
      pass: process.env.MY_EMAIL_PASS,  // Gmail App Password
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.MY_EMAIL,
      to: process.env.MY_EMAIL,
      subject: "New Query",
      text: `You received a new query from AlphaScramblers:\n
Name: ${userName}
Email: ${userEmail}
Contact: ${userContact}

Message:
${queryMessage}`,
    });

    // FIX: return success = true
    res.status(200).json({
      success: true,
      message: "Query sent successfully!"
    });

  } catch (error) {
    console.error("Nodemailer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send query",
      error: error.message
    });
  }
}