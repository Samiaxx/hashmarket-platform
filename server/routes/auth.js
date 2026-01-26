const express = require('express');
const router = express.Router();
const { login, register, loginWithMetamask, loginWithGoogle } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.post('/metamask', loginWithMetamask); // <--- New Route
router.post('/google', loginWithGoogle);     // <--- New Route

module.exports = router;