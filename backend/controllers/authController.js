const User = require('../models/User');
const { signToken, verifyToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { name, email, password, college, branch } = req.body;
    if (!name || !email || !password || !branch) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = new User({
      name,
      email,
      passwordHash: password,
      college,
      branch,
      emailVerified: false,
      status: 'pending',
    });
    await user.save();
    // Send welcome/verification email
    const token = signToken({ id: user._id, email: user.email }, '1d');
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Welcome to NoteCraft! Please verify your email',
      html: `<p>Hi ${user.name},</p>
        <p>Welcome to NoteCraft! Your registration was successful. Your application will be verified within 7 days. Please stay updated for approval or rejection.</p>
        <p>To verify your email, click <a href="${verifyUrl}">here</a>.</p>`
    });
    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.emailVerified) return res.status(403).json({ message: 'Please verify your email first' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken({ id: user._id, role: user.role });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'No token provided' });
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    if (user.emailVerified) return res.json({ message: 'Email already verified' });
    user.emailVerified = true;
    user.status = 'pending';
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token', error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No user with that email' });
    const token = signToken({ id: user._id }, '15m');
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Hi ${user.name},</p><p>Reset your password by clicking <a href="${resetUrl}">here</a>. This link expires in 15 minutes.</p>`
    });
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset email', error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password required' });
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    user.passwordHash = password;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token', error: err.message });
  }
};

const applicationStatus = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ status: user.status });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch application status', error: err.message });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  applicationStatus,
}; 