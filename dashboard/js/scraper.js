import { fetchHitlists, createHitlist } from './api.js';
import { showToast } from './utils.js';

// create api object with request method 
const api = {
  request: async (endpoint, options = {}) => {
    const method = options.method || 'GET';
    
    if (endpoint.startsWith('/api/hitlists') && method === 'GET') {
      return { data: await fetchHitlists() };
    }
    
    // for other API calls, use the built-in fetch with auth headers
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.data ? JSON.stringify(options.data) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    return response.json();
  }
};

// business Scraper functionality
class BusinessScraper {
  constructor() {
    this.currentJobId = null;
    this.pollInterval = null;
    this.isPolling = false;
    this.targetHitlistId = null;
    this.lastStatusCheck = null;
    this.visibilityChangeHandler = null;
    this.completionToastShown = false;
    this.resumeTimeout = null;
    this.userViewedCompletion = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.networkErrorToastShown = false;
    this.delayedRetryTimeout = null;
  }

  async init() {
    this.setupEventListeners();
    this.setupVisibilityHandler();
  }

  setupEventListeners() {
    // find Businesses button
    const findBusinessesBtn = document.getElementById('findBusinessesBtn');
    if (findBusinessesBtn) {
      findBusinessesBtn.addEventListener('click', () => this.openScraperModal());
    }

    // slider value update
    const maxResultsSlider = document.getElementById('maxResults');
    const maxResultsValue = document.getElementById('maxResultsValue');
    
    if (maxResultsSlider && maxResultsValue) {
      maxResultsSlider.addEventListener('input', (e) => {
        maxResultsValue.textContent = e.target.value;
      });
    }

    // modal controls
    const closeModal = document.getElementById('closeScraperModal');
    const cancelBtn = document.getElementById('cancelScraperBtn');
    const scraperForm = document.getElementById('scraperForm');
    const cancelJobBtn = document.getElementById('cancelJobBtn');
    const searchAgainBtn = document.getElementById('searchAgainBtn');
    const viewHitlistBtn = document.getElementById('viewHitlistBtn');
    
    // new hitlist creation
    const createNewHitlistBtn = document.getElementById('createNewHitlistBtn');
    const quickHitlistModal = document.getElementById('quickHitlistModal');
    const closeQuickModal = document.getElementById('closeQuickHitlistModal');
    const cancelQuickBtn = document.getElementById('cancelQuickHitlistBtn');
    const quickHitlistForm = document.getElementById('quickHitlistForm');

    if (closeModal) closeModal.addEventListener('click', () => this.handleModalClose());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.handleModalClose());
    if (scraperForm) scraperForm.addEventListener('submit', (e) => this.handleSubmit(e));
    if (cancelJobBtn) cancelJobBtn.addEventListener('click', () => this.cancelCurrentJob());
    if (searchAgainBtn) searchAgainBtn.addEventListener('click', () => this.resetForm());
    if (viewHitlistBtn) viewHitlistBtn.addEventListener('click', () => this.viewTargetHitlist());
    
    if (createNewHitlistBtn) createNewHitlistBtn.addEventListener('click', () => this.openQuickHitlistModal());
    if (closeQuickModal) closeQuickModal.addEventListener('click', () => this.closeQuickHitlistModal());
    if (cancelQuickBtn) cancelQuickBtn.addEventListener('click', () => this.closeQuickHitlistModal());
    if (quickHitlistForm) quickHitlistForm.addEventListener('submit', (e) => this.handleQuickHitlistSubmit(e));

