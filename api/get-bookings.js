import jwt from "jsonwebtoken";
import { connectDB } from "../lib/mongo.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // ── Auth (optional: restrict to admin only) ──
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ success: false, message: "No token" });
    const token = auth.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET); // throws if invalid

    const { db } = await connectDB();
    const sessions = db.collection("sessions");

    const { sessionId } = req.query;

    if (sessionId) {
      // Return registrations for a specific session
      const session = await sessions.findOne({ sessionId });
      if (!session) return res.status(404).json({ success: false, message: "Session not found" });
      return res.status(200).json({
        success: true,
        sessionId:     session.sessionId,
        title:         session.title,
        date:          session.date,
        time:          session.time,
        totalBooked:   session.registrations?.length || 0,
        registrations: session.registrations || []
      });
    }

    // Return all sessions with registration counts
    const all = await sessions.find({}, {
      projection: { sessionId: 1, title: 1, date: 1, time: 1, fee: 1, registrations: 1 }
    }).toArray();

    return res.status(200).json({
      success: true,
      sessions: all.map(s => ({
        sessionId:   s.sessionId,
        title:       s.title,
        date:        s.date,
        time:        s.time,
        fee:         s.fee,
        totalBooked: s.registrations?.length || 0
      }))
    });

  } catch (err) {
    console.error("GET-BOOKINGS ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
