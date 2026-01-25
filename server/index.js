const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get("/", (_, res) => res.send("HashMarket API running"));

// --- AUTH ---
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from("users").insert([{ username, email, password: hashed, role: role || "buyer" }]).select().single();
    if (error) return res.status(400).json({ msg: error.message });
    const payload = { user: { id: data.id, username, role: data.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5d" }, (_, token) => res.json({ token, user: payload.user }));
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ msg: "Invalid credentials" });
    const payload = { user: { id: user.id, username: user.username, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5d" }, (_, token) => res.json({ token, user: payload.user }));
  } catch { res.status(500).send("Server error"); }
});

// --- LISTINGS (FIXED FOR MARKET PAGE) ---
app.get("/api/listings", async (req, res) => {
  try {
    const { data } = await supabase.from("listings").select("*").eq("status", "APPROVED");
    // Format "id" to "_id" so the frontend doesn't crash
    const formatted = data.map(item => ({ ...item, _id: item.id }));
    res.json(formatted);
  } catch { res.status(500).send("Server error"); }
});

module.exports = app;