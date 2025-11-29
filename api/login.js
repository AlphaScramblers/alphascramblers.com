// import { MongoClient } from "mongodb";
// import bcrypt from "bcryptjs";

// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri);

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ success: false, message: "Method not allowed" });
//   }

//   try {
//     const { email, password } = req.body;

//     // Check required fields
//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: "Email/Mobile and Password required" });
//     }

//     await client.connect();
//     const db = client.db("myDatabase");
//     const users = db.collection("users");

//     // ✅ Detect if input is a mobile number (10 digits only)
//     let query;
//     if (/^\d{10}$/.test(email)) {
//       query = { mobileno: email }; // Search by mobile number
//     } else {
//       query = { email }; // Search by email
//     }

//     // Find user either by email or mobile
//     const user = await users.findOne(query);
//     if (!user) {
//       return res.status(400).json({ success: false, message: "User Not Found" });
//     }

//     // Compare hashed password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: "Invalid Credentials" });
//     }

//     // ✅ Successful login
//     res.status(200).json({
//       success: true,
//       profile: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         mobileNumber: user.mobileno,
//       },
//     });
//   } catch (err) {
//     console.error("Login Error:", err);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   } finally {
//     await client.close();
//   }
// }




// import { MongoClient } from "mongodb";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri);

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ success: false, message: "Method not allowed" });
//   }

//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: "Email & Password required" });
//     }

//     await client.connect();
//     const db = client.db("myDatabase");
//     const users = db.collection("users");

//     let query = /^\d{10}$/.test(email) ? { mobileno: email } : { email };

//     const user = await users.findOne(query);
//     if (!user) return res.status(400).json({ success: false, message: "User not found" });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ success: false, message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

//     return res.status(200).json({ success: true, token });

//   } catch (err) {
//     return res.status(500).json({ success: false, message: "Server error" });
//   } finally {
//     client.close();
//   }
// }





import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

let cached = global.mongo;
if (!cached) cached = global.mongo = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  if (!cached.promise) {
    cached.promise = MongoClient.connect(uri).then((client) => {
      return {
        client,
        db: client.db("myDatabase")
      };
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email & Password are required" });
    }

    const { db } = await connectDB();
    const users = db.collection("users");

    // email OR mobile login
    const query = /^\d{10}$/.test(email) ? { mobileno: email } : { email };

    const user = await users.findOne(query);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}