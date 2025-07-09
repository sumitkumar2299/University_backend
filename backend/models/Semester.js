const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  number: { type: Number, min: 1, max: 8, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Semester', semesterSchema); 