// backend/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const transporter = require('../config/email');
const authMiddleware = require('../middleware/authmiddleware');

const router = express.Router();
const resetTokens = {}; // In-memory reset token store

// 🔐 Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.send("User registered!");
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// 🔑 Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, 'secretKey');
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📩 Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  const token = Math.random().toString(36).substr(2);
  resetTokens[token] = user._id;

  const resetLink = `http://localhost:5000/resetpassword.html?token=${token}`;
  await transporter.sendMail({
    from: 'gavinipaulu@gmail.com',
    to: email,
    subject: 'Password Reset',
    html: `Click <a href="${resetLink}">here</a> to reset your password`
  });

  res.send("Reset email sent");
});

// 🔄 Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const userId = resetTokens[token];
  if (!userId) return res.status(400).send("Invalid or expired token");

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashed });
  delete resetTokens[token];

  res.send("Password reset successful");
});

// 🔁 Change Password (protected route)
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

// 👤 Get Profile (protected route)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
