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

module.exports = { getPublicContent }; 