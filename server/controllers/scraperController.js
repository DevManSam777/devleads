const YellowPagesScraper = require('../utils/ypScraper');
const Business = require('../models/Business');
const Hitlist = require('../models/Hitlist');

// Store active scraping jobs
const activeJobs = new Map();

// Start a new scraping job
exports.startScraping = async (req, res) => {
  try {
    const { searchTerm, location, hitlistId, maxResults = 100 } = req.body;
    
    if (!searchTerm || !location || !hitlistId) {
      return res.status(400).json({ 
        message: 'Search term, location, and hitlist ID are required' 
      });
    }

    // Verify hitlist exists
    const hitlist = await Hitlist.findById(hitlistId);
    if (!hitlist) {
      return res.status(404).json({ message: 'Hitlist not found' });
    }

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize job status
    const jobStatus = {
      id: jobId,
      status: 'starting',
      progress: 0,
      message: 'Initializing scraper...',
      results: [],
      error: null,
      startTime: new Date(),
      searchTerm,
      location,
      hitlistId
    };
    
    activeJobs.set(jobId, jobStatus);

    // Start scraping in background
    scrapeInBackground(jobId, searchTerm, location, hitlistId, maxResults);
    
    res.json({ 
      success: true, 
      jobId,
      message: 'Scraping job started'
    });
    
  } catch (error) {
    console.error('Error starting scraping job:', error);
    res.status(500).json({ message: 'Server error starting scraping job' });
  }
};

// Get job status
exports.getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobStatus = activeJobs.get(jobId);
    
    if (!jobStatus) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(jobStatus);
    
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ message: 'Server error getting job status' });
  }
};

// Cancel a scraping job
exports.cancelJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobStatus = activeJobs.get(jobId);
    
    if (!jobStatus) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Update job status to cancelled
    jobStatus.status = 'cancelled';
    jobStatus.message = 'Job cancelled by user';
    
    res.json({ success: true, message: 'Job cancelled' });
    
  } catch (error) {
    console.error('Error cancelling job:', error);
    res.status(500).json({ message: 'Server error cancelling job' });
  }
};

// Background scraping function
async function scrapeInBackground(jobId, searchTerm, location, hitlistId, maxResults = 100) {
  const jobStatus = activeJobs.get(jobId);
  let scraper = null;
  
  try {
    jobStatus.status = 'scraping';
    jobStatus.message = 'Starting to scrape businesses...';
    
    scraper = new YellowPagesScraper({
      headless: true,
      delay: 2000,
      maxRetries: 3,
      resultsLimit: maxResults
    });
    
    // Scrape with progress callback
    const businesses = await scraper.search(searchTerm, location, (message, count) => {
      if (jobStatus.status === 'cancelled') {
        throw new Error('Job cancelled');
      }
      
      jobStatus.message = message;
      jobStatus.progress = count;
    });
    
    if (jobStatus.status === 'cancelled') {
      return;
    }
    
    jobStatus.status = 'saving';
    jobStatus.message = 'Saving businesses to database...';
    jobStatus.results = businesses;
    jobStatus.totalToSave = businesses.length;
    jobStatus.savedProgress = 0;
    
    // Save businesses to database with progress updates
    const savedBusinesses = await saveBusiness(businesses, hitlistId, (savedCount, total) => {
      jobStatus.savedProgress = savedCount;
      jobStatus.message = `Saving businesses to database... (${savedCount}/${total})`;
    });
    
    // Update hitlist's lastModified and add business IDs to businesses array
    const businessIds = savedBusinesses.map(business => business._id);
    await Hitlist.findByIdAndUpdate(hitlistId, { 
      lastModified: new Date(),
      $addToSet: { businesses: { $each: businessIds } }
    });
    
    jobStatus.status = 'completed';
    jobStatus.message = `Successfully imported ${savedBusinesses.length} businesses`;
    jobStatus.savedCount = savedBusinesses.length;
    jobStatus.endTime = new Date();
    
    // Clean up job after 5 minutes
    setTimeout(() => {
      activeJobs.delete(jobId);
    }, 5 * 60 * 1000);
    
  } catch (error) {
    console.error('Scraping job failed:', error);
    
    jobStatus.status = 'error';
    jobStatus.error = error.message;
    jobStatus.message = `Scraping failed: ${error.message}`;
    jobStatus.endTime = new Date();
    
    // Clean up job after 1 minute on error
    setTimeout(() => {
      activeJobs.delete(jobId);
    }, 60 * 1000);
    
  } finally {
    if (scraper) {
      await scraper.close();
    }
  }
}

