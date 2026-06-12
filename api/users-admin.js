// /api/admin/users.js
// Returns all users from MongoDB — admin-only via secret header

import { connectDB } from "../lib/mongo.js";

const ADMIN_SECRET = "alphascramblers_admin_2025";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // Simple secret-header guard (no JWT needed for admin portal)
  const secret = req.headers["x-admin-secret"];
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const { db } = await connectDB();
    const users = await db
      .collection("users")
      .find({}, {
        projection: {
          password: 0,   // never send password hashes
          __v: 0
        }
      })
      .sort({ _id: -1 }) // newest first
      .toArray();

    // Normalize fields so the frontend always gets consistent keys
    const normalized = users.map(u => ({
      _id:          u._id?.toString(),
      firstName:    u.firstName  || u.firstname  || "",
      lastName:     u.lastName   || u.lastname   || "",
      email:        u.email      || "",
      mobileno:     u.mobileno   || u.mobileNumber || u.mobile || "",
      createdAt:    u.createdAt  || null,
    }));

    return res.status(200).json({ success: true, users: normalized });
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
