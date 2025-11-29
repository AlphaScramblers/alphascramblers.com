import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ success: false, message: "No token" });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { db } = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ _id: new ObjectId(decoded.id) });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileno
      }
    });

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return res.status(500).json({ success: false, message: "Invalid token" });
  }
}   