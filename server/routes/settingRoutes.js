const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

// Get all settings
router.get('/', settingController.getAllSettings);

// Get a specific setting
router.get('/:key', settingController.getSetting);

// Update a setting
router.put('/:key', settingController.updateSetting);

module.exports = router;