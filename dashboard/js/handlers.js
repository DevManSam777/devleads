import {
  showInputError,
  clearInputError,
  getErrorElement,
  formatCurrency,
  showToast,
  formatDate,
  formatPhoneInput,
  initializeMonetaryInputs,
} from "./utils.js";
import {
  createLead,
  updateLead,
  deleteLead,
  fetchLeadPayments,
} from "./api.js";
import { setModalReadOnly } from "./ui.js";
import { renderLeadPayments } from "./payments.js";
import { loadLeadForms } from "./leadForms.js";

function handleTextareaResize() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
}

function setupFormValidation() {
  const emailFields = ["email", "businessEmail"];
  emailFields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener("blur", function () {
        // only validate businessEmail if it has a value
        if (fieldId === "businessEmail" && !this.value) {
          clearInputError(this, getErrorElement(this));
          return true;
        }
        validateEmail(this);
      });
    }
  });

  const phoneFields = ["phone", "businessPhone", "textNumber"];
  phoneFields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener("blur", function () {
        // only validate optional phone fields if they have a value
        if (
          (fieldId === "businessPhone" || fieldId === "textNumber") &&
          !this.value
        ) {
          clearInputError(this, getErrorElement(this));
          return true;
        }
        validatePhone(this);
      });
    }
  });

  const nameFields = ["firstName", "lastName"];
  nameFields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener("blur", function () {
        validateName(
          this,
          fieldId === "firstName" ? "First name" : "Last name"
        );
      });
    }
  });

  const websiteInput = document.getElementById("websiteAddress");
  if (websiteInput) {
    websiteInput.addEventListener("blur", function () {
      // only validate if hasWebsite is 'yes' and field has value
      const hasWebsite = document.getElementById("hasWebsite").value;
      if (hasWebsite === "yes" && this.value) {
        validateUrl(this);
      } else {
        clearInputError(this, getErrorElement(this));
      }
    });
  }

  const totalBudgetInput = document.getElementById("totalBudget");
  if (totalBudgetInput) {
    totalBudgetInput.addEventListener("blur", function () {
      if (this.value) {
        validateBudget(this);
      } else {
        clearInputError(this, getErrorElement(this));
      }
    });
  }

  const addFormBtn = document.getElementById("addFormBtn");
  if (addFormBtn) {
    addFormBtn.addEventListener("click", function () {
      const leadId = document.getElementById("leadId").value;
      if (leadId) {
        window.openFormTemplateModal(leadId);
      } else {
        showToast("Please save the lead first before creating forms");
      }
    });
  }

  setupAddressMapListeners();
}

function setupAddressMapListeners() {
  const addressFields = [
    "billingStreet",
    "billingAptUnit",
    "billingCity",
    "billingState",
    "billingZipCode",
  ];

  addressFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("change", addAddressMapButton);
    }
  });
}

