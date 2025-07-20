const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  college: { type: String, required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }, // optional
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }, // optional
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComments: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', applicationSchema); 