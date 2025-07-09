const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { requireAuth, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};
const upload = multer({ storage, fileFilter });

router.post('/', requireAuth, upload.single('file'), documentController.uploadDocument);
router.get('/', requireAuth, requireRole('admin'), documentController.getAllDocuments);
router.patch('/:id/approve', requireAuth, requireRole('admin'), documentController.approveDocument);
router.patch('/:id/reject', requireAuth, requireRole('admin'), documentController.rejectDocument);
router.patch('/:id/feature', requireAuth, requireRole('admin'), documentController.featureDocument);

module.exports = router; 