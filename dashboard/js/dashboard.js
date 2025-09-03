import * as API from "./api.js";
import * as UI from "./ui.js";
import * as Utils from "./utils.js";
import * as Handlers from "./handlers.js";
import * as Payments from "./payments.js";
import * as Pagination from "./pagination.js";
import * as Documents from "./documents.js";

// global variables
let allLeads = [];
let payments = [];
let globalSettings = {};

// pagination variables
let currentPage = 1;
let pageSize = 12; // this is just default fallback after browser reload, go to pagination.js pageSizeOptions to change values too if you change this
let totalPages = 1;

// view tracking
let currentView = "grid"; // 'grid' or 'list'

window.leadSubmissionInProgress = false;

// set the theme on HTML element
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

// initialize everything when the document is ready
document.addEventListener("DOMContentLoaded", async function () {
  // make setTheme available globally for settings.js to use
  window.setTheme = setTheme;

  // global switchView function for dashboard.js
  window.switchView = function (view) {
    console.log("Global switchView called with:", view);

    // update the current view variable
    currentView = view;

    // get the view containers directly
    const leadCards = document.getElementById("leadCards");
    const leadsTable = document.getElementById("leadsTable");

    if (!leadCards || !leadsTable) {
      console.error("View containers not found!", {
        leadCards: leadCards,
        leadsTable: leadsTable,
      });
      return;
    }

    // get the toggle buttons
    const gridViewBtn = document.getElementById("gridViewBtn");
    const listViewBtn = document.getElementById("listViewBtn");

    if (!gridViewBtn || !listViewBtn) {
      console.error("View toggle buttons not found!", {
        gridViewBtn: gridViewBtn,
        listViewBtn: listViewBtn,
      });
      return;
    }

    // ensure UI is available
    if (typeof UI === "undefined") {
      console.error("UI module not found");
      return;
    }

    // handle view toggling
    UI.switchView(view);

    // re-render leads in the new view if allLeads is available
    if (allLeads && allLeads.length > 0) {
      renderLeads(allLeads);
    }
  };

  // theme initialization
  try {
    const settings = await API.fetchAllSettings();
    globalSettings = settings;

    window.dateFormat = settings.dateFormat || "MM/DD/YYYY";

    if (settings.theme) {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      if (currentTheme !== settings.theme) {
        setTheme(settings.theme);
      }
    }
  } catch (error) {
    console.error("Error initializing theme:", error);
    window.dateFormat = localStorage.getItem("dateFormat") || "MM/DD/YYYY";
  }

  // load saved view preference
  const savedView = localStorage.getItem("preferredView");
  if (savedView && (savedView === "grid" || savedView === "list")) {
    console.log("Restoring saved view preference:", savedView);
    currentView = savedView; // set the current view variable first
    window.switchView(savedView);
  }

  // setup for stats summary toggle persistence
  const statsDetails = document.getElementById("statsSection");
  if (statsDetails) {
    // load saved state
    const isStatsOpen = localStorage.getItem("statsOpen");
    if (isStatsOpen !== null) {
      statsDetails.open = isStatsOpen === "true";
    }

    // save state when toggled
    statsDetails.addEventListener("toggle", function () {
      localStorage.setItem("statsOpen", this.open);
    });
  }

  const chartsDetails = document.getElementById("chartsSection");
  if (chartsDetails) {
    // load saved state
    const isChartsOpen = localStorage.getItem("chartsOpen");
    if (isChartsOpen !== null) {
      chartsDetails.open = isChartsOpen === "true";
    }

    // save state when toggled
    chartsDetails.addEventListener("toggle", function () {
      localStorage.setItem("chartsOpen", this.open);
    });
  }

  // load page size from localStorage if available
  const savedPageSize = localStorage.getItem("pageSize");
  if (savedPageSize) {
    pageSize = parseInt(savedPageSize);
  }

  //  prevent Enter key from accidentally submitting the form in the lead modal
  const leadForm = document.getElementById("leadForm");
  if (leadForm) {
    leadForm.addEventListener("keydown", function (event) {
      // only prevent default on Enter key for input fields not buttons or textareas
      if (
        event.key === "Enter" &&
        (event.target.tagName === "INPUT" ||
          (event.target.tagName === "SELECT" && !event.target.multiple))
      ) {
        // prevent the default form submission
        event.preventDefault();
        // move focus to the next field instead (more user-friendly)
        const formElements = Array.from(leadForm.elements);
        const currentIndex = formElements.indexOf(event.target);
        if (currentIndex < formElements.length - 1) {
          const nextElement = formElements[currentIndex + 1];
          nextElement.focus();
        }
        return false;
      }
    });
  }

  initResponsiveTabs("#leadModal");
  initializeDateInputs();
  Utils.initializePhoneFormatting();
  Utils.initializeAutoResizeTextareas();
  setupSidebarToggle();
  fetchLeadsAndRender();

  // dashboard UI event listeners
  document
    .getElementById("addLeadBtn")
    .addEventListener("click", Handlers.openAddLeadModal);
  
  // Export functionality
  document
    .getElementById("exportAllLeadsBtn")
    .addEventListener("click", showExportModal);
  
  // Make export function globally available for lead modals
  window.exportSingleLead = async function(leadId) {
    try {
      console.log(`Starting export for lead ID: ${leadId}`);
      
      // Find the lead in allLeads
      const lead = allLeads?.find(l => l._id === leadId);
      if (!lead) {
        alert("Lead not found");
        return;
      }
      
      // Fetch payment data for this lead
      const leadPayments = await API.fetchLeadPayments(leadId);
      console.log(`Found ${leadPayments.length} payments for lead ${leadId}:`, leadPayments);
      
      // Create lead data with payment information in proper order
      const leadWithPayments = {
        // Lead ID and Personal Info First
        _id: lead._id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        phoneExt: lead.phoneExt,
        textNumber: lead.textNumber,
        
        // Business Info (with address included in business section)
        businessName: lead.businessName,
        businessPhone: lead.businessPhone,
        businessPhoneExt: lead.businessPhoneExt,
        businessEmail: lead.businessEmail,
        websiteAddress: lead.websiteAddress,
        businessServices: lead.businessServices,
        billingStreet: lead.billingAddress?.street || '',
        billingAptUnit: lead.billingAddress?.aptUnit || '',
        billingCity: lead.billingAddress?.city || '',
        billingState: lead.billingAddress?.state || '',
        billingZipCode: lead.billingAddress?.zipCode || '',
        billingCountry: lead.billingAddress?.country || '',
        
        // Service & Status Info
        serviceDesired: lead.serviceDesired,
        hasWebsite: lead.hasWebsite,
        preferredContact: lead.preferredContact,
        status: lead.status,
        
        // Dates
        createdAt: lead.createdAt,
        lastContactedAt: lead.lastContactedAt,
        
        // Financial Info
        budget: lead.budget,
        totalBudget: lead.totalBudget,
        paidAmount: lead.paidAmount,
        remainingBalance: lead.remainingBalance,
        
        // Payment Summary
        paymentCount: leadPayments.length,
        totalPayments: parseFloat(leadPayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)),
        
        // Individual Payments
        payments: leadPayments.map(payment => ({
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          notes: payment.notes || ""
        })),
        
        // Messages & Notes
        message: lead.message,
        notes: lead.notes
      };
      
      // Show export options modal
      showSingleLeadExportModal(leadWithPayments);
      
    } catch (error) {
      console.error("Error exporting single lead:", error);
      alert("Error exporting lead. Please try again.");
    }
  };
  document
    .getElementById("closeModal")
    .addEventListener("click", closeLeadModal);

  document
    .getElementById("leadForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      // if a submission is already in progress, ignore this submission
      if (window.leadSubmissionInProgress) {
        console.log(
          "Submission already in progress, ignoring duplicate submit"
        );
        return false;
      }

      // hide the action buttons container immediately to prevent flashing
      const actionsContainer = document.getElementById("modalActions");
      if (actionsContainer) {
        actionsContainer.style.display = "none";
      }

      // validate and save the lead
      Handlers.validateAndSaveLead(event);

      // close the modal with a short delay to avoid UI flashing
      setTimeout(() => {
        window.closeLeadModal();
      }, 100);

      // prevent any default close behavior
      return false;
    });

  document.getElementById("searchInput").addEventListener("input", searchLeads);
  document
    .getElementById("filterStatus")
    .addEventListener("change", filterLeads);
  document.getElementById("sortField").addEventListener("change", sortLeads);
  document.getElementById("sortOrder").addEventListener("change", sortLeads);

  // View toggle button event listeners
  document.getElementById("gridViewBtn").addEventListener("click", function () {
    window.switchView("grid");
  });

  document.getElementById("listViewBtn").addEventListener("click", function () {
    window.switchView("list");
  });

  // form conditionals
  const hasWebsiteSelect = document.getElementById("hasWebsite");
  if (hasWebsiteSelect) {
    hasWebsiteSelect.addEventListener("change", function () {
      const websiteAddressField =
        document.getElementById("websiteAddress").parentNode;
      websiteAddressField.style.display =
        this.value === "yes" ? "block" : "none";
    });
  }

  const totalBudgetInput = document.getElementById("totalBudget");
  if (totalBudgetInput) {
    totalBudgetInput.addEventListener("input", function () {
      // get the total budget and paid amount values
      const totalBudget = parseFloat(this.value.replace(/[^\d.-]/g, "")) || 0;
      const paidAmount =
        parseFloat(
          document.getElementById("paidAmount").value.replace(/[^\d.-]/g, "")
        ) || 0;

      // calculate remaining balance
      const remainingBalance = parseFloat((totalBudget - paidAmount).toFixed(2));

      // update the remaining balance field with formatting
      // use the Utils.formatCurrency if imported that way
      document.getElementById("remainingBalance").value =
        Utils.formatCurrency(remainingBalance);
    });
  }

  // payment related listeners
  const paymentForm = document.getElementById("paymentForm");
  if (paymentForm) {
    // remove existing event listeners (if any) by cloning and replacing
    const newPaymentForm = paymentForm.cloneNode(true);
    paymentForm.parentNode.replaceChild(newPaymentForm, paymentForm);

    // add fresh event listener
    newPaymentForm.addEventListener("submit", function (event) {
      event.preventDefault();
      Payments.validateAndSavePayment(event);
      return false;
    });
  }

  // close payment modal button
  const closePaymentModalBtn = document.getElementById("closePaymentModal");
  if (closePaymentModalBtn) {
    const newCloseBtn = closePaymentModalBtn.cloneNode(true);
    closePaymentModalBtn.parentNode.replaceChild(
      newCloseBtn,
      closePaymentModalBtn
    );

    newCloseBtn.addEventListener("click", function (event) {
      event.preventDefault();
      Payments.closePaymentModal();
      return false;
    });
  }

  // add payment button
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  if (addPaymentBtn) {
    const newBtn = addPaymentBtn.cloneNode(true);
    addPaymentBtn.parentNode.replaceChild(newBtn, addPaymentBtn);

    newBtn.addEventListener("click", function () {
      const leadId = document.getElementById("leadId").value;
      if (leadId) {
        Payments.openPaymentModal(leadId);
      } else {
        Utils.showToast("Please save the lead first before adding payments");
      }
    });
  }

  // setup form validation
  Handlers.setupFormValidation();

  // add mutation observer to handle modal state changes
  const modalObserver = new MutationObserver(function (mutations) {
    const leadId = document.getElementById("leadId").value;
    if (!leadId) return;

    // check if we're in edit mode
    const submitButton = document.querySelector(
      '#leadForm button[type="submit"]'
    );
    const isEditMode = submitButton && submitButton.style.display !== "none";

    if (isEditMode) {
      // we're in edit mode, make sure payments show action buttons
      const paymentItems = document.querySelectorAll(".payment-item");
      let needsRefresh = false;

      // check if any payment items are missing action buttons
      paymentItems.forEach((item) => {
        if (
          item.textContent !== "No payments found" &&
          !item.querySelector(".payment-actions")
        ) {
          needsRefresh = true;
        }
      });

      // if we need to refresh the payments display
      if (needsRefresh) {
        API.fetchLeadPayments(leadId).then((payments) => {
          Payments.renderLeadPayments(payments, leadId);
        });
      }
    }
  });

  // observe the lead modal for changes
  const leadModal = document.getElementById("leadModal");
  if (leadModal) {
    modalObserver.observe(leadModal, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  // event listeners for lead updates
  window.addEventListener("leadSaved", function (event) {
    const { lead, isNew } = event.detail;

    // update allLeads array
    if (isNew) {
      allLeads.push(lead);
    } else {
      const index = allLeads.findIndex((l) => l._id === lead._id);
      if (index !== -1) {
        // check if status has changed from closed-won to something else
        const oldStatus = allLeads[index].status;
        const newStatus = lead.status;

        // replace the lead in the array
        allLeads[index] = lead;

        // if this was a status change involving closed-won status, force chart update
        if (
          (oldStatus === "closed-won" && newStatus !== "closed-won") ||
          (oldStatus !== "closed-won" && newStatus === "closed-won")
        ) {
          console.log("Status changed involving closed-won, updating charts");
          if (typeof window.updateAllCharts === "function") {
            window.updateAllCharts();
          }
        }
      }
    }

    // reset to first page when adding a new lead
    if (isNew) {
      currentPage = 1;
    }

    // re-render and update stats
    const filteredLeads = getFilteredLeads();
    renderPaginatedLeads(filteredLeads);
    UI.calculateStats(allLeads, payments);
  });

  window.addEventListener("leadDeleted", function (event) {
    const { leadId } = event.detail;

    // check if the deleted lead was closed-won before removing it
    const deletedLead = allLeads.find((lead) => lead._id === leadId);
    const wasClosedWon = deletedLead && deletedLead.status === "closed-won";

    // remove lead from array
    allLeads = allLeads.filter((lead) => lead._id !== leadId);

    // remove payments associated with this lead
    if (payments && payments.length > 0) {
      payments = payments.filter((payment) => payment.leadId !== leadId);
      // update global payments variable to ensure charts have access to the updated data
      window.payments = payments;
    }

    // update the global variable to ensure it's accessible to charts
    window.allLeads = allLeads;
    console.log(
      "Updated global allLeads array, now has",
      allLeads.length,
      "leads"
    );

    // reset to first page if we're on a page higher than max pages
    if (currentPage > Math.ceil(allLeads.length / pageSize)) {
      currentPage = Math.max(1, Math.ceil(allLeads.length / pageSize));
    }

    // re-render and update stats
    const filteredLeads = getFilteredLeads();
    renderPaginatedLeads(filteredLeads);
    UI.calculateStats(allLeads, payments);

    // update the data watcher to force chart rebuilds
    if (typeof window.updateDataWatcher === "function") {
      console.log("Updating data watcher after lead deletion");
      window.updateDataWatcher();
    } else {
      console.warn(
        "updateDataWatcher function not found, trying fallback methods"
      );

      // direct chart updates as a fallback
      if (typeof window.updateAllCharts === "function") {
        console.log("Directly calling updateAllCharts as fallback");
        window.updateAllCharts();
      } else {
        console.error("No chart update mechanisms available!");

        // else force a chart rebuild using a custom event
        try {
          console.log("Trying custom chartUpdate event as last resort");
          const chartUpdateEvent = new CustomEvent("chartUpdate", {
            detail: { source: "leadDeleted", leadCount: allLeads.length },
          });
          window.dispatchEvent(chartUpdateEvent);
        } catch (e) {
          console.error("Failed to dispatch custom event:", e);
        }
      }
    }
  });

  // month-leads stat card
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const now = new Date();
  const currentMonth = monthNames[now.getMonth()];

  const leadsHeader = document.getElementById("month-leads");
  const monthlyRevenueHeader = document.getElementById(
    "monthly-revenue-header"
  );

  if (leadsHeader) {
    leadsHeader.innerHTML = `${currentMonth} ${leadsHeader.innerHTML}`;
  }

  if (monthlyRevenueHeader) {
    monthlyRevenueHeader.innerHTML = `${currentMonth} ${monthlyRevenueHeader.innerHTML}`;
  }

  window.addEventListener("paymentsUpdated", async function () {
    try {
      console.log("Payment update detected, refreshing data...");
      payments = await API.fetchPayments();

      // update the global window.payments variable that charts.js uses
      window.payments = payments;

      // force recalculation of stats
      UI.calculateStats(allLeads, payments);

      // update the data watcher to trigger chart rebuilds
      if (typeof window.updateDataWatcher === "function") {
        window.updateDataWatcher();
      } else {
        // direct fallback to update charts if watcher not available
        if (typeof window.updateAllCharts === "function") {
          window.updateAllCharts();
        }
      }

      // refresh lead list display
      const filteredLeads = getFilteredLeads();
      renderPaginatedLeads(filteredLeads);

      console.log("Dashboard data refreshed after payment update");
    } catch (error) {
      console.error("Error updating payments:", error);
    }
  });

  // event listener for settings changes
  window.addEventListener("settingsUpdated", function (event) {
    const { key, value } = event.detail;

    if (key === "dateFormat") {
      window.dateFormat = value;

      // re-render leads with new date format
      if (allLeads && allLeads.length > 0) {
        renderLeads(allLeads);
      }

      // initialize monetary input formatting
      initializeMonetaryInputs();

      // re-initialize the date inputs with new format
      initializeDateInputs();

      // re-initialize any open lead modals with new date format
      const leadId = document.getElementById("leadId").value;
      if (leadId) {
        const lead = allLeads.find((l) => l._id === leadId);
        if (lead) {
          Handlers.updateLeadModalDates(lead);
        }
      }
    }
  });

  window.addEventListener("paymentsUpdated", async function () {
    // refresh all payments data
    try {
      console.log("Payment update detected, refreshing data...");
      payments = await API.fetchPayments();

      // force recalculation of stats
      UI.calculateStats(allLeads, payments);

      // refresh lead list display
      const filteredLeads = getFilteredLeads();
      renderPaginatedLeads(filteredLeads);

      console.log("Dashboard data refreshed after payment update");
    } catch (error) {
      console.error("Error updating payments:", error);
    }
  });

  // expose to window object for HTML access
  window.openLeadModal = (leadId) => Handlers.openLeadModal(leadId, allLeads);
  window.closeLeadModal = closeLeadModal;
  window.deleteLeadAction = Handlers.deleteLeadAction;
  window.updateModalActionButtons = UI.updateModalActionButtons;
  window.fetchLeadPayments = API.fetchLeadPayments;
  window.renderLeadPayments = Payments.renderLeadPayments;
  window.loadLeadDocuments = Documents.loadLeadDocuments;
  window.initDocumentUpload = Documents.initDocumentUpload;
  window.updateDocumentUiForMode = Documents.updateDocumentUiForMode;

  // set up the combined sort dropdown
  const combinedSort = document.getElementById("combinedSort");
  if (combinedSort) {
    // check if the element exists
    const sortField = document.getElementById("sortField");
    const sortOrder = document.getElementById("sortOrder");

    // event listener to update hidden dropdowns when the combined dropdown changes
    combinedSort.addEventListener("change", function () {
      // get the selected value which has format "field-order"
      const [field, order] = this.value.split("-");

      // update the hidden dropdowns
      sortField.value = field;
      sortOrder.value = order;

      // trigger change events to make the main JS apply the sorting
      sortField.dispatchEvent(new Event("change"));
      sortOrder.dispatchEvent(new Event("change"));
    });

    // initialize with the default value
    combinedSort.dispatchEvent(new Event("change"));
  }
});

