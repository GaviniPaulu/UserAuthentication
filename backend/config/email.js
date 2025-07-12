// backend/config/email.js

const nodemailer = require('nodemailer');

// Create and configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gavinipaulu@gmail.com',      // Your Gmail address
    pass: 'cavh bttv grqo kyva'          // Your Gmail App Password (NOT your real password)
  }
});

// Optional: verify the connection config
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter config error:', error);
  } else {
    console.log('✅ Email transporter ready to send messages');
  }
});

module.exports = transporter;
