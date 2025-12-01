import { connectDB } from "../lib/mongo.js";
import { ObjectId } from "mongodb";   // <-- REQUIRED IMPORT

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { id, name, email, results } = req.body;

    if (!id || !results) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const { db } = await connectDB();
    const users = db.collection("users");

    const updated = await users.updateOne(
      { _id: new ObjectId(id) },   // <--- VALID OBJECT ID
      {
        $set: {
          lastTestResult: {
            name,
            email,
            ...results,
            updatedAt: new Date()
          }
        }
      }
    );

    // OPTIONAL: Check matched user
    if (updated.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Results saved" });

  } catch (err) {
    console.error("SAVE RESULT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
