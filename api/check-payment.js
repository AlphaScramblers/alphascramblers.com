import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { db } = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { paymentDone: 1 } }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      paymentDone: user.paymentDone === true
    });

  } catch (err) {
    console.error("CHECK PAYMENT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
