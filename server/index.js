const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURATION ---
const DB_FILE = path.join(__dirname, 'data.json');
const JWT_SECRET = 'superSecretKey2026'; // In production, use .env
const PORT = 5000;

// --- DATABASE HELPERS ---
const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = { users: [], listings: [], orders: [], messages: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], listings: [], orders: [], messages: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- AUTH MIDDLEWARE ---
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// ================= ROUTES =================

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  const db = readDB();

  if (db.users.find(u => u.email === email)) return res.status(400).json({ msg: 'User exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    role: role || 'buyer',
    createdAt: new Date()
  };

  db.users.push(newUser);
  writeDB(db);

  const payload = { user: { id: newUser.id, role: newUser.role, username: newUser.username } };
  jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
    if (err) throw err;
    res.json({ token, user: { id: newUser.id, username, role: newUser.role } });
  });
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

  const payload = { user: { id: user.id, role: user.role, username: user.username } };
  jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
    if (err) throw err;
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});

// 3. GET LISTINGS (PUBLIC MARKET)
app.get('/api/listings', (req, res) => {
  const db = readDB();
  const active = db.listings.filter(l => l.status === 'APPROVED').map(l => {
      const seller = db.users.find(u => u.id === l.sellerId);
      return { ...l, seller: { username: seller ? seller.username : 'Unknown' } };
    });
  res.json(active);
});

// 4. GET SELLER SPECIFIC LISTINGS (FOR PROFILE/OFFERS)
app.get('/api/listings/seller/:id', auth, (req, res) => {
  const db = readDB();
  const sellerItems = db.listings.filter(l => l.sellerId === req.params.id && l.status === 'APPROVED');
  res.json(sellerItems);
});

// 5. GET PUBLIC USER PROFILE
app.get('/api/users/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  
  // Calculate Stats
  const salesCount = (db.orders || []).filter(o => o.sellerId === user.id).length;
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    joinDate,
    salesCount,
    trustScore: Math.min(100, 50 + (salesCount * 10)) // Base 50 + 10 per sale (Max 100)
  });
});

// 6. CREATE LISTING
app.post('/api/listings', auth, (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ msg: 'Sellers only' });
  const db = readDB();
  const newListing = {
    _id: Date.now().toString(),
    sellerId: req.user.id,
    title: req.body.title,
    description: req.body.description,
    price: parseFloat(req.body.price),
    category: req.body.category,
    imageUrl: req.body.imageUrl || '', 
    status: 'PENDING',
    createdAt: new Date()
  };
  db.listings.push(newListing);
  writeDB(db);
  res.json(newListing);
});

// 7. ADMIN LISTINGS (PENDING)
app.get('/api/admin/listings', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  const db = readDB();
  const pending = db.listings.filter(l => l.status === 'PENDING').map(l => {
      const seller = db.users.find(u => u.id === l.sellerId);
      return { ...l, seller: { username: seller ? seller.username : 'Unknown' } };
    });
  res.json(pending);
});

// 8. MODERATE LISTING (APPROVE/REJECT)
app.put('/api/admin/moderate/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  const db = readDB();
  const index = db.listings.findIndex(l => l._id === req.params.id);
  if (index === -1) return res.status(404).json({ msg: 'Not found' });
  db.listings[index].status = req.body.status;
  writeDB(db);
  res.json(db.listings[index]);
});

// 9. CREATE ORDER (CRYPTO PAYMENT)
app.post('/api/orders', auth, (req, res) => {
  const db = readDB();
  const { listingId, customPrice } = req.body;
  const index = db.listings.findIndex(l => l._id === listingId);
  if (index === -1) return res.status(404).json({ msg: 'Not found' });
  
  if (db.listings[index].status === 'SOLD') return res.status(400).json({ msg: 'Item already sold' });
  if (db.listings[index].sellerId === req.user.id) return res.status(400).json({ msg: 'Cannot buy own item' });

  // Use negotiated price if available, else list price
  const finalPrice = customPrice ? parseFloat(customPrice) : db.listings[index].price;

  // Mark item as SOLD so it disappears from market
  db.listings[index].status = 'SOLD';
  
  const newOrder = {
    id: Date.now().toString(),
    buyerId: req.user.id,
    sellerId: db.listings[index].sellerId,
    listingId,
    amount: finalPrice,
    paymentMethod: 'crypto',
    status: 'PAID', // Initial status for Escrow (Money Locked)
    date: new Date()
  };
  
  if(!db.orders) db.orders = [];
  db.orders.push(newOrder);
  writeDB(db);
  res.json({ msg: 'Success', order: newOrder });
});

