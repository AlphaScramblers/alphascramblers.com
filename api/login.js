import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../lib/mongo.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email & Password required" });
    }

    const { db } = await connectDB();
    const users = db.collection("users");

    const query = /^\d{10}$/.test(email) ? { mobileno: email } : { email };
    const user = await users.findOne(query);

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ success: true, token });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}