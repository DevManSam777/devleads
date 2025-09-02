const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// GET all documents for a lead
router.get('/lead/:leadId', documentController.getDocumentsByLead);

// GET a specific document
router.get('/:id', documentController.getDocumentById);

// upload POST a document
router.post('/lead/:leadId', documentController.uploadDocument);

// DELETE a document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;