// 10. UPDATE ORDER STATUS (ESCROW WORKFLOW)
app.put('/api/orders/:id/status', auth, (req, res) => {
  const db = readDB();
  const { status } = req.body; // 'SHIPPED', 'COMPLETED' (Funds Released)
  
  const index = db.orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ msg: 'Order not found' });
  
  const order = db.orders[index];

  // Logic: Seller can mark SHIPPED. Buyer can mark COMPLETED.
  if (req.user.role === 'seller') {
      if (order.sellerId !== req.user.id) return res.status(403).json({ msg: 'Not your order' });
      if (status !== 'SHIPPED') return res.status(400).json({ msg: 'Sellers can only mark as shipped' });
  } 
  else if (req.user.role === 'buyer') {
      if (order.buyerId !== req.user.id) return res.status(403).json({ msg: 'Not your order' });
      if (status !== 'COMPLETED') return res.status(400).json({ msg: 'Buyers can only confirm receipt' });
  }

  // Update Status
  db.orders[index].status = status;
  
  // Notification System
  const targetId = req.user.role === 'seller' ? order.buyerId : order.sellerId;
  const text = status === 'SHIPPED' 
    ? `Order #${order.id.slice(-4)} has been SHIPPED!` 
    : `Order #${order.id.slice(-4)} completed. Funds released!`;

  db.messages.push({
    id: Date.now().toString(),
    fromId: 'SYSTEM',
    toId: targetId,
    text,
    type: 'system',
    timestamp: new Date()
  });

  writeDB(db);
  res.json(db.orders[index]);
});

// 11. DASHBOARD DATA
app.get('/api/dashboard', auth, (req, res) => {
  const db = readDB();
  const purchases = (db.orders || []).filter(o => o.buyerId === req.user.id).map(o => {
    const item = db.listings.find(l => l._id === o.listingId);
    return { ...o, itemTitle: item ? item.title : 'Deleted Item', itemType: item ? item.category : 'physical' };
  });
  const sales = (db.orders || []).filter(o => o.sellerId === req.user.id).map(o => {
    const item = db.listings.find(l => l._id === o.listingId);
    return { ...o, itemTitle: item ? item.title : 'Deleted Item', itemType: item ? item.category : 'physical' };
  });
  res.json({ purchases, sales });
});

// 12. SEND MESSAGE / OFFER
app.post('/api/messages', auth, (req, res) => {
  const db = readDB();
  const { toId, text, type, offerData } = req.body;
  if (!db.messages) db.messages = [];
  
  const newMessage = { 
    id: Date.now().toString(), 
    fromId: req.user.id, 
    toId, 
    text: text || '', 
    type: type || 'text', // 'text', 'offer', 'system'
    offerData: offerData || null, 
    timestamp: new Date() 
  };
  
  db.messages.push(newMessage);
  writeDB(db);
  res.json(newMessage);
});

// 13. ACCEPT OFFER
app.put('/api/messages/offer/:msgId', auth, (req, res) => {
  const db = readDB();
  const index = db.messages.findIndex(m => m.id === req.params.msgId);
  if (index === -1) return res.status(404).json({ msg: 'Message not found' });
  
  if (db.messages[index].offerData) {
    db.messages[index].offerData.status = req.body.status; // 'accepted'
    // Notify buyer
    const sysMsg = {
        id: Date.now().toString(), fromId: 'SYSTEM', toId: db.messages[index].fromId,
        text: `Offer for $${db.messages[index].offerData.price} was ACCEPTED!`, type: 'system', timestamp: new Date()
    };
    db.messages.push(sysMsg);
  }
  
  writeDB(db);
  res.json(db.messages[index]);
});

// 14. GET CHAT HISTORY
app.get('/api/messages/:partnerId', auth, (req, res) => {
  const db = readDB();
  const history = (db.messages || []).filter(m => 
    (m.fromId === req.user.id && m.toId === req.params.partnerId) || 
    (m.fromId === req.params.partnerId && m.toId === req.user.id) ||
    (m.fromId === 'SYSTEM' && m.toId === req.user.id) // Include system alerts
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  res.json(history);
});

// 15. GET INBOX
app.get('/api/inbox', auth, (req, res) => {
  const db = readDB();
  const contacts = new Set();
  (db.messages || []).forEach(m => {
    if (m.fromId !== 'SYSTEM') {
      if (m.fromId === req.user.id) contacts.add(m.toId);
      if (m.toId === req.user.id) contacts.add(m.fromId);
    }
  });
  const inbox = Array.from(contacts).map(contactId => {
    const user = db.users.find(u => u.id === contactId);
    return { userId: contactId, username: user ? user.username : 'Unknown User' };
  });
  res.json(inbox);
});

// 16. MAGIC SEED (UNSPLASH IMAGES)
app.post('/api/admin/seed', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  const db = readDB();
  const products = [
    { title: "Apple MacBook Pro M2", price: 1299.99, category: "physical", description: "M2 Pro chip, 16GB RAM, 512GB SSD. Space Gray.", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800" },
    { title: "Sony WH-1000XM5", price: 348.00, category: "physical", description: "Noise canceling wireless headphones.", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800" },
    { title: "PlayStation 5 Console", price: 499.00, category: "physical", description: "Ultra-high speed SSD.", imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800" },
    { title: "Canon EOS R6 Camera", price: 2499.00, category: "physical", description: "Full-frame mirrorless camera.", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800" },
    { title: "Bitcoin Trading Bot", price: 199.00, category: "digital", description: "Automated Python trading script.", imageUrl: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=800" },
    { title: "React JS Course", price: 49.99, category: "digital", description: "Full stack masterclass.", imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800" }
  ];
  const newItems = products.map(item => ({
    _id: Date.now().toString() + Math.random().toString().slice(2,5),
    sellerId: req.user.id, title: item.title, description: item.description, price: item.price, category: item.category, imageUrl: item.imageUrl, status: 'APPROVED', createdAt: new Date()
  }));
  db.listings.push(...newItems);
  writeDB(db);
  res.json({ msg: `Imported products` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT} (Using Local File DB)`));