    // close modals when clicking outside but prevent during active search
    window.addEventListener('click', (event) => {
      const modal = document.getElementById('scraperModal');
      const quickModal = document.getElementById('quickHitlistModal');
      
      // don't close scraper modal if a search is in progress
      if (event.target === modal && !this.isPolling) {
        this.closeScraperModal();
      } else if (event.target === modal && this.isPolling) {
        // show warning if they try to close during search
        showToast('Do not close while searching - use Cancel to stop', 'info');
      }
      
      if (event.target === quickModal) {
        this.closeQuickHitlistModal();
      }
    });
  }

  setupVisibilityHandler() {
    // handle visibility changes (mobile hibernation/wake)
    this.visibilityChangeHandler = () => {
      if (!document.hidden && this.currentJobId && !this.isPolling) {
        // page became visible again and we have a job - resume polling
        console.log('Page visibility restored, resuming job polling');
        this.debouncedResumePolling();
      }
    };
    
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);

    // also handle page focus events for additional reliability
    window.addEventListener('focus', () => {
      if (this.currentJobId && !this.isPolling) {
        console.log('Window focus restored, resuming job polling');
        this.debouncedResumePolling();
      }
    });
  }

  debouncedResumePolling() {
    // clear any existing timeout to prevent multiple rapid calls
    if (this.resumeTimeout) {
      clearTimeout(this.resumeTimeout);
    }

    // set a small delay to debounce rapid visibility/focus events
    this.resumeTimeout = setTimeout(() => {
      this.resumePollingAfterHibernation();
      this.resumeTimeout = null;
    }, 100);
  }

  async resumePollingAfterHibernation() {
    if (!this.currentJobId) return;
    
    try {
      // immediately check job status to catch up
      console.log('Checking job status after hibernation...');
      const response = await api.request(`/api/scraper/job/${this.currentJobId}`);
      this.updateProgress(response);
      
      if (response.status === 'completed') {
        this.showCompletion(`Successfully added ${response.savedCount || response.progress} businesses to your hitlist!`);

        // only show the completion toast once per job and if user hasn't seen completion screen
        if (!this.completionToastShown && !this.userViewedCompletion) {
          showToast('Search completed while screen was off!', 'success');
          this.completionToastShown = true;
        }

        // refresh the main hitlists view
        if (typeof window.fetchAndRenderHitlists === 'function') {
          setTimeout(() => {
            window.fetchAndRenderHitlists();
          }, 500);
        }
      } else if (response.status === 'error') {
        showToast(`Search failed: ${response.error}`, 'error');
        this.resetForm();
      } else if (response.status === 'cancelled') {
        showToast('Search was cancelled', 'info');
        this.resetForm();
      } else {
        // job is still running, resume normal polling
        this.startPolling();
      }
      
    } catch (error) {
      console.error('Failed to resume job status check:', error);
      // try to resume polling anyway in case the job is still active
      this.startPolling();
    }
  }

  async openScraperModal() {
    const modal = document.getElementById('scraperModal');
    if (!modal) return;

    // load hitlists for dropdown
    await this.populateHitlistDropdown();

    // reset form state
    this.resetForm();
    
    modal.style.display = 'block';
  }

  handleModalClose() {
    // prevent closing during active search
    if (this.isPolling) {
      showToast('Do not close while searching - use Cancel to stop', 'info');
      return;
    }
    
    this.closeScraperModal();
  }

  closeScraperModal(preserveTargetHitlist = false) {
    const modal = document.getElementById('scraperModal');
    if (modal) {
      modal.style.display = 'none';
    }

    // cancel any ongoing job
    if (this.currentJobId && this.isPolling) {
      this.cancelCurrentJob();
    }

    // only clear state if we're not about to view the target hitlist
    if (!preserveTargetHitlist) {
      // clear job state and reset completion flags  
      this.currentJobId = null;
      this.targetHitlistId = null;
      this.completionToastShown = false;
      this.userViewedCompletion = false;
    }

    // clean up visibility handler
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  async populateHitlistDropdown() {
    try {
      const response = await api.request('/api/hitlists');
      const hitlists = response.data || response;
      
      const select = document.getElementById('targetHitlist');
      if (!select) return;

      // clear existing options except the first one
      select.innerHTML = '<option value="">Select a hitlist...</option>';

      // sort hitlists alphabetically by name
      const sortedHitlists = hitlists.sort((a, b) => a.name.localeCompare(b.name));

      // add hitlist options with business count info
      sortedHitlists.forEach(hitlist => {
        const option = document.createElement('option');
        option.value = hitlist._id;
        const businessCount = hitlist.businessCount || 0;
        option.textContent = `${hitlist.name} (${businessCount} businesses)`;
        select.appendChild(option);
      });

      // update info text based on selection
      select.addEventListener('change', () => this.updateHitlistInfo());
      
    } catch (error) {
      console.error('Failed to load hitlists:', error);
      showToast('Failed to load hitlists', 'error');
    }
  }

  updateHitlistInfo() {
    const select = document.getElementById('targetHitlist');
    const info = document.getElementById('hitlistInfo');
    
    if (!select || !info) return;
    
    if (select.value) {
      const selectedText = select.options[select.selectedIndex].text;
      const businessCount = selectedText.match(/\((\d+) businesses\)/)?.[1] || '0';
      
      if (parseInt(businessCount) > 0) {
        info.textContent = `New businesses will be added to this existing hitlist (currently has ${businessCount} businesses)`;
        info.style.color = 'var(--warning-color)';
      } else {
        info.textContent = 'Businesses will be added to this hitlist';
        info.style.color = 'var(--text-secondary)';
      }
    } else {
      info.textContent = 'Businesses will be added to this hitlist';
      info.style.color = 'var(--text-secondary)';
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    const searchTerm = document.getElementById('searchTerm').value.trim();
    const location = document.getElementById('searchLocation').value.trim();
    const hitlistId = document.getElementById('targetHitlist').value;
    const maxResults = parseInt(document.getElementById('maxResults').value);
    
    if (!searchTerm || !location || !hitlistId) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    this.targetHitlistId = hitlistId;
    
    try {
      const response = await api.request('/api/scraper/search', {
        method: 'POST',
        data: {
          searchTerm,
          location,
          hitlistId,
          maxResults
        }
      });
      
      if (response.success) {
        this.currentJobId = response.jobId;
        this.showProgress();
        this.startPolling();
      } else {
        showToast('Failed to start search', 'error');
      }
      
    } catch (error) {
      console.error('Failed to start scraping:', error);
      showToast('Failed to start search', 'error');
    }
  }

  openQuickHitlistModal() {
    const modal = document.getElementById('quickHitlistModal');
    if (modal) {
      modal.style.display = 'block';

      // auto-populate name and description based on search terms if available
      const searchTerm = document.getElementById('searchTerm')?.value.trim();
      const location = document.getElementById('searchLocation')?.value.trim();
      
      if (searchTerm && location) {
        const nameField = document.getElementById('quickHitlistName');
        const descriptionField = document.getElementById('quickHitlistDescription');
        
        if (nameField && !nameField.value) {
          nameField.value = searchTerm;
        }
        
        if (descriptionField && !descriptionField.value) {
          descriptionField.value = location;
        }
      }

      // focus on name field
      setTimeout(() => {
        const nameField = document.getElementById('quickHitlistName');
        if (nameField) nameField.focus();
      }, 100);
    }
  }

  closeQuickHitlistModal() {
    const modal = document.getElementById('quickHitlistModal');
    if (modal) {
      modal.style.display = 'none';

      // clear form
      const form = document.getElementById('quickHitlistForm');
      if (form) form.reset();
    }
  }

  async handleQuickHitlistSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('quickHitlistName').value.trim();
    const description = document.getElementById('quickHitlistDescription').value.trim();
    
    if (!name) {
      showToast('Hitlist name is required', 'error');
      return;
    }
    
    try {
      const newHitlist = await createHitlist({
        name,
        description: description || `Businesses found for: ${name}`
      });

      // close quick modal
      this.closeQuickHitlistModal();

      // refresh the hitlist dropdown
      await this.populateHitlistDropdown();

      // select the new hitlist
      const select = document.getElementById('targetHitlist');
      if (select) {
        select.value = newHitlist._id;
        this.updateHitlistInfo();
      }
      
      showToast('Hitlist created successfully!', 'success');
      
    } catch (error) {
      console.error('Failed to create hitlist:', error);
      showToast('Failed to create hitlist', 'error');
    }
  }

  showProgress() {
    document.getElementById('scraperForm').style.display = 'none';
    document.getElementById('scraperProgress').style.display = 'block';
    document.getElementById('scraperComplete').style.display = 'none';
  }

  showCompletion(message) {
    document.getElementById('scraperForm').style.display = 'none';
    document.getElementById('scraperProgress').style.display = 'none';
    document.getElementById('scraperComplete').style.display = 'block';
    
    const completionText = document.getElementById('completionText');
    if (completionText) {
      completionText.textContent = message;
    }

    // mark that user has viewed the completion screen
    this.userViewedCompletion = true;
  }

  resetForm() {
    // show form, hide progress and completion
    document.getElementById('scraperForm').style.display = 'block';
    document.getElementById('scraperProgress').style.display = 'none';
    document.getElementById('scraperComplete').style.display = 'none';

    // clear form fields
    document.getElementById('searchTerm').value = '';
    document.getElementById('searchLocation').value = '';
    document.getElementById('targetHitlist').value = '';

    // reset progress
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = '0 businesses found';
    document.getElementById('progressMessage').textContent = 'Ready to search...';
    document.getElementById('progressResults').style.display = 'none';

    // clear job state and reset completion flags
    this.currentJobId = null;
    this.targetHitlistId = null;
    this.completionToastShown = false;
    this.userViewedCompletion = false;
    this.retryCount = 0;
    this.networkErrorToastShown = false;
    this.stopPolling();

    // clear any pending retry timeouts
    if (this.delayedRetryTimeout) {
      clearTimeout(this.delayedRetryTimeout);
      this.delayedRetryTimeout = null;
    }
  }

  startPolling() {
    if (this.isPolling || !this.currentJobId) return;
    
    this.isPolling = true;
    this.lastStatusCheck = Date.now();
    this.retryCount = 0; // reset retry count when successfully polling
    this.networkErrorToastShown = false; // reset toast flag

    // clear any pending retry attempts since we're back to normal polling
    if (this.delayedRetryTimeout) {
      clearTimeout(this.delayedRetryTimeout);
      this.delayedRetryTimeout = null;
    }
    
    this.pollInterval = setInterval(() => this.checkJobStatus(), 2000);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
  }

  async checkJobStatus() {
    if (!this.currentJobId) {
      this.stopPolling();
      return;
    }
    
    this.lastStatusCheck = Date.now();
    
    try {
      const response = await api.request(`/api/scraper/job/${this.currentJobId}`);
      this.updateProgress(response);
      
      if (response.status === 'completed') {
        this.stopPolling();
        this.showCompletion(`Successfully added ${response.savedCount || response.progress} businesses to your hitlist!`);

        // refresh the main hitlists view to show new/updated hitlist
        if (typeof window.fetchAndRenderHitlists === 'function') {
          // refresh the main hitlists display
          setTimeout(() => {
            window.fetchAndRenderHitlists();
          }, 500);
        } else if (this.targetHitlistId && typeof window.refreshHitlistAfterImport === 'function') {
          window.refreshHitlistAfterImport(this.targetHitlistId);
        } else {
          // fallback: reload the page to show updated data
          setTimeout(() => window.location.reload(), 1000);
        }
        
      } else if (response.status === 'error') {
        this.stopPolling();
        showToast(`Search failed: ${response.error}`, 'error');
        this.resetForm();
        
      } else if (response.status === 'cancelled') {
        this.stopPolling();
        showToast('Search was cancelled', 'info');
        this.resetForm();
      }
      
    } catch (error) {
      console.error('Failed to check job status:', error);
      this.stopPolling();

      // try to recover, check if job might have completed
      this.handleNetworkError();
    }
  }

  async handleNetworkError() {
    console.log('Network error detected, attempting to recover job status...');
    this.retryCount++;

    // don't show error toast immediately - try to recover first
    if (this.currentJobId) {
      try {
        // wait a moment before retrying to handle temporary network issues
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Checking if job is still running after network error...');
        const response = await api.request(`/api/scraper/job/${this.currentJobId}`);
        
        if (response.status === 'completed') {
          this.showCompletion(`Search completed! Found ${response.savedCount || response.progress} businesses.`);
          showToast('Search completed successfully!', 'success');

          // refresh the hitlists view
          if (typeof window.fetchAndRenderHitlists === 'function') {
            setTimeout(() => {
              window.fetchAndRenderHitlists();
            }, 500);
          }
          return;
        } else if (response.status === 'scraping' || response.status === 'saving') {
          // job is still running - resume polling
          console.log('Job is still active, resuming polling...');
          this.updateProgress(response);
          this.startPolling();
          return;
        }
      } catch (retryError) {
        console.log('Recovery attempt failed:', retryError);
      }
    }

    // silent recovery - no toast spam

    // keep checking periodically but limit retries
    if (this.retryCount < this.maxRetries) {
      this.delayedRetryTimeout = setTimeout(() => {
        if (this.currentJobId && !this.isPolling) {
          console.log(`Attempting delayed recovery (${this.retryCount}/${this.maxRetries})...`);
          this.debouncedResumePolling();
        }
      }, 10000); // try again in 10 seconds
    } else {
      console.log('Max recovery attempts reached, stopping retries');
    }
  }

  updateProgress(jobStatus) {
    console.log('updateProgress called with:', jobStatus);
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressMessage = document.getElementById('progressMessage');
    const progressResults = document.getElementById('progressResults');
    const progressHeader = document.querySelector('.progress-header h4');
    
    console.log('Progress elements found:', {
      progressFill: !!progressFill,
      progressText: !!progressText,
      progressMessage: !!progressMessage,
      progressResults: !!progressResults,
      progressHeader: !!progressHeader
    });

    // update progress header with spinner for saving phase
    if (progressHeader) {
      if (jobStatus.status === 'saving') {
        progressHeader.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving to database...`;
      } else {
        progressHeader.innerHTML = `<i class="fas fa-search"></i> Searching for businesses...`;
      }
    }

    if (progressMessage) {
      // for saving phase, show a different message than header
      if (jobStatus.status === 'saving') {
        progressMessage.innerHTML = `<i class="fas fa-database"></i> Processing and checking for duplicates...`;
      } else {
        progressMessage.textContent = jobStatus.message || 'Searching...';
      }
    }

    if (progressText) {
      if (jobStatus.status === 'saving') {
        // show saving progress count
        const savedCount = jobStatus.savedProgress || 0;
        const totalCount = jobStatus.totalToSave || jobStatus.progress || 0;
        progressText.textContent = `${savedCount} of ${totalCount} processed`;
      } else {
        progressText.textContent = `${jobStatus.progress || 0} businesses found`;
      }
    }

    // update progress bar
    if (progressFill) {
      if (jobStatus.status === 'saving') {
        // show saving progress as percentage
        const savedCount = jobStatus.savedProgress || 0;
        const totalCount = jobStatus.totalToSave || 1;
        const savingProgress = (savedCount / totalCount) * 100;
        console.log(`Saving progress: ${savedCount}/${totalCount} = ${savingProgress}%`);
        progressFill.style.width = `${Math.min(savingProgress, 100)}%`;
      } else {
        // show scraping progress based on business count and target
        const businessCount = jobStatus.progress || 0;
        const maxResultsSlider = document.getElementById('maxResults');
        const targetResults = maxResultsSlider ? parseInt(maxResultsSlider.value) : 100;

        // calculate progress based on businesses found vs target, cap at 85% during scraping
        let estimatedProgress = 0;
        if (businessCount > 0 && targetResults > 0) {
          estimatedProgress = Math.min((businessCount / targetResults) * 85, 85);
        }

        // ensure minimum visual progress after businesses start appearing
        if (businessCount > 0 && estimatedProgress < 5) {
          estimatedProgress = 5;
        }
        
        console.log(`Scraping progress: ${businessCount}/${targetResults} businesses = ${estimatedProgress}%`);
        progressFill.style.width = `${estimatedProgress}%`;
      }
    } else {
      console.log('Progress fill element not found!');
    }

    // show some results preview
    if (jobStatus.results && jobStatus.results.length > 0 && progressResults) {
      this.updateResultsPreview(jobStatus.results.slice(0, 5)); // show first 5
      progressResults.style.display = 'block';
    }
  }

  updateResultsPreview(results) {
    const resultsList = document.getElementById('resultsList');
    if (!resultsList) return;
    
    resultsList.innerHTML = '';
    
    results.forEach(business => {
      const item = document.createElement('div');
      item.className = 'result-item';
      
      const phoneSpan = business.businessPhone ? 
        `<span>📞 ${business.businessPhone}</span>` : '';
      const addressSpan = business.businessCity ? 
        `<span>📍 ${business.businessCity}, ${business.businessState}</span>` : '';
      const websiteSpan = business.websiteUrl ? 
        `<span>🌐 Website</span>` : '';
      
      item.innerHTML = `
        <div class="result-name">${business.businessName || 'Unknown Business'}</div>
        <div class="result-details">
          ${phoneSpan}
          ${addressSpan}
          ${websiteSpan}
        </div>
      `;
      resultsList.appendChild(item);
    });
  }

  async cancelCurrentJob() {
    if (!this.currentJobId) return;
    
    try {
      await api.request(`/api/scraper/job/${this.currentJobId}`, {
        method: 'DELETE'
      });
      
      this.stopPolling();
      showToast('Search cancelled', 'info');
      this.resetForm();
      
    } catch (error) {
      console.error('Failed to cancel job:', error);
      showToast('Failed to cancel search', 'error');
    }
  }

  viewTargetHitlist() {
    if (this.targetHitlistId && typeof window.openBusinessListModal === 'function') {
      // store the ID in a local variable before closing modal
      const hitlistId = this.targetHitlistId;

      // close scraper modal but preserve the target hitlist info
      this.closeScraperModal(true);

      // refresh hitlists first, then open the specific one
      setTimeout(async () => {
        console.log('Refreshing hitlists and opening modal with hitlist ID:', hitlistId);

        // refresh the hitlists to ensure we have the updated data
        if (typeof window.fetchAndRenderHitlists === 'function') {
          await window.fetchAndRenderHitlists();
        }

        // small delay to ensure refresh completes
        setTimeout(() => {
          window.openBusinessListModal(hitlistId);
        }, 100);
      }, 300);
    } else {
      console.error('Cannot view hitlist:', {
        targetHitlistId: this.targetHitlistId,
        openBusinessListModal: typeof window.openBusinessListModal
      });
    }
  }
}

// initialize scraper when page loads
let businessScraper;

document.addEventListener('DOMContentLoaded', async () => {
  businessScraper = new BusinessScraper();
  await businessScraper.init();
});

// export for use in other modules
window.businessScraper = businessScraper;