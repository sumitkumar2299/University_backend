const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

// User management
router.get('/users', requireAuth, requireRole('admin'), adminController.getAllUsers);
router.patch('/users/:id/approve', requireAuth, requireRole('admin'), adminController.approveUser);
router.patch('/users/:id/reject', requireAuth, requireRole('admin'), adminController.rejectUser);

// Branch CRUD
router.post('/branches', requireAuth, requireRole('admin'), adminController.createBranch);
router.get('/branches', requireAuth, requireRole('admin'), adminController.getBranches);
router.delete('/branches/:id', requireAuth, requireRole('admin'), adminController.deleteBranch);

// Semester CRUD
router.post('/semesters', requireAuth, requireRole('admin'), adminController.createSemester);
router.get('/semesters', requireAuth, requireRole('admin'), adminController.getSemesters);
router.delete('/semesters/:id', requireAuth, requireRole('admin'), adminController.deleteSemester);

// Subject CRUD
router.post('/subjects', requireAuth, requireRole('admin'), adminController.createSubject);
router.get('/subjects', requireAuth, requireRole('admin'), adminController.getSubjects);
router.delete('/subjects/:id', requireAuth, requireRole('admin'), adminController.deleteSubject);

// Upload management
router.get('/uploads', requireAuth, requireRole('admin'), adminController.getAllUploads);
router.patch('/uploads/:id/approve', requireAuth, requireRole('admin'), adminController.approveUpload);
router.patch('/uploads/:id/reject', requireAuth, requireRole('admin'), adminController.rejectUpload);
router.patch('/uploads/:id/feature', requireAuth, requireRole('admin'), adminController.featureUpload);

module.exports = router; 