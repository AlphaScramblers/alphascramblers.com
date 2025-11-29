import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await client.connect();
    const db = client.db("myDatabase");
    const users = db.collection("users");

    const user = await users.findOne({ _id: new ObjectId(decoded.id) });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileno,
      }
    });

  } catch (err) {
    console.error("Profile Error:", err);
    return res.status(500).json({ success: false, message: "Invalid token or server error" });
  } finally {
    await client.close();
  }
}