import {
  formatCurrency,
  formatDate,
  getLeadName,
  capitalizeFirstLetter,
  safeSetTextContent,
} from "./utils.js";

let currentView = "grid"; 

// render leads based on current view
function renderLeads(leads) {
  if (currentView === "grid") {
    renderGridView(leads);
  } else {
    renderListView(leads);
  }
}

// render grid view of leads
function renderGridView(leads) {
  const leadCards = document.getElementById("leadCards");
  if (!leadCards) {
    console.error("Lead cards container not found");
    return;
  }

  leadCards.innerHTML = "";

  if (!leads || leads.length === 0) {
    leadCards.innerHTML = '<div class="lead-card"><p>No leads found</p></div>';
    return;
  }

  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  leads.forEach((lead) => {
    const card = document.createElement("div");
    card.className = "lead-card clickable";
    card.dataset.leadId = lead._id;

    // handle name display
    const fullName = getLeadName(lead);

    const businessName =
      lead.businessName || lead.firstName + " " + lead.lastName;

    // format last contacted date if available
    let lastContactedText = "";
    if (lead.lastContactedAt) {
      const contactDate = new Date(lead.lastContactedAt);
      lastContactedText = `<p><strong>Last Contact:</strong> ${formatDate(
        contactDate,
        dateFormat
      )}</p>`;
    }

    card.innerHTML = `
      <div id="code-icon"><i class="fa-solid fa-laptop-code"></i></div>
      <h3>${fullName}</h3>
      <p><strong>Business:</strong> ${businessName}</p>
      ${lastContactedText}
      <p><strong>Status:</strong> <span class="lead-status status-${(
        lead.status || "new"
      ).toLowerCase()}">${capitalizeFirstLetter(
      lead.status || "new"
    )}</span></p>
    `;

    // add click event to the entire card
    card.addEventListener("click", function () {
      // using window.openLeadModal as the function will be defined in dashboard.js
      window.openLeadModal(lead._id);
    });

    leadCards.appendChild(card);
  });
}

// render list view of leads
function renderListView(leads) {
  const leadsTableBody = document.getElementById("leadsTableBody");
  if (!leadsTableBody) {
    console.error("Leads table body not found");
    return;
  }

  leadsTableBody.innerHTML = "";

  if (!leads || leads.length === 0) {
    leadsTableBody.innerHTML = '<tr><td colspan="4">No leads found</td></tr>';
    return;
  }

  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  leads.forEach((lead) => {
    const row = document.createElement("tr");
    row.className = "clickable";
    row.dataset.leadId = lead._id;

    // handle name display
    const fullName = getLeadName(lead);

    // determine business info and handle empty values
    const business = lead.businessName || lead.firstName + " " + lead.lastName;

    // format last contacted date if available
    let lastContactCell = "<td>Not contacted</td>";
    if (lead.lastContactedAt) {
      const contactDate = new Date(lead.lastContactedAt);
      lastContactCell = `<td>${formatDate(contactDate, dateFormat)}</td>`;
    }

    row.innerHTML = `
      <td><span title="${fullName}">${fullName}</span></td>
      <td><span title="${business}">${business}</span></td>
      ${lastContactCell}
      <td><span class="lead-status status-${(
        lead.status || "new"
      ).toLowerCase()}">${capitalizeFirstLetter(
      lead.status || "new"
    )}</span></td>
    `;

    // add click event to the row
    row.addEventListener("click", function () {
      // using window.openLeadModal as the function will be defined in dashboard.js
      window.openLeadModal(lead._id);
    });

    leadsTableBody.appendChild(row);
  });
}

// switch between grid and list views
function switchView(view) {
  currentView = view;

  // save the current view to localStorage
  localStorage.setItem("preferredView", view);

  if (view === "grid") {
    document.getElementById("leadCards").style.display = "grid";
    document.getElementById("leadsTable").style.display = "none";
    document.getElementById("gridViewBtn").classList.add("active");
    document.getElementById("listViewBtn").classList.remove("active");
  } else {
    document.getElementById("leadCards").style.display = "none";
    document.getElementById("leadsTable").style.display = "table";
    document.getElementById("gridViewBtn").classList.remove("active");
    document.getElementById("listViewBtn").classList.add("active");
  }
}

