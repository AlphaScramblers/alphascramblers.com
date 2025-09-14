import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({success: false, message: "Method not allowed"});
  }

  try {
    const { email, password } = req.body;

     if (!email || !password) {
      return res.status(400).json({success: false, message: "Email and Password Required"});
    }

    await client.connect();
    const db = client.db("myDatabase");
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    }); 
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}