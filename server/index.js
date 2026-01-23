const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. CONNECT TO SUPABASE ---
// This uses the URL and KEY you put in your .env file
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

console.log('✅ Connected to Supabase Client');

// --- 2. MIDDLEWARE (Protect Routes) ---
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// --- 3. ROUTES ---

// REGISTER USER
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        username, 
        email, 
        password: hashedPassword, 
        role: role || 'buyer' 
      }])
      .select();

    if (error) throw error;

    // Create Token
    const user = data[0];
    const payload = { user: { id: user.id, role: user.role, username: user.username } };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    });

  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// LOGIN USER
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Create Token
    const payload = { user: { id: user.id, role: user.role, username: user.username } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    });

  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// GET ALL LISTINGS
app.get('/api/listings', async (req, res) => {
  try {
    // Get listings and join with users table to get seller name
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        users (username)
      `)
      .eq('status', 'APPROVED');

    if (error) throw error;

    // Format data for frontend (convert snake_case to camelCase)
    const formattedListings = data.map(listing => ({
      _id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      imageUrl: listing.image_url, // map database column to frontend name
      sellerId: listing.seller_id,
      seller: { username: listing.users?.username || 'Unknown' }
    }));

    res.json(formattedListings);

  } catch (err) {
    console.error('Fetch Listings Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// CREATE LISTING (Protected)
app.post('/api/listings', auth, async (req, res) => {
  try {
    const { title, description, price, category, imageUrl } = req.body;

    const { data, error } = await supabase
      .from('listings')
      .insert([{
        seller_id: req.user.id,
        title,
        description,
        price,
        category,
        image_url: imageUrl,
        status: 'APPROVED'
      }])
      .select();

    if (error) throw error;

    res.json(data[0]);

  } catch (err) {
    console.error('Create Listing Error:', err.message);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));