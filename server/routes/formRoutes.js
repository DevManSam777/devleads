const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// GET /api/forms - Get all forms (with optional filters)
router.get('/', formController.getForms);

// GET /api/forms/search - Search forms
router.get('/search', formController.searchForms);

// GET /api/forms/:id - Get specific form
router.get('/:id', formController.getFormById);

// POST /api/forms - Create a new form
router.post('/', formController.createForm);

// PUT /api/forms/:id - Update form
router.put('/:id', formController.updateForm);

// DELETE /api/forms/:id - Delete form
router.delete('/:id', formController.deleteForm);

// POST /api/forms/:id/clone - Clone a template
router.post('/:id/clone', formController.cloneTemplate);

// POST /api/forms/:id/generate - Generate form with lead data
router.post('/:id/generate', formController.generateFormWithLeadData);

// GET /api/forms/lead/:leadId - Get Lead's forms
router.get('/lead/:leadId', formController.getFormsByLead);

module.exports = router;
