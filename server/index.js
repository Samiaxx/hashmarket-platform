const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

/* ===============================
   CORS + BODY
================================ */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ===============================
   SUPABASE
================================ */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* ===============================
   AUTH MIDDLEWARE
================================ */
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

/* ===============================
   ROOT
================================ */
app.get("/", (_, res) => {
  res.send("HashMarket API running");
});

/* ===============================
   AUTH
================================ */
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          email,
          password: hashed,
          role: role || "buyer"
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const payload = { user: { id: data.id, username, role: data.role } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5d" }, (_, token) => {
      res.json({ token, user: payload.user });
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = {
      user: { id: user.id, username: user.username, role: user.role }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5d" }, (_, token) => {
      res.json({ token, user: payload.user });
    });
  } catch {
    res.status(500).send("Server error");
  }
});

/* ===============================
   SELLER PROFILE
================================ */
app.get("/api/sellers/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const { data: seller } = await supabase
      .from("users")
      .select("id, username, avatar, bio, location")
      .eq("username", username)
      .single();

    if (!seller) return res.status(404).json({ msg: "Seller not found" });

    const { data: listings } = await supabase
      .from("listings")
      .select("id")
      .eq("seller_id", seller.id)
      .eq("status", "APPROVED");

    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("seller_id", seller.id);

    const rating =
      reviews.length > 0
        ? (
            reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
          ).toFixed(1)
        : null;

    res.json({
      ...seller,
      products: listings.length,
      reviews: reviews.length,
      rating
    });
  } catch {
    res.status(500).send("Server error");
  }
});

/* ===============================
   LISTINGS
================================ */
app.get("/api/listings", async (req, res) => {
  const { seller } = req.query;

  try {
    let query = supabase
      .from("listings")
      .select("*")
      .eq("status", "APPROVED");

    if (seller) {
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("username", seller)
        .single();

      if (user) query = query.eq("seller_id", user.id);
    }

    const { data } = await query;
    res.json(data);
  } catch {
    res.status(500).send("Server error");
  }
});

app.post("/api/listings", auth, async (req, res) => {
  const { title, description, price, category, imageUrl } = req.body;

  try {
    const { data } = await supabase
      .from("listings")
      .insert([
        {
          seller_id: req.user.id,
          title,
          description,
          price,
          category,
          image_url: imageUrl,
          status: "APPROVED"
        }
      ])
      .select()
      .single();

    res.json(data);
  } catch {
    res.status(500).send("Server error");
  }
});

/* ===============================
   REVIEWS
================================ */
app.get("/api/reviews/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const { data: seller } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (!seller) return res.json([]);

    const { data } = await supabase
      .from("reviews")
      .select(
        `
        rating,
        comment,
        created_at,
        users:buyer_id (username)
      `
      )
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false });

    res.json(data);
  } catch {
    res.status(500).send("Server error");
  }
});

/* ===============================
   EXPORT
================================ */
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log("Server running on", PORT));
}
