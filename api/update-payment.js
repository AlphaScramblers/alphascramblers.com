import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { token, paymentDone } = req.body;

    if (!token || paymentDone == null) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { db } = await connectDB();
    const users = db.collection("users");

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { paymentDone: paymentDone } }
    );

    return res.json({ success: true, message: "Payment status updated" });

  } catch (err) {
    console.error("Payment update error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}