function updateModalActionButtons(leadId) {
  // check if modal actions container exists, create if not
  let actionsContainer = document.getElementById("modalActions");
  if (!actionsContainer) {
    actionsContainer = document.createElement("div");
    actionsContainer.id = "modalActions";
    actionsContainer.className = "modal-actions";

    // find a good place to insert it after the modal header
    const modalHeader = document.querySelector(".modal-header");
    if (modalHeader) {
      modalHeader.insertAdjacentElement("afterend", actionsContainer);
    }
  }

  // get the modal element
  const modal = document.getElementById("leadModal");

  // set the initial mode to read-only
  if (modal) {
    modal.classList.add("lead-modal-readonly");
    modal.classList.remove("lead-modal-edit");
  }

  // clear existing buttons
  actionsContainer.innerHTML = "";

  // create Edit button
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "btn btn-primary";
  editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
  editButton.addEventListener("click", function () {
    // toggle modal classes for CSS targeting
    if (modal) {
      modal.classList.remove("lead-modal-readonly");
      modal.classList.add("lead-modal-edit");
    }

    // set to edit mode
    setModalReadOnly(false);
    document.getElementById("modalTitle").textContent = "Edit";

    // hide the action buttons when in edit mode
    actionsContainer.style.display = "none";

    // fetch and re-render payments to show action buttons
    const leadId = document.getElementById("leadId").value;
    if (leadId) {
      // these functions will be globally available from dashboard.js
      window.fetchLeadPayments(leadId).then((leadPayments) => {
        window.renderLeadPayments(leadPayments, leadId);
      });

      // reload lead forms to ensure they have action buttons
      if (typeof window.loadLeadForms === "function") {
        window.loadLeadForms(leadId);
      }
    }
  });

  // create Delete button
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn btn-danger";
  deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
  deleteButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to delete this?")) {
      // this function will be globally available from dashboard.js
      window.deleteLeadAction(leadId);
    }
  });

  // create Export button
  const exportButton = document.createElement("button");
  exportButton.type = "button";
  exportButton.className = "btn btn-info";
  exportButton.innerHTML = '<i class="fas fa-file-export"></i> Export Lead';
  exportButton.addEventListener("click", function () {
    window.exportSingleLead(leadId);
  });

  // add buttons to container
  actionsContainer.appendChild(editButton);
  actionsContainer.appendChild(exportButton);
  actionsContainer.appendChild(deleteButton);
}

function setModalReadOnly(isReadOnly) {
  const formElements = document.querySelectorAll(
    "#leadForm input, #leadForm select, #leadForm textarea"
  );

  formElements.forEach((element) => {
    if (isReadOnly) {
      element.setAttribute("readonly", true);
      if (element.tagName === "SELECT") {
        element.setAttribute("disabled", true);
      }
    } else {
      element.removeAttribute("readonly");
      if (element.tagName === "SELECT") {
        element.removeAttribute("disabled");
      }
    }
  });

  // always keep these fields read-only
  const paidAmountField = document.getElementById("paidAmount");
  if (paidAmountField) {
    paidAmountField.setAttribute("readonly", true);
  }

  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField) {
    remainingBalanceField.setAttribute("readonly", true);
  }

  // show/hide the form submission button based on mode
  const submitButton = document.querySelector(
    '#leadForm button[type="submit"]'
  );
  if (submitButton) {
    submitButton.style.display = isReadOnly ? "none" : "block";
  }

  // show/hide Add Payment button based on mode
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  if (addPaymentBtn) {
    addPaymentBtn.style.display = isReadOnly ? "none" : "block";
  }

  // show/hide Add Form button based on mode
  const addFormBtn = document.getElementById("addFormBtn");
  if (addFormBtn) {
    addFormBtn.style.display = isReadOnly ? "none" : "block";
  }

  // show/hide form action buttons view, edit, delete
  const formActions = document.querySelectorAll(".form-actions");
  formActions.forEach((actionButtons) => {
    actionButtons.style.display = isReadOnly ? "none" : "flex";
  });

  // hide/show payment action buttons
  const paymentActions = document.querySelectorAll(".payment-actions");
  paymentActions.forEach((actionButtons) => {
    actionButtons.style.display = isReadOnly ? "none" : "flex";
  });

  // update document UI elements based on mode
  if (typeof window.updateDocumentUiForMode === "function") {
    window.updateDocumentUiForMode();
  }
}