// initialize responsive tabs for a specific modal

function initResponsiveTabs(modalSelector) {
  const modal = document.querySelector(modalSelector);
  if (!modal) return;

  // get the horizontal tabs container
  const tabsContainer = modal.querySelector(".modal-tabs");
  if (!tabsContainer) return;

  // get all tab buttons
  const tabButtons = tabsContainer.querySelectorAll(".modal-tab");
  if (!tabButtons.length) return;

  // create dropdown container
  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "modal-tabs-dropdown";

  // create dropdown button with the currently active tab
  const activeTab =
    tabsContainer.querySelector(".modal-tab.active") || tabButtons[0];
  const activeTabIcon = activeTab.querySelector("i").cloneNode(true);
  const activeTabText = activeTab.querySelector("span").textContent;

  const dropdownButton = document.createElement("div");
  dropdownButton.className = "tabs-dropdown-button";
  dropdownButton.innerHTML = `
    <div>
      <i class="tab-icon ${activeTabIcon.className}"></i>
      <span>${activeTabText}</span>
    </div>
    <i class="fas fa-chevron-down"></i>
  `;

  // create dropdown menu
  const dropdownMenu = document.createElement("div");
  dropdownMenu.className = "tabs-dropdown-menu";

  // add tabs to the dropdown menu
  tabButtons.forEach((tab) => {
    const icon = tab.querySelector("i");
    const text = tab.querySelector("span");

    if (!icon || !text) return;

    const dropdownItem = document.createElement("div");
    dropdownItem.className = "dropdown-tab-item";
    dropdownItem.dataset.tab = tab.dataset.tab;

    if (tab.classList.contains("active")) {
      dropdownItem.classList.add("active");
    }

    dropdownItem.innerHTML = `
      <i class="${icon.className}"></i>
      <span>${text.textContent}</span>
    `;

    // add click event to dropdown item
    dropdownItem.addEventListener("click", function () {
      // Find and trigger click on corresponding original tab
      const originalTab = modal.querySelector(
        `.modal-tab[data-tab="${this.dataset.tab}"]`
      );
      if (originalTab) {
        originalTab.click();
      }

      // update dropdown button text and icon
      const buttonIcon = dropdownButton.querySelector(".tab-icon");
      const buttonText = dropdownButton.querySelector("span");

      if (buttonIcon && buttonText) {
        buttonIcon.className = icon.className + " tab-icon";
        buttonText.textContent = text.textContent;
      }

      // update active state in dropdown items
      dropdownMenu.querySelectorAll(".dropdown-tab-item").forEach((item) => {
        item.classList.remove("active");
      });
      this.classList.add("active");

      // close dropdown menu
      dropdownMenu.classList.remove("open");
      dropdownButton.classList.remove("open");
    });

    dropdownMenu.appendChild(dropdownItem);
  });

  // add dropdown button click event
  dropdownButton.addEventListener("click", function () {
    dropdownMenu.classList.toggle("open");
    this.classList.toggle("open");
  });

  // close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !dropdownContainer.contains(event.target) &&
      dropdownMenu.classList.contains("open")
    ) {
      dropdownMenu.classList.remove("open");
      dropdownButton.classList.remove("open");
    }
  });

  // add components to dropdown container
  dropdownContainer.appendChild(dropdownButton);
  dropdownContainer.appendChild(dropdownMenu);

  // insert dropdown before the tabs container
  tabsContainer.parentNode.insertBefore(dropdownContainer, tabsContainer);

  // monitor tab changes to update dropdown
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const target = mutation.target;
        if (
          target.classList.contains("active") &&
          target.classList.contains("modal-tab")
        ) {
          const tabName = target.dataset.tab;
          const dropdownItem = dropdownMenu.querySelector(
            `.dropdown-tab-item[data-tab="${tabName}"]`
          );

          if (dropdownItem) {
            // update active state in dropdown items
            dropdownMenu
              .querySelectorAll(".dropdown-tab-item")
              .forEach((item) => {
                item.classList.remove("active");
              });
            dropdownItem.classList.add("active");

            // update dropdown button text and icon
            const icon = target.querySelector("i");
            const text = target.querySelector("span");

            if (icon && text) {
              const buttonIcon = dropdownButton.querySelector(".tab-icon");
              const buttonText = dropdownButton.querySelector("span");

              if (buttonIcon && buttonText) {
                buttonIcon.className = icon.className + " tab-icon";
                buttonText.textContent = text.textContent;
              }
            }
          }
        }
      }
    });
  });

  // start observing tab changes
  tabButtons.forEach((tab) => {
    observer.observe(tab, { attributes: true });
  });
}