function addAddressMapButton() {
  const street = document.getElementById("billingStreet").value || "";
  const aptUnit = document.getElementById("billingAptUnit").value || "";
  const city = document.getElementById("billingCity").value || "";
  const state = document.getElementById("billingState").value || "";
  const zipCode = document.getElementById("billingZipCode").value || "";

  // create the full address (include apt/unit if it exists)
  let fullAddress = street;
  if (aptUnit) fullAddress += ` ${aptUnit}`;
  if (city) fullAddress += `, ${city}`;
  if (state) fullAddress += `, ${state}`;
  if (zipCode) fullAddress += ` ${zipCode}`;

  // only create the map link if we have a minimally valid address (street and city)
  if (street && city) {
    let mapLinkContainer = document.getElementById("addressMapLink");
    if (!mapLinkContainer) {
      const addressSection = document.querySelector(
        "#address-tab .form-section"
      );
      if (!addressSection) return;

      mapLinkContainer = document.createElement("div");
      mapLinkContainer.id = "addressMapLink";
      mapLinkContainer.className = "address-map-link";
      mapLinkContainer.style.marginTop = "1rem";
      mapLinkContainer.style.textAlign = "right";

      addressSection.appendChild(mapLinkContainer);
    }

    const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(
      fullAddress
    )}`;
    mapLinkContainer.innerHTML = `
  <a href="${mapUrl}" target="_blank" class="btn btn-outline map-button">
    <i class="fas fa-map-marker-alt"></i><span class="map-text">View on Google Maps</span>
  </a>
`;
  }
}

function validateEmail(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errorElement = getErrorElement(input);
  const isRequired = input.id === "email"; // only main email is required

  if (isRequired && !input.value) {
    return showInputError(input, errorElement, "Email is required");
  } else if (input.value && !emailRegex.test(input.value)) {
    return showInputError(
      input,
      errorElement,
      "Please enter a valid email address"
    );
  } else {
    return clearInputError(input, errorElement);
  }
}

function validatePhone(input) {
  // allow formats like: 123-456-7890
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  const errorElement = getErrorElement(input);
  const isRequired = input.id === "phone"; // only main phone is required

  if (isRequired && !input.value) {
    return showInputError(input, errorElement, "Phone number is required");
  } else if (input.value && !phoneRegex.test(input.value)) {
    return showInputError(
      input,
      errorElement,
      "Please enter a valid 10-digit phone number in format: 000-000-0000"
    );
  } else {
    return clearInputError(input, errorElement);
  }
}

function validateName(input, fieldName, minLength = 1) {
  const errorElement = getErrorElement(input);

  if (!input.value) {
    return showInputError(input, errorElement, `${fieldName} is required`);
  } else if (input.value.length < minLength) {
    return showInputError(
      input,
      errorElement,
      `${fieldName} must be at least ${minLength} character${
        minLength !== 1 ? "s" : ""
      }`
    );
  } else if (input.value.length > 50) {
    return showInputError(
      input,
      errorElement,
      `${fieldName} must be less than 50 characters`
    );
  } else {
    return clearInputError(input, errorElement);
  }
}

function validateUrl(input) {
  const errorElement = getErrorElement(input);

  if (!input.value) {
    clearInputError(input, errorElement);
    return true;
  }

  // test URL with http:// prefix if not already there
  let testUrl = input.value;
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = "http://" + testUrl;
  }

  try {
    new URL(testUrl);
    return clearInputError(input, errorElement);
  } catch (e) {
    return showInputError(
      input,
      errorElement,
      "Please enter a valid website address"
    );
  }
}

function validateBudget(input) {
  const errorElement = getErrorElement(input);
  const value = parseFloat(input.value.replace(/[^\d.-]/g, ""));

  if (input.value && isNaN(value)) {
    return showInputError(input, errorElement, "Please enter a valid amount");
  } else if (value < 0) {
    return showInputError(input, errorElement, "Budget cannot be negative");
  } else {
    return clearInputError(input, errorElement);
  }
}

async function validateAndSaveLead(event) {
  event.preventDefault();

  // set the submission flag to prevent duplicates
  window.leadSubmissionInProgress = true;

  const isEmailValid = validateEmail(document.getElementById("email"));
  const isPhoneValid = validatePhone(document.getElementById("phone"));

  // modified name validation to allow single characters
  const isFirstNameValid = validateName(
    document.getElementById("firstName"),
    "First name",
    1 // minimum length changed to 1
  );
  const isLastNameValid = validateName(
    document.getElementById("lastName"),
    "Last name",
    1 // minimum length changed to 1
  );

  // validate optional fields that have values
  let isBusinessEmailValid = true;
  const businessEmailInput = document.getElementById("businessEmail");
  if (businessEmailInput && businessEmailInput.value) {
    isBusinessEmailValid = validateEmail(businessEmailInput);
  }

  let isBusinessPhoneValid = true;
  const businessPhoneInput = document.getElementById("businessPhone");
  if (businessPhoneInput && businessPhoneInput.value) {
    isBusinessPhoneValid = validatePhone(businessPhoneInput);
  }

  let isTextNumberValid = true;
  const textNumberInput = document.getElementById("textNumber");
  if (textNumberInput && textNumberInput.value) {
    isTextNumberValid = validatePhone(textNumberInput);
  }

  let isWebsiteValid = true;
  const hasWebsiteSelect = document.getElementById("hasWebsite");
  const websiteAddressInput = document.getElementById("websiteAddress");
  if (
    hasWebsiteSelect &&
    hasWebsiteSelect.value === "yes" &&
    websiteAddressInput &&
    websiteAddressInput.value
  ) {
    isWebsiteValid = validateUrl(websiteAddressInput);
  }

  let isBudgetValid = true;
  const budgetInput = document.getElementById("budget");
  if (budgetInput && budgetInput.value) {
    isBudgetValid = validateBudget(budgetInput);
  }

  let isTotalBudgetValid = true;
  const totalBudgetInput = document.getElementById("totalBudget");
  if (totalBudgetInput && totalBudgetInput.value) {
    isTotalBudgetValid = validateBudget(totalBudgetInput);
  }

  // if all validations pass, save the lead
  if (
    isEmailValid &&
    isPhoneValid &&
    isFirstNameValid &&
    isLastNameValid &&
    isBusinessEmailValid &&
    isBusinessPhoneValid &&
    isTextNumberValid &&
    isWebsiteValid &&
    isBudgetValid &&
    isTotalBudgetValid
  ) {
    try {
      await saveLead();
      return true;
    } catch (error) {
      console.error("Error in validateAndSaveLead:", error);
      window.leadSubmissionInProgress = false;
      throw error;
    }
  } else {
    window.leadSubmissionInProgress = false;
    return false;
  }
}

async function saveLead() {
  const leadId = document.getElementById("leadId").value;
  let isNewLead = !leadId;

  const leadData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    phoneExt: document.getElementById("phoneExt").value || undefined,
    textNumber: document.getElementById("textNumber").value || undefined,
    businessName:
      document.getElementById("businessName").value ||
      firstName.value + " " + lastName.value,
    businessPhone: document.getElementById("businessPhone").value || undefined,
    businessPhoneExt:
      document.getElementById("businessPhoneExt").value || undefined,
    businessEmail: document.getElementById("businessEmail").value || undefined,
    businessServices:
      document.getElementById("businessServices").value || undefined,
    preferredContact:
      document.getElementById("preferredContact").value || undefined,
    serviceDesired:
      document.getElementById("serviceDesired").value || undefined,
    hasWebsite: document.getElementById("hasWebsite").value || undefined,
    // important: allow message and notes to be empty strings
    message: document.getElementById("message").value,
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value,
    // explicitly set this to false to ensure dashboard creations don't trigger emails
    isFormSubmission: false,

    // add billing address fields
    billingAddress: {
      street: document.getElementById("billingStreet").value || "",
      aptUnit: document.getElementById("billingAptUnit").value || "",
      city: document.getElementById("billingCity").value || "",
      state: document.getElementById("billingState").value || "",
      zipCode: document.getElementById("billingZipCode").value || "",
      country: document.getElementById("billingCountry").value || "",
    },
  };

  // process website address - add http:// if needed
  if (document.getElementById("websiteAddress").value) {
    const websiteUrl = document.getElementById("websiteAddress").value.trim();

    if (!/^https?:\/\//i.test(websiteUrl)) {
      leadData.websiteAddress = "http://" + websiteUrl;
    } else {
      leadData.websiteAddress = websiteUrl;
    }
  } else {
    leadData.websiteAddress = undefined;
  }

  // add last contacted date if present
  const lastContactedInput = document.getElementById("lastContactedAt");
  if (lastContactedInput && lastContactedInput.value) {
    // create a date at noon to avoid timezone issues
    const dateValue = lastContactedInput.value; // "YYYY-MM-DD" format
    const [year, month, day] = dateValue
      .split("-")
      .map((num) => parseInt(num, 10));

    // create a date object with specific year, month, day at noon local time
    // month is 0 indexed in JavaScript dates, so subtract 1
    const date = new Date(year, month - 1, day, 12, 0, 0);

    leadData.lastContactedAt = date;
  }

  // handle estimated budget 
  const budgetInput = document.getElementById("budget");
  if (budgetInput && budgetInput.value) {
    const cleanBudgetValue = budgetInput.value.replace(/[^\d.-]/g, "");
    const numericBudgetValue = parseFloat(cleanBudgetValue);

    if (!isNaN(numericBudgetValue)) {
      leadData.budget = numericBudgetValue;
    }
  } else if (budgetInput) {
    leadData.budget = 0;
  }

  // handle billed amount/total budget 
  const totalBudgetInput = document.getElementById("totalBudget");
  if (totalBudgetInput && totalBudgetInput.value) {
    const cleanTotalValue = totalBudgetInput.value.replace(/[^\d.-]/g, "");
    const numericTotalValue = parseFloat(cleanTotalValue);

    if (!isNaN(numericTotalValue)) {
      leadData.totalBudget = numericTotalValue;
    }
  } else if (totalBudgetInput) {
    leadData.totalBudget = 0;
  }

  try {
    let updatedLead;

    if (leadId) {
      updatedLead = await updateLead(leadId, leadData);
    } else {
      updatedLead = await createLead(leadData);
    }

    // signal that a lead was saved, will be caught in dashboard.js
    window.dispatchEvent(
      new CustomEvent("leadSaved", {
        detail: { lead: updatedLead, isNew: isNewLead },
      })
    );

    showToast(leadId ? "Lead updated successfully" : "Lead added successfully");

    window.closeLeadModal();
  } catch (error) {
    console.error("Error saving lead:", error);
    showToast("Error: " + error.message);
  }
}

// true causes first tab to be active when modal opens
function initializeModalTabs(forceFirstTab = true) {
  const tabs = document.querySelectorAll(".modal-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      this.classList.add("active");
      document.getElementById(`${tabName}-tab`).classList.add("active");

      setTimeout(refreshTextareaHeights, 10);
    });
  });

  if (
    tabs.length > 0 &&
    (forceFirstTab || !document.querySelector(".modal-tab.active"))
  ) {
    tabs[0].click();
  } else {
    setTimeout(refreshTextareaHeights, 10);
  }
}

function activateTab(tabName) {
  const targetTab = document.querySelector(`.modal-tab[data-tab="${tabName}"]`);
  if (targetTab) {
    targetTab.click();
  }
}

function validateAllTabs() {
  const requiredFields = document.querySelectorAll("#leadForm [required]");
  let isValid = true;
  let firstInvalidTab = null;

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      isValid = false;

      // find which tab contains this field
      const tabContent = field.closest(".tab-content");
      if (tabContent && !firstInvalidTab) {
        const tabId = tabContent.id;
        const tabName = tabId.replace("-tab", "");
        firstInvalidTab = tabName;
      }

      field.classList.add("invalid");
    } else {
      field.classList.remove("invalid");
    }
  });

  // if validation fails, switch to the first tab with invalid fields
  if (!isValid && firstInvalidTab) {
    activateTab(firstInvalidTab);
  }

  return isValid;
}

async function deleteLeadAction(leadId) {
  try {
    window.closeLeadModal();

    await deleteLead(leadId);

    // signal that a lead was deleted, will be caught in dashboard.js
    window.dispatchEvent(
      new CustomEvent("leadDeleted", {
        detail: { leadId },
      })
    );

    // directly update the data watcher to force chart updates
    if (typeof window.updateDataWatcher === "function") {
      console.log("Explicitly updating data watcher after lead deletion");
      window.updateDataWatcher();
    }

    // also try direct update if watcher fails
    if (typeof window.updateAllCharts === "function") {
      console.log("Directly calling updateAllCharts for backup");
      window.updateAllCharts();
    }

    showToast("Project deleted successfully");
  } catch (error) {
    console.error("Error deleting lead:", error);
    showToast("Error: " + error.message);
  }
}

function openAddLeadModal() {
  const leadForm = document.getElementById("leadForm");
  leadForm.reset();

  document.getElementById("leadId").value = "";
  document.getElementById("modalTitle").textContent = "Add New";

  // reset date inputs
  const lastContactedInput = document.getElementById("lastContactedAt");
  const lastContactedDisplay = document.getElementById("lastContactedDisplay");
  if (lastContactedInput) {
    lastContactedInput.value = "";
  }
  if (lastContactedDisplay) {
    lastContactedDisplay.textContent = "";
  }

  // reset the created at display to today's date
  const createdAtDisplay = document.getElementById("createdAtDisplay");
  if (createdAtDisplay) {
    const today = new Date();
    const dateFormat = window.dateFormat || "MM/DD/YYYY";
    createdAtDisplay.textContent = formatDate(today, dateFormat);
  }

  // thoroughly clear forms list
  const leadFormsList = document.getElementById("leadFormsList");
  if (leadFormsList) {
    leadFormsList.innerHTML = "";
  }

  // thoroughly clear payments list
  const paymentsContainer = document.querySelector(".payments-container");
  if (paymentsContainer) {
    paymentsContainer.innerHTML = "";
  }

  // hide website address field initially
  const websiteAddressField =
    document.getElementById("websiteAddress").parentNode;
  websiteAddressField.style.display = "none";

  // make sure form elements are editable
  const formElements = document.querySelectorAll(
    "#leadForm input, #leadForm select, #leadForm textarea"
  );
  formElements.forEach((element) => {
    element.removeAttribute("readonly");
    if (element.tagName === "SELECT") {
      element.removeAttribute("disabled");
    }
  });

  // clear any error messages
  document.querySelectorAll(".error-message").forEach((el) => {
    el.style.display = "none";
  });

  // show submit button
  document.querySelector('#leadForm button[type="submit"]').style.display =
    "block";

  // ensure Add Payment button is visible
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  if (addPaymentBtn) {
    addPaymentBtn.style.display = "none";
  }

  // set Paid Amount and Remaining Balance to readonly with zero value
  const paidAmountField = document.getElementById("paidAmount");
  if (paidAmountField) {
    paidAmountField.value = formatCurrency(0);
    paidAmountField.setAttribute("readonly", true);
  }

  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField) {
    remainingBalanceField.value = formatCurrency(0);
    remainingBalanceField.setAttribute("readonly", true);
  }

  // display the modal first so elements are in the DOM
  document.getElementById("leadModal").style.display = "block";

  // then setup the auto-resize for textareas
  const textareas = document.querySelectorAll("#leadModal textarea");
  textareas.forEach((textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";

    textarea.removeEventListener("input", handleTextareaResize);
    textarea.addEventListener("input", handleTextareaResize);
  });

  initializeMonetaryInputs();

  initializeModalTabs(true);

  // hide create form since we are making a new lead
  const addFormBtn = document.getElementById("addFormBtn");
  if (addFormBtn) {
    addFormBtn.style.display = "none";
  }
  // hide upload pdf since we are making a new lead
  const docUploadArea = document.querySelector(".document-upload-area");
  if (docUploadArea) {
    docUploadArea.style.display = "none";
  }
}

function formatWebsiteUrl(url) {
  if (!url) return "";

  // check if URL already has a protocol prefix
  if (!/^https?:\/\//i.test(url)) {
    return "http://" + url;
  }

  return url;
}

async function openLeadModal(leadId, allLeads) {
  document.getElementById("leadForm").reset();

  const lead = allLeads.find((l) => l._id === leadId);
  if (!lead) {
    showToast("Lead not found");
    return;
  }

  // set modal to read-only mode initially
  setModalReadOnly(true);

  document.getElementById("leadId").value = lead._id;

  // fill the form with lead data
  document.getElementById("firstName").value = lead.firstName || "";
  document.getElementById("lastName").value = lead.lastName || "";
  document.getElementById("email").value = lead.email || "";
  document.getElementById("phone").value = lead.phone || "";
  document.getElementById("phoneExt").value = lead.phoneExt || "";
  document.getElementById("textNumber").value = lead.textNumber || "";
  document.getElementById("businessPhone").value = lead.businessPhone || "";
  document.getElementById("businessPhoneExt").value =
    lead.businessPhoneExt || "";
  document.getElementById("businessName").value = lead.businessName || "";
  document.getElementById("businessEmail").value = lead.businessEmail || "";
  document.getElementById("businessServices").value =
    lead.businessServices || "";
  const billingAddress = lead.billingAddress || {};
  document.getElementById("billingStreet").value = billingAddress.street || "";
  document.getElementById("billingAptUnit").value =
    billingAddress.aptUnit || "";
  document.getElementById("billingCity").value = billingAddress.city || "";
  document.getElementById("billingState").value = billingAddress.state || "";
  document.getElementById("billingZipCode").value =
    billingAddress.zipCode || "";
  document.getElementById("billingCountry").value =
    billingAddress.country || "";
  document.getElementById("preferredContact").value =
    lead.preferredContact || "";
  document.getElementById("serviceDesired").value = lead.serviceDesired || "";
  document.getElementById("hasWebsite").value = lead.hasWebsite || "";
  document.getElementById("websiteAddress").value = lead.websiteAddress || "";

  // add clickable website link
  if (lead.websiteAddress) {
    const websiteField = document.getElementById("websiteAddress");
    const parentDiv = websiteField.parentNode;

    // remove any existing link container
    const existingLink = parentDiv.querySelector(".website-link-container");
    if (existingLink) {
      parentDiv.removeChild(existingLink);
    }

    // create new link container
    const linkContainer = document.createElement("div");
    linkContainer.className = "website-link-container";

    const formattedUrl = formatWebsiteUrl(lead.websiteAddress);

    linkContainer.innerHTML = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="website-link">
        <i class="fas fa-external-link-alt"></i> Visit Website
      </a>`;

    parentDiv.appendChild(linkContainer);
  }

  // add the map button
  setTimeout(addAddressMapButton, 100);

  document.getElementById("message").value = lead.message || "";
  document.getElementById("status").value = lead.status || "new";
  document.getElementById("notes").value = lead.notes || "";

  // handle estimated budget field
  if (document.getElementById("budget")) {
    const budgetValue = lead.budget !== undefined ? parseFloat(lead.budget) : "";
    document.getElementById("budget").value = budgetValue !== "" 
      ? formatCurrency(budgetValue) 
      : "";
  }

  // handle payment fields
  if (document.getElementById("totalBudget")) {
    const totalBudgetValue = lead.totalBudget !== undefined ? parseFloat(lead.totalBudget) : "";
    document.getElementById("totalBudget").value = totalBudgetValue !== "" 
      ? formatCurrency(totalBudgetValue) 
      : "";
  }

  if (document.getElementById("paidAmount")) {
    const paidAmount = lead.paidAmount !== undefined ? parseFloat(lead.paidAmount) : 0;
    document.getElementById("paidAmount").value = formatCurrency(paidAmount);
  }

  // calculate remaining balance
  let remainingBalance = 0;
  if (lead.totalBudget !== undefined) {
    const totalBudget = parseFloat(lead.totalBudget) || 0;
    const paidAmount = parseFloat(lead.paidAmount) || 0;
    remainingBalance = totalBudget - paidAmount;
  }

  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField) {
    remainingBalanceField.value = formatCurrency(remainingBalance);
  }

  // set lead creation date
  const createdAtDisplay = document.getElementById("createdAtDisplay");
  if (createdAtDisplay && lead.createdAt) {
    const createdDate = new Date(lead.createdAt);
    const dateFormat = window.dateFormat || "MM/DD/YYYY";
    const formattedDate = formatDate(createdDate, dateFormat);
    createdAtDisplay.textContent = `${formattedDate}`;
  }

  try {
    // fetch and display payments for this lead
    const leadPayments = await fetchLeadPayments(lead._id);
    renderLeadPayments(leadPayments, lead._id);

    // load forms for this lead
    loadLeadForms(lead._id);

    // load documents for this lead
    loadLeadDocuments(lead._id);
    initDocumentUpload(lead._id);
  } catch (error) {
    console.error("Error fetching data:", error);
    const paymentsContainer = document.querySelector(".payments-container");
    if (paymentsContainer) {
      paymentsContainer.innerHTML =
        '<p class="payment-item">Error loading payments</p>';
    }
  }

  // handle date formatting for last contacted date
  updateLeadModalDates(lead);

  // show/hide website address field based on hasWebsite value
  const websiteAddressField =
    document.getElementById("websiteAddress").parentNode;
  websiteAddressField.style.display =
    lead.hasWebsite === "yes" ? "block" : "none";

  document.getElementById("modalTitle").textContent = "Client Info";

  // first, check if the action buttons container exists and remove it
  const existingActions = document.getElementById("modalActions");
  if (existingActions) {
    existingActions.remove();
  }

  // format the phone numbers in the modal
  const phoneFields = document.querySelectorAll('#leadModal input[type="tel"]');
  phoneFields.forEach((field) => {
    if (field.value) {
      formatPhoneInput(field);
    }
  });

  // display the modal first so elements are in the DOM
  document.getElementById("leadModal").style.display = "block";

  initializeModalTabs();

  // then setup the auto-resize for textareas
  const textareas = document.querySelectorAll("#leadModal textarea");
  textareas.forEach((textarea) => {
    // set initial height based on content after a brief delay to ensure content is rendered
    setTimeout(() => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";

      textarea.removeEventListener("input", handleTextareaResize);
      textarea.addEventListener("input", handleTextareaResize);
    }, 0);
  });

  // then add modal action buttons (Edit, Delete)
  window.updateModalActionButtons(lead._id);

  initializeMonetaryInputs();
}

