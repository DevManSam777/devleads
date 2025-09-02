document.addEventListener("DOMContentLoaded", function () {
    setupSidebarToggle();
  });
  
  // set up the sidebar toggle functionality
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
  
  // ensure this function runs as early as possible
  if (document.readyState === 'loading') {
    // if document hasn't finished loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', setupSidebarToggle);
  } else {
    // if document is already loaded, run immediately
    setupSidebarToggle();
  }