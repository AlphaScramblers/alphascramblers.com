import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ success: false, message: "Missing token or password" });

    await client.connect();
    const db = client.db("myDatabase");
    const users = db.collection("users");

    const user = await users.findOne({ resetToken: token });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid token" });

    if (new Date(user.resetTokenExpiry) < new Date())
      return res.status(400).json({ success: false, message: "Token expired" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await users.updateOne(
      { email: user.email },
      { $set: { password: hashed }, $unset: { resetToken: "", resetTokenExpiry: "" } }
    );

    return res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    await client.close();
  }
}
