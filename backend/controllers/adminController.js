const User = require('../models/User');
const Branch = require('../models/Branch');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Document = require('../models/Document');
const { sendEmail } = require('../utils/email');

// User management
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = 'approved';
    await user.save();
    await sendEmail({
      to: user.email,
      subject: 'Account Approved',
      html: `<p>Hi ${user.name},</p><p>Your account has been approved. You can now access all features.</p>`
    });
    res.json({ message: 'User approved', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve user', error: err.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = 'rejected';
    await user.save();
    await sendEmail({
      to: user.email,
      subject: 'Account Rejected',
      html: `<p>Hi ${user.name},</p><p>Your account has been rejected. Please contact support for more information.</p>`
    });
    res.json({ message: 'User rejected', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject user', error: err.message });
  }
};

// Branch CRUD
const createBranch = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Branch name is required' });
    const branch = new Branch({ name });
    await branch.save();
    res.status(201).json(branch);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create branch', error: err.message });
  }
};
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch branches', error: err.message });
  }
};
const deleteBranch = async (req, res) => {
  try {
    await Branch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete branch', error: err.message });
  }
};

// Semester CRUD
const createSemester = async (req, res) => {
  try {
    const { branchId, number } = req.body;
    if (!branchId || !number) return res.status(400).json({ message: 'Branch and number are required' });
    const semester = new Semester({ branch: branchId, number });
    await semester.save();
    res.status(201).json(semester);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create semester', error: err.message });
  }
};
const getSemesters = async (req, res) => {
  try {
    const { branchId } = req.query;
    const filter = branchId ? { branch: branchId } : {};
    const semesters = await Semester.find(filter);
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch semesters', error: err.message });
  }
};
const deleteSemester = async (req, res) => {
  try {
    await Semester.findByIdAndDelete(req.params.id);
    res.json({ message: 'Semester deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete semester', error: err.message });
  }
};

// Subject CRUD
const createSubject = async (req, res) => {
  try {
    const { branchId, semesterId, name } = req.body;
    if (!branchId || !semesterId || !name) return res.status(400).json({ message: 'Branch, semester, and name are required' });
    const subject = new Subject({ branch: branchId, semester: semesterId, name });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create subject', error: err.message });
  }
};
const getSubjects = async (req, res) => {
  try {
    const { branchId, semesterId } = req.query;
    const filter = {};
    if (branchId) filter.branch = branchId;
    if (semesterId) filter.semester = semesterId;
    const subjects = await Subject.find(filter);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: err.message });
  }
};
const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete subject', error: err.message });
  }
};

// Upload management
const getAllUploads = async (req, res) => {
  try {
    const { branch, semester, subject, type, status } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (semester) filter.semester = Number(semester);
    if (subject) filter.subject = subject;
    if (type) filter.type = type;
    if (status) filter.status = status;
    const docs = await Document.find(filter).populate('uploader', 'name email');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch uploads', error: err.message });
  }
};
const approveUpload = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('uploader');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.status = 'approved';
    await doc.save();
    await sendEmail({
      to: doc.uploader.email,
      subject: 'Your document has been approved',
      html: `<p>Hi ${doc.uploader.name},</p><p>Your document has been approved and is now available to all students. Thank you for your contribution!</p>`
    });
    res.json({ message: 'Document approved', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve document', error: err.message });
  }
};
const rejectUpload = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('uploader');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.status = 'rejected';
    await doc.save();
    await sendEmail({
      to: doc.uploader.email,
      subject: 'Your document has been rejected',
      html: `<p>Hi ${doc.uploader.name},</p><p>Your document was not approved. Please contact support for more information.</p>`
    });
    res.json({ message: 'Document rejected', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject document', error: err.message });
  }
};
const featureUpload = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('uploader');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.status = 'featured';
    await doc.save();
    await sendEmail({
      to: doc.uploader.email,
      subject: 'Your document is now featured!',
      html: `<p>Hi ${doc.uploader.name},</p><p>Your document has been featured by the admin. Thank you for your valuable contribution to the community!</p>`
    });
    res.json({ message: 'Document featured', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to feature document', error: err.message });
  }
};

module.exports = {
  getAllUsers,
  approveUser,
  rejectUser,
  createBranch,
  getBranches,
  deleteBranch,
  createSemester,
  getSemesters,
  deleteSemester,
  createSubject,
  getSubjects,
  deleteSubject,
  getAllUploads,
  approveUpload,
  rejectUpload,
  featureUpload,
}; 