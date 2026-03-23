const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @route POST /api/auth/register
// Role is ALWAYS forced to 'user' — admin accounts can only be created via the promote endpoint by an existing admin
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Role is always 'user' — the role field from the request body is intentionally ignored
  const user = await User.create({ name, email, password, role: 'user' });
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}));

// @route PUT /api/auth/promote/:id
// @desc Promote a user to admin (Requires admin access — both protect AND adminOnly middleware required)
router.put('/promote/:id', protect, adminOnly, asyncHandler(async (req, res, next) => {

  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount >= 3) {
    return res.status(400).json({ success: false, message: 'Admin limit reached (Maximum 3 admins allowed)' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.role = 'admin';
  await user.save();

  res.json({ success: true, message: 'User promoted to admin successfully', role: user.role });
}));

// @route POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}));

// @route GET /api/auth/me
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}));

module.exports = router;
