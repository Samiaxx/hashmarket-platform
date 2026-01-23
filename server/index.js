const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// --- 1. CORS CONFIGURATION (Crucial for Vercel) ---
app.use(cors({
  origin: '*', // Allow all connections
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// Handle Preflight Requests
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

// --- 2. CONNECT TO SUPABASE ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
console.log('✅ Connected to Supabase Client');

// --- 3. ROOT ROUTE (To test if server is running) ---
app.get('/', (req, res) => {
  res.send('Server is running and ready!');
});

// --- 4. MIDDLEWARE (Protect Routes) ---
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

// --- 5. ROUTES ---

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
    res.status(500).send('Server Error: ' + err.message);
  }
});

// LOGIN USER
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

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

// GET LISTINGS
app.get('/api/listings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`*, users (username)`)
      .eq('status', 'APPROVED');

    if (error) throw error;

    const formattedListings = data.map(listing => ({
      _id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      imageUrl: listing.image_url,
      sellerId: listing.seller_id,
      seller: { username: listing.users?.username || 'Unknown' }
    }));

    res.json(formattedListings);

  } catch (err) {
    console.error('Fetch Listings Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// CREATE LISTING
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

// --- 6. START SERVER (Updated for Vercel) ---

// This line allows Vercel to see your app as a Serverless Function
module.exports = app;

// This block ensures it still runs locally on your computer
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}