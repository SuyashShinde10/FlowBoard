const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists with this email' });

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ user, token: generateToken(user._id) });
};

// @POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ user, token: generateToken(user._id) });
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true, runValidators: true });
  res.json(user);
};

// @PUT /api/auth/password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
};

// @PUT /api/auth/avatar
const uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.file.path }, { new: true });
  res.json({ user });
};

module.exports = { register, login, getMe, updateProfile, changePassword, uploadAvatar };
