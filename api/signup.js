// // import { MongoClient } from "mongodb";
// // import bcrypt from "bcryptjs";

// // const uri = process.env.MONGODB_URI; 
// // const client = new MongoClient(uri);

// // export default async function handler(req, res) {
// //   if (req.method !== "POST") {
// //     return res.status(405).json({ error: "Method not allowed" });
// //   }

// //   try {
// //     const { firstName, lastName, email, password, mobileno } = req.body;

// //     if (!firstName || !lastName || !email || !password|| !mobileno) {
// //       return res.status(400).json({ error: "All fields required" });
// //     }

// //     await client.connect();
// //     const db = client.db("myDatabase");
// //     const users = db.collection("users");

    
// //     const existingUser = await users.findOne({ email });
// //     if (existingUser) {
// //       return res.status(400).json({ error: "User already exists" });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const result = await users.insertOne({
// //       firstName,
// //       lastName,
// //       email,
// //       mobileno,
// //       password: hashedPassword,
// //     });

// //     res.status(201).json({ success: true, userId: result.insertedId });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // }
// import { MongoClient } from "mongodb";
// import bcrypt from "bcryptjs";

// const uri = process.env.MONGODB_URI; 
// const client = new MongoClient(uri);

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ success: false, message: "Method not allowed" });
//   }

//   try {
//     const { firstName, lastName, email, password, mobileno } = req.body;

//     if (!firstName || !lastName || !email || !password || !mobileno) {
//       return res.status(400).json({ success: false, message: "All fields are required" });
//     }

//     await client.connect();
//     const db = client.db("myDatabase");
//     const users = db.collection("users");

//     const existingUser = await users.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const result = await users.insertOne({
//       firstName,
//       lastName,
//       email,
//       mobileno,
//       password: hashedPassword,
//     });

//     return res.status(201).json({ success: true,result:result, userId: result.insertedId, message: "Account created successfully" });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   } finally {
//     await client.close();
//   }
// }



import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { firstName, lastName, email, mobileno, password } = req.body;

    if (!firstName || !lastName || !email || !mobileno || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    await client.connect();
    const db = client.db("myDatabase");
    const users = db.collection("users");

    const exists = await users.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await users.insertOne({
      firstName,
      lastName,
      email,
      mobileno,
      password: hashed
    });

    const token = jwt.sign({ id: newUser.insertedId }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({ success: true, token });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.close();
  }
}