// refresh the tabs when a modal is opened
function refreshResponsiveTabs(modalSelector) {
  const modal = document.querySelector(modalSelector);

  if (!modal) return;

  // remove existing dropdown
  const existingDropdown = modal.querySelector(".modal-tabs-dropdown");
  if (existingDropdown) {
    existingDropdown.remove();
  }

  // re-initialize tabs
  initResponsiveTabs(modalSelector);
}

// expose to window so it can be called from other scripts
window.refreshResponsiveTabs = refreshResponsiveTabs;

// patch the existing openLeadModal function to refresh tabs
const originalOpenLeadModal = window.openLeadModal;
if (typeof originalOpenLeadModal === "function") {
  window.openLeadModal = function (leadId, allLeads) {
    // call the original function first
    const result = originalOpenLeadModal(leadId, allLeads);

    // refresh the tabs
    setTimeout(() => {
      refreshResponsiveTabs("#leadModal");
    }, 100);

    return result;
  };
}

function initializeDateInputs() {
  // set up date inputs in the lead form
  const lastContactedInput = document.getElementById("lastContactedAt");
  const lastContactedDisplay = document.getElementById("lastContactedDisplay");

  if (lastContactedInput && lastContactedDisplay) {
    lastContactedInput.addEventListener("change", function () {
      if (this.value) {
        // create a date object from the input value, which is in YYYY-MM-DD format
        const [year, month, day] = this.value.split("-").map(Number);

        // create date object using local date components at noon
        const date = new Date(year, month - 1, day, 12, 0, 0);

        lastContactedDisplay.textContent = Utils.formatDate(
          date,
          window.dateFormat
        );
      } else {
        lastContactedDisplay.textContent = "";
      }
    });

    // initial update if value exists
    if (lastContactedInput.value) {
      const [year, month, day] = lastContactedInput.value
        .split("-")
        .map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);

      lastContactedDisplay.textContent = Utils.formatDate(
        date,
        window.dateFormat
      );
    }
  }

  const paymentDateInput = document.getElementById("paymentDate");
  const paymentDateDisplay = document.getElementById("paymentDateDisplay");

  if (paymentDateInput && paymentDateDisplay) {
    paymentDateInput.addEventListener("change", function () {
      if (this.value) {
        const [year, month, day] = this.value.split("-").map(Number);
        const date = new Date(year, month - 1, day, 12, 0, 0);

        paymentDateDisplay.textContent = Utils.formatDate(
          date,
          window.dateFormat
        );
      } else {
        paymentDateDisplay.textContent = "";
      }
    });

    // initial update if value exists
    if (paymentDateInput.value) {
      const [year, month, day] = paymentDateInput.value.split("-").map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);

      paymentDateDisplay.textContent = Utils.formatDate(
        date,
        window.dateFormat
      );
    }
  }
}

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

  // force DOM to apply changes before transitions are re-enabled
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
if (document.readyState === "loading") {
  // if document hasn't finished loading, wait for DOMContentLoaded
  document.addEventListener("DOMContentLoaded", setupSidebarToggle);
} else {
  // if document is loaded, run immediately
  setupSidebarToggle();
}

