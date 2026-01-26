const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. METAMASK LOGIN (SIWE Pattern)
exports.loginWithMetamask = async (req, res) => {
  const { address, signature, message } = req.body;

  try {
    // A. Verify the signature cryptographically
    const signerAddr = ethers.verifyMessage(message, signature);
    
    // B. Check if the address matches the claim
    if (signerAddr.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ msg: "Invalid signature verification" });
    }

    // C. Find or Create User
    let user = await User.findOne({ walletAddress: address });
    if (!user) {
      user = new User({ 
        walletAddress: address, 
        role: 'buyer', // Default role
        username: `User_${address.substring(0,6)}` 
      });
      await user.save();
    }

    // D. Issue JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user._id, username: user.username, role: user.role, walletAddress: user.walletAddress } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Wallet login failed" });
  }
};

// 2. GOOGLE LOGIN
exports.loginWithGoogle = async (req, res) => {
  const { tokenId } = req.body;

  try {
    // A. Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name, picture } = ticket.getPayload();

    // B. Find or Create User
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        email, 
        username: name, 
        profileImage: picture,
        role: 'buyer',
        provider: 'google'
      });
      await user.save();
    }

    // C. Issue JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });

  } catch (err) {
    res.status(401).json({ msg: "Google authentication failed" });
  }
};