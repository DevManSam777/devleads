import { formatDate } from './utils.js';
import { authApi } from './authApi.js';

document.addEventListener("DOMContentLoaded", function () {
  const themeSegments = document.querySelectorAll('.theme-segment');
  const dateFormatSegments = document.querySelectorAll('.date-format-segment');
  const dateFormatExample = document.getElementById('dateFormatExample');
  
  let globalSettings = {};
  
  // fetch all settings
  async function fetchAllSettings() {
    try {
      console.log("Fetching all settings...");
      
      // use authApi instead of direct fetch
      const settings = await authApi.get('/settings');
      console.log("Settings fetched successfully:", settings);
      return settings;
    } catch (error) {
      console.error("Error fetching settings:", error);
      
      // fallback to localStorage if API fails
      console.log("Using localStorage fallback due to API error");
      return {
        theme:
          localStorage.getItem("theme") ||
          (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"),
        dateFormat: localStorage.getItem("dateFormat") || "MM/DD/YYYY"
      };
    }
  }
  
// update a specific setting
 async function updateSetting(key, value) {
    try {
      console.log(`Updating setting ${key} to ${value}...`);
      
      // use authApi instead of direct fetch
      const updatedSetting = await authApi.put(`/settings/${key}`, { value });
      console.log(`Setting ${key} updated successfully:`, updatedSetting);
      
      // also update localStorage as a fallback
      localStorage.setItem(key, value);
      
      // dispatch event to notify other parts of the application
      window.dispatchEvent(new CustomEvent('settingsUpdated', {
        detail: { key, value }
      }));
      
      return updatedSetting;
    } catch (error) {
      console.error("Error updating setting:", error);
      
      // update localStorage as a fallback
      localStorage.setItem(key, value);
      
      // still dispatch the event even if server update fails
      window.dispatchEvent(new CustomEvent('settingsUpdated', {
        detail: { key, value }
      }));
      
      return { key, value };
    }
  }
  
  // function to apply theme to HTML element
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }
  
  // function to update active theme segment
  function updateActiveThemeSegment(theme) {
    themeSegments.forEach(segment => {
      if (segment.getAttribute('data-theme') === theme) {
        segment.classList.add('active');
      } else {
        segment.classList.remove('active');
      }
    });
  }
  
  // function to update active date format segment
  function updateActiveDateFormatSegment(format) {
    dateFormatSegments.forEach(segment => {
      if (segment.getAttribute('data-format') === format) {
        segment.classList.add('active');
      } else {
        segment.classList.remove('active');
      }
    });
    
    // update the example display
    updateDateFormatExample(format);
  }
  
  // function to update date format example
  function updateDateFormatExample(format) {
    const today = new Date();
    // ensure we're using the local time display, not UTC
    if (dateFormatExample) {
      dateFormatExample.textContent = formatDate(today, format);
    }
  }
  
  // initialize settings on page load
  async function initializeSettings() {
    // fetch all settings
    const settings = await fetchAllSettings();
    
    // handle theme setting. if theme doesn't exist on server, set it from system preference
    let currentTheme = settings.theme;
    if (!currentTheme) {
      currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      // save it to server
      await updateSetting('theme', currentTheme);
    }
    
    // set the current theme
    setTheme(currentTheme);
    
    // update active theme segment
    updateActiveThemeSegment(currentTheme);
    
    // handle date format setting
    let currentDateFormat = settings.dateFormat;
    if (!currentDateFormat) {
      currentDateFormat = "MM/DD/YYYY"; // default format
      // save it to server
      await updateSetting('dateFormat', currentDateFormat);
    }
    
    // update active date format segment
    updateActiveDateFormatSegment(currentDateFormat);
  }

  initializeSettings();
  
  // add event listeners to theme segments
  themeSegments.forEach(segment => {
    segment.addEventListener('click', function() {
      const newTheme = this.getAttribute('data-theme');
      setTheme(newTheme);
      updateSetting('theme', newTheme);
      updateActiveThemeSegment(newTheme);
    });
  });
  
  // add event listeners to date format segments
  dateFormatSegments.forEach(segment => {
    segment.addEventListener('click', function() {
      const newFormat = this.getAttribute('data-format');
      updateSetting('dateFormat', newFormat);
      updateActiveDateFormatSegment(newFormat);
    });
  });
  
  function setupSidebarToggle() {
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");

    if (!sidebar || !mainContent) {
      console.error("Sidebar or main content not found");
      return;
    }

    // store original transition for later restoration
    const originalSidebarTransition = sidebar.style.transition;
    const originalMainContentTransition = mainContent.style.transition;

    // temporarily disable transitions
    sidebar.style.transition = "none";
    mainContent.style.transition = "none";

    // set initial state based on localStorage preference
    const isSidebarCollapsed =
      localStorage.getItem("sidebarCollapsed") === "true";

    if (isSidebarCollapsed) {
      sidebar.classList.add("collapsed");
      mainContent.classList.add("expanded");
    } else {
      sidebar.classList.remove("collapsed");
      mainContent.classList.remove("expanded");
    }

    // force DOM reflow to apply changes before transitions are re-enabled
    void sidebar.offsetWidth;

    // restore transitions
    sidebar.style.transition = originalSidebarTransition;
    mainContent.style.transition = originalMainContentTransition;

    // remove any existing toggle button to avoid duplicates
    const existingButton = document.querySelector(".sidebar-toggle");
    if (existingButton) {
      existingButton.remove();
    }

    // create new toggle button with both icons
    const toggleButton = document.createElement("button");
    toggleButton.className = "sidebar-toggle";
    toggleButton.setAttribute("aria-label", "Toggle Sidebar");
    toggleButton.innerHTML =
      '<i class="fas fa-angles-left"></i><i class="fas fa-angles-right"></i>';
    sidebar.appendChild(toggleButton);

    // add click event to toggle button
    toggleButton.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("expanded");
      localStorage.setItem(
        "sidebarCollapsed",
        sidebar.classList.contains("collapsed")
      );
    });
  }
  
  // run the sidebar toggle setup
  setupSidebarToggle();
});