function showLeadsLoadingSpinner() {
  const spinner = document.getElementById("leadsLoadingSpinner");
  if (spinner) {
    spinner.classList.remove("hidden");
  }
}

function hideLeadsLoadingSpinner() {
  const spinner = document.getElementById("leadsLoadingSpinner");
  if (spinner) {
    spinner.classList.add("hidden");
  }
}

async function fetchLeadsAndRender() {
  try {
    showLeadsLoadingSpinner();
    allLeads = await API.fetchLeads();
    window.allLeads = allLeads;
    console.log("Made leads globally available:", window.allLeads.length);

    // reset to page 1 when loading fresh data
    currentPage = 1;
    renderPaginatedLeads(allLeads);

    // fetch payments
    payments = await API.fetchPayments();
    window.payments = payments;
    console.log("Made payments globally available:", window.payments.length);

    // initialize charts with the fresh data
    console.log("Initializing charts after data load");
    if (typeof window.initializeCharts === "function") {
      window.initializeCharts();
    } else {
      console.error("Chart initialization function not available");
    }

    // calculate and update stats
    UI.calculateStats(allLeads, payments);

    // update data watcher to ensure charts are in sync
    if (typeof window.updateDataWatcher === "function") {
      window.updateDataWatcher();
    }
    hideLeadsLoadingSpinner();
  } catch (error) {
    console.error("Error in fetchLeadsAndRender:", error);

    // hide loading spinner even on error
    hideLeadsLoadingSpinner();

    // display error message in UI
    const leadCardsElement = document.getElementById("leadCards");
    if (leadCardsElement) {
      leadCardsElement.innerHTML = `<div class="lead-card"><p>Error loading leads: ${error.message}</p></div>`;
    }

    // set default values for statistics
    Utils.safeSetTextContent("totalLeadsValue", "0");
    Utils.safeSetTextContent("newLeadsValue", "0");
    Utils.safeSetTextContent("conversionRateValue", "0%");
    Utils.safeSetTextContent(
      "monthlyPaymentsValue",
      Utils.formatCurrency(0, "USD")
    );

    // set all change indicators to 0%
    Utils.safeUpdateChangeIndicator("totalLeadsChange", 0, "month");
    Utils.safeUpdateChangeIndicator("newLeadsChange", 0, "");
    Utils.safeUpdateChangeIndicator("conversionChange", 0, "month");
    Utils.safeUpdateChangeIndicator("paymentsChange", 0, "month");

    Utils.showToast("Error fetching leads: " + error.message);
  }
}

