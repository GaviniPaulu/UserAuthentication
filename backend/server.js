// ✅ Already included at the top
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const User = require('./models/user');
const app = express();

mongoose.connect(
  'mongodb+srv://gavinipaulu:rajureddy@cluster0.8oovpam.mongodb.net/userauth?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => console.log("✅ MongoDB Atlas connected"))
 .catch(err => console.error("❌ MongoDB connection error:", err));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gavinipaulu@gmail.com',
    pass: 'cavh bttv grqo kyva'
  }
});

// ✅ Token store
const tokens = {};

// ✅ Register route (already present)
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });
  await user.save();
  res.send("User registered!");
});

// ✅ 🔽 Add this BELOW register route
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  const token = Math.random().toString(36).substr(2); // Basic token
  tokens[token] = user._id;

  const resetLink = `http://localhost:5000/resetpassword.html?token=${token}`;
  await transporter.sendMail({
    from: 'gavinipaulu@gmail.com',
    to: email,
    subject: 'Password Reset',
    html: `Click <a href="${resetLink}">here</a> to reset your password`
  });

  res.send("Reset email sent");
});

// ✅ Server start
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Paste login route here
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, 'secretKey');
    res.json({ token });
  } catch (err) {
    console.error("🚨 Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