function calculateStats(allLeads, payments) {
  try {
    // debug info
    console.log("=== ANALYTICS CALCULATION START ===");
    console.log("Calculating stats with:", {
      leadsCount: allLeads ? allLeads.length : 0,
      paymentsCount: payments ? payments.length : 0,
    });

    // if no leads, display zeros and return
    if (!allLeads || allLeads.length === 0) {
      safeSetTextContent("totalLeadsValue", "0");
      safeSetTextContent("newLeadsValue", "0");
      safeSetTextContent("conversionRateValue", "0%");
      safeSetTextContent("monthlyPaymentsValue", formatCurrency(0, "USD"));
      safeSetTextContent("totalEarningsValue", formatCurrency(0, "USD"));
      return;
    }

    // get current date in USER'S LOCAL TIMEZONE (not UTC)
    const nowLocal = new Date();
    
    // extract LOCAL timezone components not UTC
    const currentYearLocal = nowLocal.getFullYear();
    const currentMonthLocal = nowLocal.getMonth(); // 0-indexed local month
    const currentDayLocal = nowLocal.getDate();
    
    console.log("=== TIMEZONE DEBUG INFO ===");
    console.log("Current local time:", nowLocal.toLocaleString());
    console.log("Current UTC time:", nowLocal.toISOString());
    console.log("Local timezone offset (minutes):", nowLocal.getTimezoneOffset());
    console.log("Local year:", currentYearLocal);
    console.log("Local month (0-indexed):", currentMonthLocal);
    console.log("Local day:", currentDayLocal);


    // current month start 1st day of current month, local midnight
    const currentMonthStartLocal = new Date(currentYearLocal, currentMonthLocal, 1);
    
    // Start of the *next* day from the current date (local midnight)
    // upper bound for the current day/month filter
    const startOfNextDayLocal = new Date(currentYearLocal, currentMonthLocal, currentDayLocal + 1);

    // previous month start 1st day of previous month, local midnight
    const previousMonthStartLocal = new Date(currentYearLocal, currentMonthLocal - 1, 1);

    // previous month end last day of previous month, local midnight
    // start of the current month at local midnight
    const previousMonthEndLocal = currentMonthStartLocal;

    console.log("=== DATE BOUNDARIES (LOCAL TIMEZONE) ===");
    console.log("Current month start (local):", currentMonthStartLocal.toLocaleString());
    console.log("Start of next day (local):", startOfNextDayLocal.toLocaleString());
    console.log("Previous month start (local):", previousMonthStartLocal.toLocaleString());
    console.log("Previous month end (local):", previousMonthEndLocal.toLocaleString());
    
    console.log("=== DATE BOUNDARIES (ISO/UTC for comparison) ===");
    console.log("Current month start (UTC):", currentMonthStartLocal.toISOString());
    console.log("Start of next day (UTC):", startOfNextDayLocal.toISOString());
    console.log("Previous month start (UTC):", previousMonthStartLocal.toISOString());
    console.log("Previous month end (UTC):", previousMonthEndLocal.toISOString());

    // new Leads Calculation
    const currentMonthNewLeads = allLeads.filter((lead) => {
      if (!lead.createdAt) return false;
      
      const leadDate = new Date(lead.createdAt); // parse lead date (stored as UTC/ISO)
      
      // convert the UTC stored date to local comparison
      // we compare the stored UTC date against our local timezone boundaries
      const isInCurrentPeriod = leadDate >= currentMonthStartLocal && leadDate < startOfNextDayLocal;
      
      if (isInCurrentPeriod) {
        console.log(`Lead "${lead.firstName} ${lead.lastName}" created on ${leadDate.toLocaleString()} is in current period`);
      }
      
      return isInCurrentPeriod;
    });

    const previousMonthNewLeads = allLeads.filter((lead) => {
      if (!lead.createdAt) return false;
      
      const leadDate = new Date(lead.createdAt); // parse lead date (stored as UTC/ISO)
      
      // convert the UTC stored date to local comparison
      const isInPreviousPeriod = leadDate >= previousMonthStartLocal && leadDate < previousMonthEndLocal;
      
      if (isInPreviousPeriod) {
        console.log(`Lead "${lead.firstName} ${lead.lastName}" created on ${leadDate.toLocaleString()} is in previous period`);
      }
      
      return isInPreviousPeriod;
    });

    console.log("=== LEADS ANALYSIS ===");
    console.log(`Current period leads: ${currentMonthNewLeads.length}`);
    console.log(`Previous period leads: ${previousMonthNewLeads.length}`);

    // display new leads count
    safeSetTextContent("newLeadsValue", currentMonthNewLeads.length);

    // calculate percentage change for new leads
    let newLeadsChange = 0;
    if (previousMonthNewLeads.length > 0) {
      newLeadsChange =
        ((currentMonthNewLeads.length - previousMonthNewLeads.length) /
          previousMonthNewLeads.length) *
        100;
    } else if (currentMonthNewLeads.length > 0) {
      newLeadsChange = 100; // if no leads last month but some this month, that's a 100% increase
    }

    console.log(`New leads change: ${newLeadsChange.toFixed(1)}%`);

    // update new leads change display
    const newLeadsChangeSpan = document.querySelector(
      "#newLeadsValue + .change span"
    );
    if (newLeadsChangeSpan) {
      if (newLeadsChange > 0) {
        newLeadsChangeSpan.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(
          newLeadsChange
        ).toFixed(1)}% from last month`;
        newLeadsChangeSpan.closest(".change").className = "change positive";
      } else if (newLeadsChange < 0) {
        newLeadsChangeSpan.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(
          newLeadsChange
        ).toFixed(1)}% from last month`;
        newLeadsChangeSpan.closest(".change").className = "change negative";
      } else {
        newLeadsChangeSpan.innerHTML = `<i class="fas fa-minus"></i> 0.0% from last month`;
        newLeadsChangeSpan.closest(".change").className = "change";
      }
    }

    // total projects 
    safeSetTextContent("totalLeadsValue", allLeads.length);

    // handle payments calculation
    if (!payments || !Array.isArray(payments)) {
      console.error("Invalid payments array:", payments);
      payments = [];
    }

    // create a set of valid lead IDs for faster lookups
    const validLeadIds = new Set(allLeads.map((lead) => lead._id));

    // only process payments for existing leads
    const validPayments = payments.filter((payment) => {
      return payment && payment.leadId && validLeadIds.has(payment.leadId);
    });

    console.log("=== PAYMENTS ANALYSIS ===");
    console.log("Valid payments count:", validPayments.length);

    // current month payments using local timezone boundaries
    const currentMonthPayments = validPayments.filter((payment) => {
      if (!payment.paymentDate) return false;

      // parse the stored UTC payment date
      const paymentDate = new Date(payment.paymentDate);
      
      // compare against local timezone boundaries
      const isInCurrentPeriod = paymentDate >= currentMonthStartLocal && paymentDate < startOfNextDayLocal;
      
      if (isInCurrentPeriod) {
        console.log(`Payment of $${payment.amount} on ${paymentDate.toLocaleString()} is in current period`);
      }
      
      return isInCurrentPeriod;
    });

    // previous month payments using local timezone boundaries
    const previousMonthPayments = validPayments.filter((payment) => {
      if (!payment.paymentDate) return false;
      
      const paymentDate = new Date(payment.paymentDate); // Parse payment date stored as UTC/ISO
      
      // compare against local timezone boundaries
      const isInPreviousPeriod = paymentDate >= previousMonthStartLocal && paymentDate < previousMonthEndLocal;
      
      if (isInPreviousPeriod) {
        console.log(`Payment of $${payment.amount} on ${paymentDate.toLocaleString()} is in previous period`);
      }
      
      return isInPreviousPeriod;
    });

    console.log(`Current period payments: ${currentMonthPayments.length}`);
    console.log(`Previous period payments: ${previousMonthPayments.length}`);

    // calculate totals
    const currentMonthTotal = parseFloat(currentMonthPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0).toFixed(2));

    const previousMonthTotal = parseFloat(previousMonthPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0).toFixed(2));

    console.log(`Current period total: $${currentMonthTotal}`);
    console.log(`Previous period total: $${previousMonthTotal}`);

    // update monthly payments display
    safeSetTextContent(
      "monthlyPaymentsValue",
      formatCurrency(currentMonthTotal)
    );

    // calculate percentage change for payments
    let paymentsChange = 0;
    if (previousMonthTotal > 0) {
      paymentsChange =
        ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      paymentsChange = 100; // if no payments last month but some this month, that's a 100% increase
    }

    console.log(`Payments change: ${paymentsChange.toFixed(1)}%`);

    // update payments change display
    const paymentsChangeSpan = document.querySelector(
      "#monthlyPaymentsValue + .change span"
    );
    if (paymentsChangeSpan) {
      if (paymentsChange > 0) {
        paymentsChangeSpan.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(
          paymentsChange
        ).toFixed(1)}% from last month`;
        paymentsChangeSpan.closest(".change").className = "change positive";
      } else if (paymentsChange < 0) {
        paymentsChangeSpan.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(
          paymentsChange
        ).toFixed(1)}% from last month`;
        paymentsChangeSpan.closest(".change").className = "change negative";
      } else {
        paymentsChangeSpan.innerHTML = `<i class="fas fa-minus"></i> 0.0% from last month`;
        paymentsChangeSpan.closest(".change").className = "change";
      }
    }

    // total earnings calculation 
    const totalEarnings = parseFloat(validPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0).toFixed(2));

    console.log(`Total earnings (all-time): $${totalEarnings}`);

    // display total earnings
    safeSetTextContent("totalEarningsValue", formatCurrency(totalEarnings));

    // conversion rate calculation
    const closedWonLeads = allLeads.filter(
      (lead) =>
        lead.status &&
        (lead.status.toLowerCase() === "closed-won" ||
          lead.status.toLowerCase() === "won")
    );

    const conversionRate =
      allLeads.length > 0
        ? Math.round((closedWonLeads.length / allLeads.length) * 100)
        : 0;

    console.log(`Conversion rate: ${conversionRate}% (${closedWonLeads.length}/${allLeads.length})`);

    safeSetTextContent("conversionRateValue", `${conversionRate}%`);

    console.log("=== ANALYTICS CALCULATION COMPLETE ===");
    
  } catch (error) {
    console.error("Error calculating statistics:", error, error.stack);

    // set default values in case of error
    safeSetTextContent("totalLeadsValue", "0");
    safeSetTextContent("newLeadsValue", "0");
    safeSetTextContent("conversionRateValue", "0%");
    safeSetTextContent("monthlyPaymentsValue", formatCurrency(0, "USD"));
    safeSetTextContent("totalEarningsValue", formatCurrency(0, "USD"));
  }
}