function closeLeadModal() {
  // check if a submission is already in progress
  if (window.leadSubmissionInProgress) {
    console.log(
      "Lead submission already in progress, waiting for completion before closing modal"
    );

    // set up a one time event listener to close the modal after submission completes
    window.addEventListener(
      "leadSaved",
      function closeAfterSave() {
        console.log("Lead saved, now closing modal");
        window.removeEventListener("leadSaved", closeAfterSave);
        performCleanupAndCloseModal();
      },
      { once: true }
    );

    // handle the case where submission might fail
    setTimeout(() => {
      if (window.leadSubmissionInProgress) {
        console.log("Lead submission timeout - forcing close");
        window.leadSubmissionInProgress = false;
        performCleanupAndCloseModal();
      }
    }, 200);

    return;
  }

  // check if we're in edit mode
  const submitButton = document.querySelector(
    '#leadForm button[type="submit"]'
  );
  const isEditMode =
    submitButton && getComputedStyle(submitButton).display !== "none";

  // if in edit mode, attempt to save before closing
  if (isEditMode && !window.leadSubmissionInProgress) {
    try {
      // set the submission flag to prevent duplicates
      window.leadSubmissionInProgress = true;

      // create a mock event for save function
      const mockEvent = new Event("submit");
      mockEvent.preventDefault = () => {};

      // call save lead function and handle the promise
      Handlers.validateAndSaveLead(mockEvent)
        .then((success) => {
          performCleanupAndCloseModal();
        })
        .catch((error) => {
          console.error("Error saving lead:", error);
          performCleanupAndCloseModal();
        });
    } catch (error) {
      console.error("Error in closeLeadModal:", error);
      window.leadSubmissionInProgress = false;
      performCleanupAndCloseModal();
    }
  } else {
    // if not in edit mode, just close normally
    performCleanupAndCloseModal();
  }
}

// helper function to perform actual modal cleanup and closing
function performCleanupAndCloseModal() {
  const modal = document.getElementById("leadModal");
  if (!modal) return;

  modal.style.display = "none";

  // reset the form completely
  document.getElementById("leadForm").reset();

  // clear hidden fields too
  document.getElementById("leadId").value = "";

  // reset readonly attributes
  const formElements = document.querySelectorAll(
    "#leadForm input, #leadForm select, #leadForm textarea"
  );
  formElements.forEach((element) => {
    element.removeAttribute("readonly");
    if (element.tagName === "SELECT") {
      element.removeAttribute("disabled");
    }
    element.classList.remove("invalid");
  });

  // clear error messages
  document.querySelectorAll(".error-message").forEach((el) => {
    el.style.display = "none";
  });

  // clear any payment fields that weren't part of the original form
  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField && remainingBalanceField.parentNode) {
    remainingBalanceField.value = "";
  }

  // show the submit button again
  const submitButton = document.querySelector(
    '#leadForm button[type="submit"]'
  );
  if (submitButton) {
    submitButton.style.display = "block";
  }

  // remove the modal actions container
  const modalActions = document.getElementById("modalActions");
  if (modalActions) {
    modalActions.remove();
  }

  const addFormBtn = document.getElementById("addFormBtn");
  if (addFormBtn) {
    addFormBtn.addEventListener("click", function () {
      const leadId = document.getElementById("leadId").value;
      if (leadId) {
        // open form template modal for this lead
        window.openFormTemplateModal(leadId);
      } else {
        Utils.showToast("Please save the lead first before creating forms");
      }
    });
  }

  // reset the submission flag just in case
  window.leadSubmissionInProgress = false;
}

function renderPaginatedLeads(leads) {
  // initialize pagination with the filtered leads
  const paginationInfo = Pagination.initPagination(
    leads,
    currentPage,
    pageSize
  );

  // update current page from pagination info
  currentPage = paginationInfo.currentPage;
  totalPages = paginationInfo.totalPages;

  // get only the leads for the current page
  const paginatedLeads = Pagination.getPaginatedItems(
    leads,
    currentPage,
    pageSize
  );

  // render them using the existing UI render functions
  if (currentView === "grid") {
    UI.renderGridView(paginatedLeads);
  } else {
    UI.renderListView(paginatedLeads);
  }

  // update pagination UI
  Pagination.renderPagination({
    totalItems: leads.length,
    totalPages: totalPages,
    currentPage: currentPage,
    pageSize: pageSize,
    onPageChange: (newPage) => {
      currentPage = newPage;
      const filteredLeads = getFilteredLeads();
      renderPaginatedLeads(filteredLeads);
    },
    onPageSizeChange: (newPageSize) => {
      pageSize = newPageSize;
      currentPage = 1;
      const filteredLeads = getFilteredLeads();
      renderPaginatedLeads(filteredLeads);
    },
    containerId: ".leads-container",
  });
}

