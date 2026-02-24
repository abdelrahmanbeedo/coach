const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
// Normalize email for lookups and storage
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const emailNorm = normalizeEmail(email);
    const usernameTrim = (username || '').trim();
    const passwordTrim = (password || '').trim();

    if (!usernameTrim || !emailNorm || !passwordTrim) {
      return res.status(400).json({ message: 'All fields required' });
    }
    if (passwordTrim.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let user = await User.findOne({ email: emailNorm });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    user = new User({ username: usernameTrim, email: emailNorm, password: passwordTrim, role: role || 'client' });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const emailNorm = normalizeEmail(req.body.email);
    const passwordTrim = (req.body.password || '').trim();

    if (!emailNorm || !passwordTrim) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find by email (case-insensitive so existing DB entries still match)
    const user = await User.findOne({
      email: new RegExp('^' + emailNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i'),
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(passwordTrim);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});
// Get current user (protected route)
router.get('/me', authMiddleware, async (req, res) => {
try {
const user = await User.findById(req.user.userId).select('-password');
res.json(user);
} catch(err) {
res.status(500).json({ message: err.message });
}
});

// Update current user's profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const updates = {};
    const allowed = ['username', 'bio', 'weight', 'height', 'avatarUrl'];
    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) updates[k] = req.body[k];
    });

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;