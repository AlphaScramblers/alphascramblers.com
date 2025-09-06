import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI; 
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    await client.connect();
    const db = client.db("myDatabase");
    const users = db.collection("users");

    
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ success: true, userId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
