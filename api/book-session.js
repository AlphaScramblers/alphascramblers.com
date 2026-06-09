import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // ── Auth ──
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ success: false, message: "No token" });
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { db } = await connectDB();

    // ── Verify user exists ──
    const users = db.collection("users");
    const user = await users.findOne({ _id: new ObjectId(decoded.id) });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { sessionId, sessionTitle, sessionDate, sessionTime, sessionDuration, fee, message } = req.body;

    if (!sessionId || !sessionTitle) {
      return res.status(400).json({ success: false, message: "sessionId and sessionTitle are required" });
    }

    // ── sessions collection → one doc per session, registrations array inside ──
    const sessions = db.collection("sessions");

    // Check if user already registered for this session
    const existing = await sessions.findOne({
      sessionId,
      "registrations.email": user.email
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Already registered" });
    }

    const registration = {
      userId:    user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      phone:     user.mobileno || "",
      message:   message || "",
      bookedAt:  new Date()
    };

    // Upsert — create session doc if it doesn't exist, push registration into array
    await sessions.updateOne(
      { sessionId },
      {
        $setOnInsert: {
          sessionId,
          title:    sessionTitle,
          date:     sessionDate  || "",
          time:     sessionTime  || "",
          duration: sessionDuration || "",
          fee:      fee || "0",
          createdAt: new Date()
        },
        $push: { registrations: registration }
      },
      { upsert: true }
    );

    return res.status(200).json({ success: true, message: "Registered successfully" });

  } catch (err) {
    console.error("BOOK-SESSION ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
