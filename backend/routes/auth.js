// For hidden secrets
require('dotenv').config();

// Import nodemailer
const nodemailer = require('nodemailer');

// routes/auth.js — Admin authentication
const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");

// In-memory admin users store
const adminUsers = [
  {
    id:       "admin-1",
    name:     "Store Admin",
    email:    process.env.EMAIL,     // ← Fixed to Uppercase
    password: process.env.PASSWORD,  // ← Fixed to Uppercase  
    role:     "superadmin",
    createdAt: "2026-01-01"
  }
];

// Active sessions tracking (token → userId)
const sessions = {};

// Temporary storage block for validation tokens (email → { otp, expires })
const otpResets = {};

// Configure your Gmail SMTP Transport globally using the values from .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // ← Fixed to Uppercase
    pass: process.env.PASSWORD // ← Fixed to Uppercase
  }
});

// ── Middleware: protect admin routes ─────────────
function requireAuth(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: "Unauthorised. Please log in." });
  }
  req.adminUser = adminUsers.find(u => u.id === sessions[token]);
  next();
}

// POST /api/auth/signup
router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All profile parameters are required." });
  }

  const existing = adminUsers.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: "This email registration parameter is already taken." });
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
    role: "admin",
    createdAt: new Date().toISOString().split('T')[0]
  };

  adminUsers.push(newUser);

  const token = uuidv4();
  sessions[token] = newUser.id;

  res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  // Dynamic fallback check if user forgot to configure .env profile parameters
  const targetEmail = process.env.EMAIL 
  const targetPass = process.env.PASSWORD

  let user = adminUsers.find(u => u.email === email && u.password === password);

  if (!user && email === targetEmail && password === targetPass) {
    user = adminUsers.find(u => u.id === "admin-1");
    if (user) {
      user.email = targetEmail;
      user.password = targetPass;
    }
  }

  if (!user) {
    return res.status(401).json({ error: "Invalid credential entry. Access Denied." });
  }

  const token = uuidv4();
  sessions[token] = user.id;

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token) {
    delete sessions[token];
  }
  res.json({ message: "Session tokens cleared successfully." });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  res.json({ id: req.adminUser.id, name: req.adminUser.name, email: req.adminUser.email, role: req.adminUser.role });
});

// POST /api/auth/create-admin
router.post("/create-admin", requireAuth, (req, res) => {
  if (req.adminUser.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden. Only superadmins can authorize creation sequences." });
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All parameters are required." });
  }

  const existing = adminUsers.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: "An account with this email parameter already exists." });
  }

  const newAdmin = {
    id: uuidv4(),
    name,
    email,
    password,
    role: "admin",
    createdAt: new Date().toISOString().split('T')[0]
  };

  adminUsers.push(newAdmin);
  res.status(201).json({ message: "Admin profile created successfully", user: { name: newAdmin.name, email: newAdmin.email } });
});

// ── Password Reset Endpoints ─────────────────────

// 1. POST /api/auth/forgot-password (Generates OTP & dispatches mail out cleanly)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email target parameters parameter is required." });
  }

  // Check if user exists in runtime memory array
  const user = adminUsers.find(u => u.email === email);
  if (!user && email !== (process.env.EMAIL || "admin@hearthco.com")) {
    return res.status(404).json({ error: "This email parameters is not registered in our core database." });
  }

  // Generate clean 6-digit random code string sequence
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiry window boundary marker (10 Minutes)
  otpResets[email] = {
    otp,
    expires: Date.now() + 10 * 60 * 1000
  };

  // Define tracking layout details structure securely
  const mailOptions = {
    from: `"Hearth & Co. Security" <${process.env.EMAIL}>`,
    to: email,
    subject: "Hearth & Co. — Account Authorization OTP",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #C8714A; margin-top: 0;">Security Verification Service</h2>
        <p>A request was received to re-write access parameters for your account workspace node.</p>
        <div style="background: #f4f4f5; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #666;">This security token is strictly valid for the next 10 minutes. If you did not trigger this sequence, please ignore this dispatch text parameters context.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Verification parameters code successfully transmitted to your email inbox." });
  } catch (err) {
    console.error("Nodemailer SMTP Error Context: ", err);
    res.status(500).json({ error: "Failed to transmit automated email dispatch out from SMTP server." });
  }
});

// 2. POST /api/auth/reset-password (Validates OTP values & re-writes record parameter safely)
router.post("/reset-password", (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "All parameters (email, code token, new password) are required." });
  }

  const record = otpResets[email];
  if (!record || record.otp !== otp.trim()) {
    return res.status(400).json({ error: "Invalid verification code. Please double-check your inbox code parameters." });
  }

  if (Date.now() > record.expires) {
    delete otpResets[email];
    return res.status(400).json({ error: "This authorization code has expired. Please request a new one." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must register at least 6 characters." });
  }

  const user = adminUsers.find(u => u.email === email);
  if (user) {
    user.password = newPassword;
  }

  delete otpResets[email]; // Clear token instance memory allocation context space cleanly
  res.json({ message: "Credentials modified successfully! You can now log into your console." });
});

module.exports = { router, requireAuth };