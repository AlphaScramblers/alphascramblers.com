import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { queryMessage, userEmail } = req.body;

    if (!queryMessage || !userEmail) {
      return res.status(400).json({ message: "Email or query missing" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_EMAIL_PASS, 
    }});

    try {
      await transporter.sendMail({
        from: userEmail,           
        to: process.env.MY_EMAIL, 
        subject: "New Query",
        text: queryMessage,
      });

      res.status(200).json({ message: "Query sent successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send query" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