// render leads based on current view
function renderLeads(leads) {
  // Use renderPaginatedLeads to handle both the pagination and rendering
  renderPaginatedLeads(leads);
}

// get filtered leads based on current filter settings
function getFilteredLeads() {
  const filterStatus = document.getElementById("filterStatus").value;
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  let filteredLeads = [...allLeads];

  // apply search filter
  if (searchTerm) {
    filteredLeads = filteredLeads.filter((lead) => {
      const nameMatch = Utils.getLeadName(lead)
        .toLowerCase()
        .includes(searchTerm);
      const emailMatch =
        lead.email && lead.email.toLowerCase().includes(searchTerm);
      const phoneMatch =
        lead.phone && lead.phone.toLowerCase().includes(searchTerm);
      const businessMatch =
        lead.businessName &&
        lead.businessName.toLowerCase().includes(searchTerm);
      const businessEmailMatch =
        lead.businessEmail &&
        lead.businessEmail.toLowerCase().includes(searchTerm);
      const businessPhoneMatch =
        lead.businessPhone &&
        lead.businessPhone.toLowerCase().includes(searchTerm);
      const textNumberMatch =
        lead.textNumber && lead.textNumber.toLowerCase().includes(searchTerm);
      const messageMatch =
        lead.message && lead.message.toLowerCase().includes(searchTerm);
      const websiteMatch =
        lead.websiteAddress &&
        lead.websiteAddress.toLowerCase().includes(searchTerm);
      const notesMatch =
        lead.notes && lead.notes.toLowerCase().includes(searchTerm);

      return (
        nameMatch ||
        emailMatch ||
        phoneMatch ||
        businessMatch ||
        businessEmailMatch ||
        businessPhoneMatch ||
        textNumberMatch ||
        messageMatch ||
        notesMatch ||
        websiteMatch
      );
    });
  }

  // apply status filter
  if (filterStatus) {
    filteredLeads = filteredLeads.filter((lead) => {
      const leadStatus = (lead.status || "").toLowerCase();
      return (
        leadStatus === filterStatus.toLowerCase() ||
        leadStatus.includes(filterStatus.toLowerCase())
      );
    });
  }

  // apply sorting
  const sortField = document.getElementById("sortField").value;
  const sortOrder = document.getElementById("sortOrder").value;

  // sort logic
  applySorting(filteredLeads, sortField, sortOrder);

  return filteredLeads;
}

// apply sorting to array of leads
function applySorting(leadsToSort, sortField, sortOrder) {
  // if no leads to sort, return
  if (!leadsToSort || leadsToSort.length === 0) {
    return leadsToSort;
  }

  // sort the leads array
  leadsToSort.sort((a, b) => {
    let comparison = 0;

    // handle different field types
    if (sortField === "createdAt") {
      // handle missing dates
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      comparison = dateA - dateB;
    } else if (sortField === "lastContactedAt") {
      // handling for lastContactedAt
      const hasContactA = !!a.lastContactedAt;
      const hasContactB = !!b.lastContactedAt;

      if (hasContactA !== hasContactB) {
        // one has contact date and the other doesn't
        if (sortOrder === "asc") {
          // oldest first N/A entries first
          return hasContactA ? 1 : -1; // false (-1) comes before true (1)
        } else {
          // newest first entries with dates first
          return hasContactA ? -1 : 1; // true (-1) comes before false (1)
        }
      } else if (hasContactA && hasContactB) {
        // both have contact dates, compare normally
        const dateA = new Date(a.lastContactedAt);
        const dateB = new Date(b.lastContactedAt);
        comparison = dateA - dateB;

        // newest first reverse the comparison
        if (sortOrder === "desc") {
          comparison = -comparison; // newer dates come first
        }
      } else {
        // both don't have contact dates, they're equal
        comparison = 0;
      }
    } else if (sortField === "firstName") {
      // sort by last name first, then first name
      const lastNameA = (a.lastName || "").toLowerCase();
      const lastNameB = (b.lastName || "").toLowerCase();

      // last names are different, sort by last name
      if (lastNameA !== lastNameB) {
        comparison = lastNameA.localeCompare(lastNameB);
      } else {
        // last names are the same, sort by first name
        const firstNameA = (a.firstName || "").toLowerCase();
        const firstNameB = (b.firstName || "").toLowerCase();
        comparison = firstNameA.localeCompare(firstNameB);
      }
    } else if (sortField === "businessName") {
      // for business name sorting prioritize leads with business names
      const businessA = a.businessName || "";
      const businessB = b.businessName || "";

      // if one has a business name and the other doesn't, prioritize the one with a name
      if (businessA && !businessB) {
        return -1; // A has business, B doesn't then A comes first
      } else if (!businessA && businessB) {
        return 1; // B has business, A doesn't then B comes first
      } else {
        // both have business names or both don't, compare normally
        comparison = businessA
          .toLowerCase()
          .localeCompare(businessB.toLowerCase());
      }
    } else if (sortField === "businessEmail") {
      // business email sort prioritize leads with business emails
      const emailA = a.businessEmail || "";
      const emailB = b.businessEmail || "";

      // prioritize the one with an email
      if (emailA && !emailB) {
        return -1; // A has email, B doesn't then A comes first
      } else if (!emailA && emailB) {
        return 1; // B has email, A doesn't then B comes first
      } else {
        // both have business emails or both don't, compare normally
        comparison = emailA.toLowerCase().localeCompare(emailB.toLowerCase());
      }
    } else if (sortField === "totalBudget") {
      //  N/A values go to the end
      const valueA =
        a.totalBudget !== undefined && a.totalBudget !== null
          ? parseFloat(a.totalBudget)
          : null;
      const valueB =
        b.totalBudget !== undefined && b.totalBudget !== null
          ? parseFloat(b.totalBudget)
          : null;

      // handle N/A cases
      if (valueA === null && valueB === null) {
        comparison = 0; // both N/A, consider equal
      } else if (valueA === null) {
        return 1; // A is N/A, B has value, A goes to end
      } else if (valueB === null) {
        return -1; // B is N/A, A has value, B goes to end
      } else {
        // both have values, compare normally
        comparison = valueA - valueB;
      }
    } else if (sortField === "remainingBalance") {
      // N/A values go to the end
      const valueA =
        a.remainingBalance !== undefined && a.remainingBalance !== null
          ? parseFloat(a.remainingBalance)
          : null;
      const valueB =
        b.remainingBalance !== undefined && b.remainingBalance !== null
          ? parseFloat(b.remainingBalance)
          : null;

      // Handle N/A cases
      if (valueA === null && valueB === null) {
        comparison = 0; // Both N/A, consider equal
      } else if (valueA === null) {
        return 1; // A is N/A, B has value, A goes to end
      } else if (valueB === null) {
        return -1; // B is N/A, A has value, B goes to end
      } else {
        // both have values, compare normally
        comparison = valueA - valueB;
      }
    } else if (sortField === "status") {
      // order new, contacted, in-progress, closed-won, closed-lost
      const statusOrder = {
        new: 1,
        contacted: 2,
        "in-progress": 3,
        "closed-won": 4,
        "closed-lost": 5,
      };

      const statusA = a.status ? a.status.toLowerCase() : "new";
      const statusB = b.status ? b.status.toLowerCase() : "new";

      const orderA = statusOrder[statusA] || 999;
      const orderB = statusOrder[statusB] || 999;

      comparison = orderA - orderB;
    } else {
      // for other fields, do a basic comparison
      const valueA = a[sortField] || "";
      const valueB = b[sortField] || "";

      if (typeof valueA === "string" && typeof valueB === "string") {
        comparison = valueA.toLowerCase().localeCompare(valueB.toLowerCase());
      } else {
        if (valueA < valueB) comparison = -1;
        if (valueA > valueB) comparison = 1;
      }
    }

    // apply sort order (ascending or descending) for normal comparisons
    // for lastContactedAt we've already handled the orders specially
    if (sortField === "lastContactedAt") {
      return comparison;
    } else {
      return sortOrder === "asc" ? comparison : -comparison;
    }
  });

  return leadsToSort;
}