// Save businesses to database (optimized for bulk operations)
async function saveBusiness(businesses, hitlistId, progressCallback = null) {
  const savedBusinesses = [];
  const totalCount = businesses.length;
  let processedCount = 0;
  
  // Get all existing businesses in this hitlist once to avoid repeated queries
  const existingBusinesses = await Business.find({ 
    hitlistId: hitlistId 
  }, {
    businessName: 1,
    businessPhone: 1,
    'address.city': 1,
    'address.state': 1
  }).lean();
  
  // Create lookup sets for fast duplicate checking
  const phoneNameSet = new Set();
  const cityNameSet = new Set();
  
  existingBusinesses.forEach(biz => {
    if (biz.businessPhone) {
      phoneNameSet.add(`${biz.businessName}-${biz.businessPhone}`.toLowerCase());
    }
    if (biz.address?.city && biz.address?.state) {
      cityNameSet.add(`${biz.businessName}-${biz.address.city}-${biz.address.state}`.toLowerCase());
    }
  });
  
  // Process businesses in batches for better performance
  const batchSize = 10;
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    const batchPromises = [];
    
    for (const businessData of batch) {
      try {
        // Fast duplicate check using sets
        const phoneKey = businessData.businessPhone ? 
          `${businessData.businessName}-${businessData.businessPhone}`.toLowerCase() : null;
        const cityKey = businessData.address?.city && businessData.address?.state ?
          `${businessData.businessName}-${businessData.address.city}-${businessData.address.state}`.toLowerCase() : null;
        
        const isDuplicate = (phoneKey && phoneNameSet.has(phoneKey)) || 
                           (cityKey && cityNameSet.has(cityKey));
        
        if (isDuplicate) {
          console.log(`Skipping duplicate business: ${businessData.businessName}`);
          processedCount++;
          if (progressCallback) {
            progressCallback(processedCount, totalCount);
          }
          continue;
        }
        
        // Add to duplicate check sets
        if (phoneKey) phoneNameSet.add(phoneKey);
        if (cityKey) cityNameSet.add(cityKey);
        
        // Create business document
        const business = new Business({
          ...businessData,
          hitlistId: hitlistId
        });
        
        batchPromises.push(business.save());
        
      } catch (error) {
        console.error(`Error preparing business ${businessData.businessName}:`, error);
        processedCount++;
        if (progressCallback) {
          progressCallback(processedCount, totalCount);
        }
      }
    }
    
    // Save batch and update progress
    try {
      const batchResults = await Promise.all(batchPromises);
      savedBusinesses.push(...batchResults);
      processedCount += batchResults.length;
      
      if (progressCallback) {
        progressCallback(processedCount, totalCount);
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      processedCount += batchPromises.length;
      if (progressCallback) {
        progressCallback(processedCount, totalCount);
      }
    }
  }
  
  return savedBusinesses;
}

// Get list of all jobs (for debugging)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = Array.from(activeJobs.values()).map(job => ({
      id: job.id,
      status: job.status,
      progress: job.progress,
      message: job.message,
      startTime: job.startTime,
      endTime: job.endTime,
      searchTerm: job.searchTerm,
      location: job.location
    }));
    
    res.json(jobs);
    
  } catch (error) {
    console.error('Error getting all jobs:', error);
    res.status(500).json({ message: 'Server error getting jobs' });
  }
};