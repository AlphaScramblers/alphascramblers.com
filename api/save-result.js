import { connectDB } from "../lib/mongo.js";

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

    await users.updateOne(
      { _id: new ObjectId(id) },
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

    return res.status(200).json({ success: true, message: "Results saved" });

  } catch (err) {
    console.error("SAVE RESULT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}