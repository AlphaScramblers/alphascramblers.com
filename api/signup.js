import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../lib/mongo.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { firstName, lastName, email, mobileno, password } = req.body;

    if (!firstName || !lastName || !email || !mobileno || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const { db } = await connectDB();
    const users = db.collection("users");

    const exists = await users.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await users.insertOne({
      firstName,
      lastName,
      email,
      mobileno,
      password: hashed,
    });

    const token = jwt.sign(
      { id: user.insertedId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ success: true, token });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}