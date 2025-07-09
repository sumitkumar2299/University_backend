const Document = require('../models/Document');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const { sendEmail } = require('../utils/email');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDocument = async (req, res) => {
  try {
    const { branch, semester, subject, type } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: 'academic_resources',
      format: 'pdf',
    });
    const doc = new Document({
      uploader: req.user._id,
      branch,
      semester,
      subject,
      type,
      fileUrl: result.secure_url,
      status: 'pending',
    });
    await doc.save();
    res.status(201).json({ message: 'Document uploaded and pending verification', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find().populate('uploader', 'name email branch');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
  }
};

const approveDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('uploader');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.status = 'approved';
    await doc.save();
    // Send email to uploader
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

const rejectDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('uploader');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.status = 'rejected';
    await doc.save();
    // Send email to uploader
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

const featureDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('uploader');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.status = 'featured';
    await doc.save();
    // Send thank-you email to uploader
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

const getPublicDocuments = async (req, res) => {
  try {
    const { branch, semester, subject, type } = req.query;
    const filter = { status: { $in: ['approved', 'featured'] } };
    if (branch) filter.branch = branch;
    if (semester) filter.semester = Number(semester);
    if (subject) filter.subject = subject;
    if (type) filter.type = type;
    const docs = await Document.find(filter).populate('uploader', 'name');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch public documents', error: err.message });
  }
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  approveDocument,
  rejectDocument,
  featureDocument,
  getPublicDocuments,
}; 