// search leads based on input
function searchLeads() {
  // reset to first page when searching
  currentPage = 1;

  const filteredLeads = getFilteredLeads();
  renderPaginatedLeads(filteredLeads);
}

// filter leads by status

function filterLeads() {
  // reset to first page when changing filters
  currentPage = 1;

  const filteredLeads = getFilteredLeads();
  renderPaginatedLeads(filteredLeads);
}

// sort leads based on sort field and order
function sortLeads() {
  const filteredLeads = getFilteredLeads();
  renderPaginatedLeads(filteredLeads);
}

// sort leads and render them
function sortLeadsAndRender(leadsToSort) {
  const sortField = document.getElementById("sortField").value;
  const sortOrder = document.getElementById("sortOrder").value;

  // if no leads to sort, return
  if (!leadsToSort || leadsToSort.length === 0) {
    renderPaginatedLeads([]);
    return;
  }

  // create a copy of the array to avoid modifying the original
  const sortedLeads = [...leadsToSort];

  // sort leads
  applySorting(sortedLeads, sortField, sortOrder);

  // render the sorted results with pagination
  renderPaginatedLeads(sortedLeads);
}

// Export functionality
function showExportModal() {
  const modal = document.getElementById("exportModal");
  const modalTitle = document.getElementById("exportModalTitle");
  
  // Reset modal title for bulk export
  modalTitle.textContent = "Export All Leads";
  modal.style.display = "block";
  
  // Setup export modal event listeners
  document.getElementById("closeExportModal").onclick = () => {
    modal.style.display = "none";
  };
  
  document.getElementById("exportJsonBtn").onclick = () => {
    exportAllLeads("json");
    modal.style.display = "none";
  };
  
  document.getElementById("exportCsvBtn").onclick = () => {
    exportAllLeads("csv");
    modal.style.display = "none";
  };
}

async function exportAllLeads(format) {
  try {
    console.log(`Starting ${format.toUpperCase()} export of all leads...`);
    
    // Get all leads
    const leads = allLeads || [];
    if (leads.length === 0) {
      alert("No leads to export");
      return;
    }
    
    // Collect payment data for all leads
    const leadsWithPayments = await Promise.all(
      leads.map(async (lead) => {
        try {
          const payments = await API.fetchLeadPayments(lead._id);
          const paymentCount = payments.length;
          const totalPayments = parseFloat(payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2));
          
          return {
            // Lead ID and Personal Info First
            _id: lead._id,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            phoneExt: lead.phoneExt,
            textNumber: lead.textNumber,
            
            // Business Info (with address included in business section)
            businessName: lead.businessName,
            businessPhone: lead.businessPhone,
            businessPhoneExt: lead.businessPhoneExt,
            businessEmail: lead.businessEmail,
            websiteAddress: lead.websiteAddress,
            businessServices: lead.businessServices,
            billingStreet: lead.billingAddress?.street || '',
            billingAptUnit: lead.billingAddress?.aptUnit || '',
            billingCity: lead.billingAddress?.city || '',
            billingState: lead.billingAddress?.state || '',
            billingZipCode: lead.billingAddress?.zipCode || '',
            billingCountry: lead.billingAddress?.country || '',
            
            // Service & Status Info
            serviceDesired: lead.serviceDesired,
            hasWebsite: lead.hasWebsite,
            preferredContact: lead.preferredContact,
            status: lead.status,
            
            // Dates
            createdAt: lead.createdAt,
            lastContactedAt: lead.lastContactedAt,
            
            // Financial Info
            budget: lead.budget,
            totalBudget: lead.totalBudget,
            paidAmount: lead.paidAmount,
            remainingBalance: lead.remainingBalance,
            
            // Payment Summary
            paymentCount,
            totalPayments,
            
            // Individual Payments
            payments: payments.map(payment => ({
              amount: payment.amount,
              paymentDate: payment.paymentDate,
              notes: payment.notes || ""
            })),
            
            // Messages & Notes
            message: lead.message,
            notes: lead.notes
          };
        } catch (error) {
          console.error(`Error fetching payments for lead ${lead._id}:`, error);
          return {
            // Lead ID and Personal Info First
            _id: lead._id,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            phoneExt: lead.phoneExt,
            textNumber: lead.textNumber,
            
            // Business Info (with address included in business section)
            businessName: lead.businessName,
            businessPhone: lead.businessPhone,
            businessPhoneExt: lead.businessPhoneExt,
            businessEmail: lead.businessEmail,
            websiteAddress: lead.websiteAddress,
            businessServices: lead.businessServices,
            billingStreet: lead.billingAddress?.street || '',
            billingAptUnit: lead.billingAddress?.aptUnit || '',
            billingCity: lead.billingAddress?.city || '',
            billingState: lead.billingAddress?.state || '',
            billingZipCode: lead.billingAddress?.zipCode || '',
            billingCountry: lead.billingAddress?.country || '',
            
            // Service & Status Info
            serviceDesired: lead.serviceDesired,
            hasWebsite: lead.hasWebsite,
            preferredContact: lead.preferredContact,
            status: lead.status,
            
            // Dates
            createdAt: lead.createdAt,
            lastContactedAt: lead.lastContactedAt,
            
            // Financial Info
            budget: lead.budget,
            totalBudget: lead.totalBudget,
            paidAmount: lead.paidAmount,
            remainingBalance: lead.remainingBalance,
            
            // Payment Summary
            paymentCount: 0,
            totalPayments: 0,
            
            // Individual Payments
            payments: [],
            
            // Messages & Notes
            message: lead.message,
            notes: lead.notes
          };
        }
      })
    );
    
    const timestamp = Utils.getLocalDateString(); // YYYY-MM-DD format in local timezone
    const filename = `devleads-export-${leads.length}-leads-${timestamp}`;
    
    if (format === "json") {
      exportAsJSON(leadsWithPayments, filename);
    } else {
      exportAsCSV(leadsWithPayments, filename);
    }
    
    console.log(`${format.toUpperCase()} export completed successfully`);
  } catch (error) {
    console.error("Error exporting leads:", error);
    alert("Error exporting leads. Please try again.");
  }
}

