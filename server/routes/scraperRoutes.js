const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

// Start scraping job
router.post('/search', scraperController.startScraping);

// Get job status
router.get('/job/:jobId', scraperController.getJobStatus);

// Cancel job
router.delete('/job/:jobId', scraperController.cancelJob);

// Get all jobs (for debugging)
router.get('/jobs', scraperController.getAllJobs);

module.exports = router;