import nodemailer from "nodemailer";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

async function connectToDatabase() {
  if (client) return client;
  if (!clientPromise) clientPromise = MongoClient.connect(uri);
  client = await clientPromise;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ── Save to MongoDB ──
    const dbClient = await connectToDatabase();
    const db = dbClient.db("myDatabase");
    await db.collection("contacts").insertOne({ ...req.body, at: new Date().toISOString() });

    // ── Send email (only if queryMessage present) ──
    const { queryMessage, userEmail, userName, userContact } = req.body;
    if (queryMessage && userEmail) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.MY_EMAIL, pass: process.env.MY_EMAIL_PASS },
      });
      await transporter.sendMail({
        from: process.env.MY_EMAIL,
        to: process.env.MY_EMAIL,
        subject: "New Query",
        text: `New query from AlphaScramblers:\n\nName: ${userName}\nEmail: ${userEmail}\nContact: ${userContact}\nMessage:\n${queryMessage}`,
      });
    }

    res.status(200).json({ success: true, message: "Saved successfully!" });
  } catch (error) {
    console.error("contact.js error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
