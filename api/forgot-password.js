import { MongoClient } from "mongodb";
import crypto from "crypto";
import nodemailer from "nodemailer";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    await client.connect();
    const db = client.db("myDatabase");
    const users = db.collection("users");

    const user = await users.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await users.updateOne(
      { email },
      { $set: { resetToken: token, resetTokenExpiry: expiry } }
    );

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/resetpassword.html?token=${token}`;

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"AlphaScramblers" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Link",
      html: `
        <h2>AlphaScramblers Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" target="_blank" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none;">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.status(200).json({ success: true, message: "Reset link sent to email" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    await client.close();
  }
}
