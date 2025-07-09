const Application = require('../models/Application');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

const submitApplication = async (req, res) => {
  try {
    const { fullName, email, college, branch } = req.body;
    if (!fullName || !email || !college || !branch) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Check if user already has an application
    const existing = await Application.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Application already submitted' });
    const application = new Application({
      user: req.user._id,
      fullName,
      email,
      college,
      branch,
      status: 'pending',
    });
    await application.save();
    res.status(201).json({ message: 'Application submitted', application });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit application', error: err.message });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().populate('user', 'name email branch status');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications', error: err.message });
  }
};

const approveApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('user');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    application.status = 'approved';
    await application.save();
    // Update user status
    const user = await User.findById(application.user._id);
    user.status = 'approved';
    await user.save();
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Application Approved',
      html: `<p>Hi ${user.name},</p><p>Your application has been approved. You can now access your dashboard and upload resources.</p>`
    });
    res.json({ message: 'Application approved', application });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve application', error: err.message });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('user');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    application.status = 'rejected';
    await application.save();
    // Update user status
    const user = await User.findById(application.user._id);
    user.status = 'rejected';
    await user.save();
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Application Rejected',
      html: `<p>Hi ${user.name},</p><p>Your application has been rejected. Please contact support for more information.</p>`
    });
    res.json({ message: 'Application rejected', application });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject application', error: err.message });
  }
};

module.exports = {
  submitApplication,
  getAllApplications,
  approveApplication,
  rejectApplication,
}; 