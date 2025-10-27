import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email/Mobile and Password required" });
    }

    await client.connect();
    const db = client.db("myDatabase");
    const users = db.collection("users");

    // ✅ Detect if input is a mobile number (10 digits only)
    let query;
    if (/^\d{10}$/.test(email)) {
      query = { mobileno: email }; // Search by mobile number
    } else {
      query = { email }; // Search by email
    }

    // Find user either by email or mobile
    const user = await users.findOne(query);
    if (!user) {
      return res.status(400).json({ success: false, message: "User Not Found" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    // ✅ Successful login
    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileno,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    await client.close();
  }
}
