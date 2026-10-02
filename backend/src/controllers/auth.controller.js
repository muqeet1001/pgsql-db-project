import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { signToken } from "../utils/jwt.js";

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const users = await query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING user_id AS id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    const user = users[0];

    res.status(201).json({
      message: "Signup successful",
      token: signToken(user),
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already registered" });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const users = await query(
      `SELECT user_id AS id, name, email, password FROM users WHERE email = $1`,
      [email]
    );

    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    res.json({
      message: "Login successful",
      token: signToken(safeUser),
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
}
