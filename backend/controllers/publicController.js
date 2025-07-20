const Document = require('../models/Document');

const getPublicContent = async (req, res) => {
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
    res.status(500).json({ message: 'Failed to fetch public content', error: err.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const { branch, semester } = req.query;
    if (!branch || !semester) return res.status(400).json({ message: 'Branch and semester required' });
    // Find all approved documents for the branch and semester, and get unique subjects
    const docs = await Document.find({ branch, semester, status: 'approved' });
    const subjects = [...new Set(docs.map(doc => doc.subject?.name || doc.subject))];
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: err.message });
  }
};

module.exports = { getPublicContent, getSubjects }; 