// Export single lead functionality
async function exportSingleLead(leadId) {
  try {
    console.log(`Starting export for lead ID: ${leadId}`);
    
    // Find the lead in allLeads
    const lead = window.allLeads?.find(l => l._id === leadId);
    if (!lead) {
      alert("Lead not found");
      return;
    }
    
    // Fetch payment data for this lead
    const leadPayments = await API.fetchLeadPayments(leadId);
    console.log(`Found ${leadPayments.length} payments for lead ${leadId}:`, leadPayments);
    
    // Create lead data with payment information
    const leadWithPayments = {
      ...lead,
      paymentCount: leadPayments.length,
      totalPayments: parseFloat(leadPayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)),
      payments: leadPayments.map(payment => ({
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        notes: payment.notes || ""
      }))
    };
    
    // Show export options modal
    showSingleLeadExportModal(leadWithPayments);
    
  } catch (error) {
    console.error("Error exporting single lead:", error);
    alert("Error exporting lead. Please try again.");
  }
}

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
  // Define CSV headers
  const headers = [
    "Lead ID", "First Name", "Last Name", "Email", "Phone", "Business Name",
    "Service Desired", "Status", "Created Date", "Last Contacted", "Budget",
    "Total Budget", "Paid Amount", "Remaining Balance", "Payment Count",
    "Total Payments", "Customer Message", "Internal Notes", "Individual Payments"
  ];
  
  // Create payments string
  const paymentsString = leadData.payments && leadData.payments.length > 0 
    ? leadData.payments.map(p => `$${p.amount} (${p.paymentDate})${p.notes ? ' - ' + p.notes : ''}`).join('; ')
    : '';
  
  // Create CSV row
  const csvRow = [
    leadData._id || '',
    leadData.firstName || '',
    leadData.lastName || '',
    leadData.email || '',
    leadData.phone || '',
    leadData.businessName || '',
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
    leadData.message || '',
    leadData.notes || '',
    paymentsString
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
  renderLeads,
  renderGridView,
  renderListView,
  switchView,
  updateModalActionButtons,
  setModalReadOnly,
  calculateStats,
  exportSingleLead,
};