function exportAsJSON(data, filename) {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportAsCSV(data, filename) {
  if (data.length === 0) return;
  
  // Define CSV headers
  const headers = [
    "Lead ID",
    "First Name",
    "Last Name", 
    "Email",
    "Phone",
    "Phone Extension",
    "Text Number",
    "Business Name",
    "Business Phone",
    "Business Phone Extension", 
    "Business Email",
    "Website Address",
    "Billing Street",
    "Billing Apt/Unit",
    "Billing City",
    "Billing State",
    "Billing ZIP",
    "Billing Country",
    "Service Desired",
    "Status",
    "Created Date",
    "Last Contacted",
    "Budget",
    "Total Budget",
    "Paid Amount",
    "Remaining Balance",
    "Payment Count",
    "Total Payments",
    "Individual Payments",
    "Customer Message",
    "Internal Notes"
  ];
  
  // Create CSV rows
  const csvRows = data.map(lead => {
    const paymentsString = lead.payments && lead.payments.length > 0 
      ? lead.payments.map(p => `$${p.amount} (${p.paymentDate})${p.notes ? ' - ' + p.notes : ''}`).join('; ')
      : '';
    
    return [
      lead._id || '',
      lead.firstName || '',
      lead.lastName || '',
      lead.email || '',
      lead.phone || '',
      lead.phoneExt || '',
      lead.textNumber || '',
      lead.businessName || '',
      lead.businessPhone || '',
      lead.businessPhoneExt || '',
      lead.businessEmail || '',
      lead.websiteAddress || '',
      lead.billingStreet || '',
      lead.billingAptUnit || '',
      lead.billingCity || '',
      lead.billingState || '',
      lead.billingZipCode || '',
      lead.billingCountry || '',
      lead.serviceDesired || '',
      lead.status || '',
      lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '',
      lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : '',
      lead.budget || '',
      lead.totalBudget || '',
      lead.paidAmount || 0,
      lead.remainingBalance || 0,
      lead.paymentCount || 0,
      lead.totalPayments || 0,
      paymentsString,
      lead.message || '',
      lead.notes || ''
    ].map(field => `"${String(field).replace(/"/g, '""')}"`);
  });
  
  // Combine headers and rows
  const csvContent = [headers.map(h => `"${h}"`), ...csvRows]
    .map(row => row.join(","))
    .join("\n");
  
  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Single lead export modal functions
function showSingleLeadExportModal(leadData) {
  const modal = document.getElementById("exportModal");
  const modalTitle = document.getElementById("exportModalTitle");
  modalTitle.textContent = `Export Lead: ${leadData.firstName} ${leadData.lastName}`;
  modal.style.display = "block";
  
  // Setup export modal event listeners for single lead
  document.getElementById("closeExportModal").onclick = () => {
    modal.style.display = "none";
  };
  
  document.getElementById("exportJsonBtn").onclick = () => {
    exportSingleLeadAsJSON(leadData);
    modal.style.display = "none";
  };
  
  document.getElementById("exportCsvBtn").onclick = () => {
    exportSingleLeadAsCSV(leadData);
    modal.style.display = "none";
  };
}

function exportSingleLeadAsJSON(leadData) {
  const jsonData = JSON.stringify([leadData], null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const timestamp = Utils.getLocalDateString();
  const cleanName = `${leadData.firstName}-${leadData.lastName}`.replace(/[^a-zA-Z0-9-]/g, '_');
  const filename = `devleads-lead-${cleanName}-${timestamp}`;
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportSingleLeadAsCSV(leadData) {
  // Define CSV headers (matching bulk export structure)
  const headers = [
    "Lead ID",
    "First Name",
    "Last Name", 
    "Email",
    "Phone",
    "Phone Extension",
    "Text Number",
    "Business Name",
    "Business Phone",
    "Business Phone Extension", 
    "Business Email",
    "Website Address",
    "Billing Street",
    "Billing Apt/Unit",
    "Billing City",
    "Billing State",
    "Billing ZIP",
    "Billing Country",
    "Service Desired",
    "Status",
    "Created Date",
    "Last Contacted",
    "Budget",
    "Total Budget",
    "Paid Amount",
    "Remaining Balance",
    "Payment Count",
    "Total Payments",
    "Individual Payments",
    "Customer Message",
    "Internal Notes"
  ];
  
  // Create payments string
  const paymentsString = leadData.payments && leadData.payments.length > 0 
    ? leadData.payments.map(p => `$${p.amount} (${p.paymentDate})${p.notes ? ' - ' + p.notes : ''}`).join('; ')
    : '';
  
  // Create CSV row (matching bulk export structure)
  const csvRow = [
    leadData._id || '',
    leadData.firstName || '',
    leadData.lastName || '',
    leadData.email || '',
    leadData.phone || '',
    leadData.phoneExt || '',
    leadData.textNumber || '',
    leadData.businessName || '',
    leadData.businessPhone || '',
    leadData.businessPhoneExt || '',
    leadData.businessEmail || '',
    leadData.websiteAddress || '',
    leadData.billingStreet || '',
    leadData.billingAptUnit || '',
    leadData.billingCity || '',
    leadData.billingState || '',
    leadData.billingZipCode || '',
    leadData.billingCountry || '',
    leadData.serviceDesired || '',
    leadData.status || '',
    leadData.createdAt ? new Date(leadData.createdAt).toLocaleDateString() : '',
    leadData.lastContactedAt ? new Date(leadData.lastContactedAt).toLocaleDateString() : '',
    leadData.budget || '',
    leadData.totalBudget || '',
    leadData.paidAmount || 0,
    leadData.remainingBalance || 0,
    leadData.paymentCount || 0,
    leadData.totalPayments || 0,
    paymentsString,
    leadData.message || '',
    leadData.notes || ''
  ].map(field => `"${String(field).replace(/"/g, '""')}"`);
  
  // Combine headers and row
  const csvContent = [headers.map(h => `"${h}"`), csvRow]
    .map(row => row.join(","))
    .join("\n");
  
  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const timestamp = Utils.getLocalDateString();
  const cleanName = `${leadData.firstName}-${leadData.lastName}`.replace(/[^a-zA-Z0-9-]/g, '_');
  const filename = `devleads-lead-${cleanName}-${timestamp}`;
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export {
  fetchLeadsAndRender,
  sortLeadsAndRender,
  renderLeads,
  renderPaginatedLeads,
  getFilteredLeads,
  filterLeads,
  sortLeads,
  searchLeads,
  applySorting,
};
