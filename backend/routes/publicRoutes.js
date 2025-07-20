const express = require('express');
const { getPublicDocuments } = require('../controllers/documentController');
const { getSubjects } = require('../controllers/publicController');

const router = express.Router();

router.get('/documents', getPublicDocuments);
router.get('/subjects', getSubjects);

module.exports = router; 