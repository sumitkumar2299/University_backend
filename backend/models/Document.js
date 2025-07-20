const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  type: { type: String, enum: ['Handbook', 'GATE PYQ', 'University PYQ', 'PYQ Solutions', 'Handwritten Notes'], required: true },
  fileUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'featured'], default: 'pending' },
  adminComments: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Document', documentSchema); 