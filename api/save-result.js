import { connectDB } from "../lib/mongo.js";
import { ObjectId } from "mongodb";

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

    // SUPPORT BOTH string _id and ObjectId _id
    const query = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : id
    };

    const updated = await users.updateOne(
      query,
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

    if (updated.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Results saved" });

  } catch (err) {
    console.error("SAVE RESULT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}