function updateLeadModalDates(lead) {
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  // handle last contacted date
  if (document.getElementById("lastContactedAt") && lead.lastContactedAt) {
    const date = new Date(lead.lastContactedAt);

    // format date as YYYY-MM-DD for input[type="date"]
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    document.getElementById(
      "lastContactedAt"
    ).value = `${year}-${month}-${day}`;

    // update the display element with the formatted date
    const displayElement = document.getElementById("lastContactedDisplay");
    if (displayElement) {
      displayElement.textContent = formatDate(date, dateFormat);
    }
  } else if (document.getElementById("lastContactedAt")) {
    document.getElementById("lastContactedAt").value = "";

    const displayElement = document.getElementById("lastContactedDisplay");
    if (displayElement) {
      displayElement.textContent = "";
    }
  }

  // set up event listener for date input changes
  const lastContactedInput = document.getElementById("lastContactedAt");
  if (lastContactedInput) {
    lastContactedInput.addEventListener("change", function () {
      if (this.value) {
        // create a date at noon to avoid timezone issues
        const dateValue = this.value; // "YYYY-MM-DD" format
        const [year, month, day] = dateValue
          .split("-")
          .map((num) => parseInt(num, 10));

        // create a date object with specific year, month, day at noon local time
        // month  0 indexed in JavaScript dates, so subtract 1
        const date = new Date(year, month - 1, day, 12, 0, 0);

        const displayElement = document.getElementById("lastContactedDisplay");
        if (displayElement) {
          displayElement.textContent = formatDate(date, dateFormat);
        }
      } else {
        const displayElement = document.getElementById("lastContactedDisplay");
        if (displayElement) {
          displayElement.textContent = "";
        }
      }
    });
  }
}

function refreshTextareaHeights() {
  const textareas = document.querySelectorAll("#leadModal textarea");

  textareas.forEach((textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });
}

export {
  setupFormValidation,
  validateEmail,
  validatePhone,
  validateName,
  validateUrl,
  validateBudget,
  validateAndSaveLead,
  saveLead,
  deleteLeadAction,
  openAddLeadModal,
  openLeadModal,
  updateLeadModalDates,
  initializeModalTabs,
  activateTab,
  validateAllTabs,
  formatWebsiteUrl,
  addAddressMapButton,
};