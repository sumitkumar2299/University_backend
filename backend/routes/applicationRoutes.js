const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/', requireAuth, applicationController.submitApplication);
router.get('/', requireAuth, requireRole('admin'), applicationController.getAllApplications);
router.patch('/:id/approve', requireAuth, requireRole('admin'), applicationController.approveApplication);
router.patch('/:id/reject', requireAuth, requireRole('admin'), applicationController.rejectApplication);

module.exports = router; 