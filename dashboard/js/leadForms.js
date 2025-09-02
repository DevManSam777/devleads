import * as API from "./api.js";
import * as Utils from "./utils.js";

document.addEventListener("DOMContentLoaded", function () {
  // configure marked.js whitespace
  if (typeof marked !== "undefined") {
    marked.setOptions({
      gfm: true,
      breaks: true,
      smartLists: true,
      xhtml: true,
    });
  }
});

async function loadLeadForms(leadId) {
  try {
    const formsContainer = document.getElementById("leadFormsList");

    if (!formsContainer) return;

    formsContainer.innerHTML =
      '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading forms...</div>';

    const response = await fetch(
      `${API.getBaseUrl()}/api/forms/lead/${leadId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch lead forms");
    }

    const forms = await response.json();

    if (forms.length === 0) {
      formsContainer.innerHTML =
        '<p class="no-forms-message">No forms yet. Click "Create Form" to add one.</p>';
      return;
    }

    formsContainer.innerHTML = "";

    const dateFormat = window.dateFormat || "MM/DD/YYYY";

    forms.forEach((form) => {
      let formattedModifiedDate = "Not recorded";
      if (form.lastModified) {
        const modifiedDate = new Date(form.lastModified);
        formattedModifiedDate = Utils.formatDateTime(modifiedDate, dateFormat);
      }

      let formattedCreationDate = "Not recorded";
      if (form.createdAt) {
        const creationDate = new Date(form.createdAt);
        formattedCreationDate = Utils.formatDateTime(creationDate, dateFormat);
      }

      const formItem = document.createElement("div");
      formItem.className = "form-item";
      formItem.dataset.formId = form._id;

      const category =
        form.category.charAt(0).toUpperCase() + form.category.slice(1);

      formItem.innerHTML = `
        <div class="form-details">
          <div class="form-title">${form.title}</div>
          <div class="form-category">${category}</div>
          <div class="form-dates">
            <div><i class="far fa-calendar-plus"></i> Created: ${formattedCreationDate}</div>
            <div><i class="far fa-clock"></i> Modified: ${formattedModifiedDate}</div>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-icon view-form" title="View Form">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="btn-icon edit-form" title="Edit Form">
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" class="btn-icon delete-form" title="Delete Form">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      formItem
        .querySelector(".view-form")
        .addEventListener("click", function (e) {
          e.stopPropagation();
          viewForm(form._id, true); // force edit mode to true
        });

      formItem
        .querySelector(".edit-form")
        .addEventListener("click", function (e) {
          e.stopPropagation();
          openEditContentModal(form);
        });

      formItem
        .querySelector(".delete-form")
        .addEventListener("click", function (e) {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${form.title}"?`)) {
            deleteForm(form._id, leadId);
          }
        });

      formsContainer.appendChild(formItem);
    });

    const addFormBtn = document.getElementById("addFormBtn");
    if (addFormBtn) {
      addFormBtn.style.display = "block";
    }
  } catch (error) {
    console.error("Error loading lead forms:", error);
    const formsContainer = document.getElementById("leadFormsList");
    if (formsContainer) {
      formsContainer.innerHTML =
        '<p class="no-forms-message">Error loading forms</p>';
    }
  }
}

function openFormTemplateModal(leadId) {
  // remove any existing modal first to prevent duplicates
  const existingModal = document.getElementById("formTemplateModal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "formTemplateModal";
  modal.className = "modal";
  modal.setAttribute("data-lead-id", leadId);

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal" id="closeFormTemplateModal">&times;</span>
      <div class="modal-header">
        <h3>Select Form Template</h3>
      </div>
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input type="text" id="templateSearchInput" placeholder="Search templates...">
      </div>
      <div id="templatesList" class="template-list">
        <div class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i> Loading templates...
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.style.display = "block";

  const closeButton = document.getElementById("closeFormTemplateModal");
  closeButton.addEventListener("click", function () {
    modal.style.display = "none";
    document.body.removeChild(modal);
  });

  loadFormTemplates(leadId);

  const searchInput = document.getElementById("templateSearchInput");
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const templateItems = document.querySelectorAll(
      "#templatesList .template-card"
    );

    let visibleItemCount = 0;
    templateItems.forEach((item) => {
      const title = item.querySelector("h4")?.textContent.toLowerCase() || "";
      const desc = item.querySelector("p")?.textContent.toLowerCase() || "";

      if (title.includes(searchTerm) || desc.includes(searchTerm)) {
        item.style.display = "flex";
        visibleItemCount++;
      } else {
        item.style.display = "none";
      }
    });

    // show "no results" message if no templates match search
    const noResultsElement = document.getElementById("noTemplatesFound");
    if (visibleItemCount === 0) {
      if (!noResultsElement) {
        const noResultsDiv = document.createElement("div");
        noResultsDiv.id = "noTemplatesFound";
        noResultsDiv.className = "no-results";
        noResultsDiv.textContent = "No templates found matching your search.";
        document.getElementById("templatesList").appendChild(noResultsDiv);
      }
    } else if (noResultsElement) {
      noResultsElement.remove();
    }
  });

  modal.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      modal.style.display = "none";
      document.body.removeChild(modal);
    }
  });

  return modal;
}

// ensure the function is globally available
window.openFormTemplateModal = openFormTemplateModal;

async function loadFormTemplates(leadId) {
  try {
    const templatesContainer = document.getElementById("templatesList");

    // fetch templates (forms where isTemplate = true)
    const response = await fetch(
      `${API.getBaseUrl()}/api/forms?isTemplate=true`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }

    const templates = await response.json();

    if (templates.length === 0) {
      templatesContainer.innerHTML =
        '<p class="no-templates-message">No templates available. Please create templates in the Forms section first.</p>';
      return;
    }

    templatesContainer.innerHTML = "";

    // group templates by category
    const groupedTemplates = {};
    templates.forEach((template) => {
      if (!groupedTemplates[template.category]) {
        groupedTemplates[template.category] = [];
      }
      groupedTemplates[template.category].push(template);
    });

    Object.entries(groupedTemplates).forEach(
      ([category, categoryTemplates]) => {
        const categoryHeader = document.createElement("h4");
        categoryHeader.className = "template-category-header";
        categoryHeader.textContent =
          category.charAt(0).toUpperCase() + category.slice(1) + "s";
        templatesContainer.appendChild(categoryHeader);

        const cardsContainer = document.createElement("div");
        cardsContainer.className = "template-cards";

        categoryTemplates.forEach((template) => {
          const card = document.createElement("div");
          card.className = "template-card";
          card.dataset.templateId = template._id;

          // get icon based on category
          let icon = "fa-file-alt";
          if (template.category === "contract") icon = "fa-file-contract";
          if (template.category === "proposal") icon = "fa-file-invoice";
          if (template.category === "invoice") icon = "fa-file-invoice-dollar";
          if (template.category === "agreement") icon = "fa-handshake";

          card.innerHTML = `
          <div class="template-icon">
            <i class="fas ${icon}"></i>
          </div>
          <div class="template-details">
            <h4>${template.title}</h4>
            <p>${template.description || "No description"}</p>
          </div>
          <div class="template-actions">
            <button class="btn btn-primary use-template">Use Template</button>
          </div>
        `;

          card
            .querySelector(".use-template")
            .addEventListener("click", function () {
              generateFormFromTemplate(template._id, leadId);
            });

          cardsContainer.appendChild(card);
        });

        templatesContainer.appendChild(cardsContainer);
      }
    );
  } catch (error) {
    console.error("Error loading templates:", error);
    const templatesContainer = document.getElementById("templatesList");
    templatesContainer.innerHTML =
      '<p class="no-templates-message">Error loading templates</p>';
  }
}


async function generateFormFromTemplate(templateId, leadId) {
  try {
    Utils.showToast("Generating form...");

    // multi-method timezone detection for ios compatibility
    let timezone;
    
    //  try intl.datetimeformat (works in most browsers)
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log("Timezone detected via Intl.DateTimeFormat:", timezone);
    } catch (error) {
      console.warn("Failed to detect timezone via Intl.DateTimeFormat:", error);
    }
    
    // calculate timezone offset for ios fallback
    if (!timezone) {
      try {
        const offsetMinutes = new Date().getTimezoneOffset();
        
        // convert to hours (negative because getTimezoneOffset returns opposite)
        const offsetHours = -offsetMinutes / 60;
        
        const formattedOffset = `${offsetHours >= 0 ? '+' : '-'}${Math.abs(Math.floor(offsetHours)).toString().padStart(2, '0')}:${(Math.abs(offsetHours % 1) * 60).toString().padStart(2, '0')}`;

        // map common offsets to timezone names
        const offsetToTimezone = {
          '-08:00': 'America/Los_Angeles',
          '-07:00': 'America/Los_Angeles',
          '-05:00': 'America/New_York',
          '-04:00': 'America/New_York',
          '+00:00': 'Europe/London',
          '+01:00': 'Europe/Paris',
          '+02:00': 'Europe/Helsinki',
          '+05:30': 'Asia/Kolkata',
          '+08:00': 'Asia/Singapore',
          '+09:00': 'Asia/Tokyo',
          '+10:00': 'Australia/Sydney',
        };
        
        timezone = offsetToTimezone[formattedOffset] || `Etc/GMT${formattedOffset.replace(':', '')}`;
        console.log("Timezone detected via offset calculation:", timezone, "offset:", formattedOffset);
      } catch (error) {
        console.warn("Failed to detect timezone via offset calculation:", error);
      }
    }
    
    // extract timezone from date string for ios fallback
    if (!timezone) {
      try {
        const dateString = new Date().toString();
        const tzAbbr = dateString.match(/\(([^)]+)\)$/)?.[1];
        
        // map common timezone abbreviations to iana names
        const tzAbbrMap = {
          'PST': 'America/Los_Angeles',
          'PDT': 'America/Los_Angeles',
          'EST': 'America/New_York',
          'EDT': 'America/New_York',
          'CST': 'America/Chicago',
          'CDT': 'America/Chicago',
          'MST': 'America/Denver',
          'MDT': 'America/Denver',
          'GMT': 'Europe/London',
          'BST': 'Europe/London',
          'CET': 'Europe/Paris',
          'CEST': 'Europe/Paris',
          'JST': 'Asia/Tokyo',
          'IST': 'Asia/Kolkata',
        };
        
        timezone = tzAbbrMap[tzAbbr] || 'America/Los_Angeles'; // default to los angeles if unknown
        console.log("Timezone detected via date string:", timezone, "abbr:", tzAbbr);
      } catch (error) {
        console.warn("Failed to detect timezone via date string:", error);
      }
    }
    
    // final fallback use default timezone
    if (!timezone) {
      timezone = 'America/Los_Angeles';
      console.warn("All timezone detection methods failed, using default:", timezone);
    }
    
    // enhanced logging to verify browser-detected timezone
    console.log("Client timezone detection complete:", {
      detectedTimezone: timezone,
      dateInfo: {
        localeDateString: new Date().toLocaleDateString(),
        localeTimeString: new Date().toLocaleTimeString(),
        isoString: new Date().toISOString(),
        utcString: new Date().toUTCString(),
        dateString: new Date().toString()
      },
      browserInfo: navigator.userAgent
    });

    console.log(`Sending timezone to server: ${timezone}`);

    const response = await fetch(
      `${API.getBaseUrl()}/api/forms/${templateId}/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          leadId,
          timezone // send the timezone with the request
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Form generation failed:", errorData);
      throw new Error(errorData.message || "Failed to generate form");
    }

    const result = await response.json();
    
    // enhanced logging of server response to verify timezone usage
    console.log("Form generated successfully with timezone info:", {
      serverUsedTimezone: result.debug?.usedTimezone || result.usedTimezone,
      formattedDateExample: result.debug?.formattedDateExample,
      timezoneSource: result.debug?.timezoneSource || "unknown",
      generatedFormId: result._id
    });

    const modal = document.getElementById("formTemplateModal");
    if (modal) {
      modal.style.display = "none";
      document.body.removeChild(modal);
    }

    // show success message with timezone info for verification
    Utils.showToast(`Form created successfully using timezone: ${timezone}`);

    loadLeadForms(leadId);
  } catch (error) {
    console.error("Error generating form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

async function viewForm(formId, isEditMode) {
  try {
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch form");
    }

    const form = await response.json();

    const modal = document.createElement("div");
    modal.id = "formPreviewModal";
    modal.className = "modal";

    // always consider edit mode true when viewing from lead modal
    isEditMode = true;

    const dateFormat = window.dateFormat || "MM/DD/YYYY";

    let formattedCreationDate = "Not recorded";
    if (form.createdAt) {
      const creationDate = new Date(form.createdAt);
      formattedCreationDate = Utils.formatDateTime(creationDate, dateFormat);
    }

    let formattedModifiedDate = "Not recorded";
    if (form.lastModified) {
      const modifiedDate = new Date(form.lastModified);
      formattedModifiedDate = Utils.formatDateTime(modifiedDate, dateFormat);
    }

    // use marked with specific options to preserve whitespace
    marked.setOptions({
      breaks: true, // convert \n to <br>
      gfm: true, // github flavored markdown
      smartLists: true, // use smarter list behavior
      xhtml: true, // self-close html tags
    });

    const formattedContent = DOMPurify.sanitize(marked.parse(form.content));

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal" id="closeFormPreviewModal">&times;</span>
        <div class="modal-header">
          <h3>${form.title}</h3>
        </div>
        <div class="preview-container">
          <div class="form-metadata">
            <div><strong>Form Id: ${formId}</strong></div>
            <div><strong>Created:</strong> ${formattedCreationDate}</div>
            <div><strong>Last Modified:</strong> ${formattedModifiedDate}</div>
            <small>(Form Metadata will not be visible outside of this preview)</small>
             <hr>
          </div>
          <div class="markdown-content">${formattedContent}</div>
        </div>
        <div id="lead-modal-form-actions" class="modal-actions">
          <button type="button" id="editContentBtn" class="btn btn-primary">
            <i class="fas fa-edit"></i> Edit Content
          </button>
          <button type="button" id="printPreviewBtn" class="btn btn-primary">
            <i class="fas fa-print"></i> Print PDF
          </button>
          <button type="button" id="downloadPreviewBtn" class="btn btn-primary">
            <i class="fas fa-download"></i> Download .md
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.style.display = "block";

    document
      .getElementById("closeFormPreviewModal")
      .addEventListener("click", function () {
        modal.style.display = "none";
        document.body.removeChild(modal);
      });

    document
      .getElementById("downloadPreviewBtn")
      .addEventListener("click", function () {
        downloadForm(formId);
      });

    document
      .getElementById("printPreviewBtn")
      .addEventListener("click", function () {
        printForm(formId);
      });

    document
      .getElementById("editContentBtn")
      .addEventListener("click", function () {
        modal.style.display = "none";
        document.body.removeChild(modal);

        openEditContentModal(form);
      });
  } catch (error) {
    console.error("Error viewing form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

function openEditContentModal(form) {
  const modal = document.createElement("div");
  modal.id = "formEditContentModal";
  modal.className = "modal";
  modal.innerHTML = `
  <div class="modal-content">
    <span class="close-modal" id="closeEditContentModal">&times;</span>
    <div class="modal-header">
      <h3>Edit Form: ${form.title}</h3>
      <div class="editor-tabs">
        <div class="editor-tab active" data-tab="editor">Editor</div>
        <div class="editor-tab" data-tab="preview">Preview</div>
      </div>
    </div>
    <div class="form-editor-container">
      <div class="editor-section">
        <label for="formContent" class="required content-label">Content</label>
        <textarea id="editFormContent">${form.content}</textarea>
        <div class="variables-container" style="display: ${
          form.isTemplate ? "block" : "none"
        };">
          <h4>Available Variables</h4>
          <p class="variable-hint">
            Click a variable to insert it at the cursor position. Use format <code>{{variableName}}</code> in your content.
          </p>
          <div class="variables-list" id="variablesList">
            <span class="variable-tag" data-variable="firstName">First Name</span>
            <span class="variable-tag" data-variable="lastName">Last Name</span>
            <span class="variable-tag" data-variable="fullName">Full Name</span>
            <span class="variable-tag" data-variable="email">Personal Email</span>
            <span class="variable-tag" data-variable="phone">Personal Phone</span>
            <span class="variable-tag" data-variable="businessName">Business Name</span>
            <span class="variable-tag" data-variable="businessEmail">Business Email</span>
            <span class="variable-tag" data-variable="businessPhone">Business Phone</span>
            <span class="variable-tag" data-variable="billingAddress" >Billing Address</span>
            <span class="variable-tag" data-variable="preferredContact">Contact Preference</span>
            <span class="variable-tag" data-variable="serviceDesired">Service Desired</span>
            <span class="variable-tag" data-variable="estimatedBudget">Estimated Budget</span>
            <span class="variable-tag" data-variable="totalBudget">Total Billed</span>
            <span class="variable-tag" data-variable="paidAmount">Paid Amount</span>
            <span class="variable-tag" data-variable="remainingBalance">Remaining Balance</span>
            <span class="variable-tag" data-variable="currentDate">Current Date</span>
            <span class="variable-tag" data-variable="createdAt">Project Origin Date</span>
          </div>
        </div>
      </div>
      <div class="preview-section">
        <h4>Preview</h4>
        <div class="markdown-content" id="markdownPreview"></div>
      </div>
    </div>
    <div class="modal-actions">
      <button type="button" id="saveContentBtn" class="btn btn-primary">
        <i class="fas fa-save"></i> Save Changes
      </button>
      <button type="button" id="cancelEditBtn" class="btn btn-outline">
        Cancel
      </button>
    </div>
  </div>
`;

  document.body.appendChild(modal);

  modal.style.display = "block";

  let editor;

  try {
    const textarea = document.getElementById("editFormContent");
    editor = CodeMirror.fromTextArea(textarea, {
      mode: "markdown",
      lineNumbers: true,
      lineWrapping: true,
      theme: "default",
      placeholder: "Write your form content here in Markdown format...",
    });

    editor.setValue(form.content);

    editor.on("change", function () {
      updateMarkdownPreview(editor);
    });

    updateMarkdownPreview(editor);

    document.querySelectorAll(".variable-tag").forEach((tag) => {
      tag.addEventListener("click", function () {
        const variable = this.getAttribute("data-variable");
        const cursor = editor.getCursor();
        editor.replaceRange(`{{${variable}}}`, cursor);
        editor.focus();
      });
    });

    document.querySelectorAll(".editor-tab").forEach((tab) => {
      tab.addEventListener("click", function () {
        document
          .querySelectorAll(".editor-tab")
          .forEach((t) => t.classList.remove("active"));
        this.classList.add("active");

        const tabName = this.getAttribute("data-tab");
        const editorSection = document.querySelector(".editor-section");
        const previewSection = document.querySelector(".preview-section");

        if (tabName === "editor") {
          editorSection.classList.remove("inactive");
          previewSection.classList.remove("active");
        } else {
          editorSection.classList.add("inactive");
          previewSection.classList.add("active");
          updateMarkdownPreview(editor);
        }

        // ensure codemirror refreshes when switching tabs
        if (editor) {
          setTimeout(() => {
            editor.refresh();
          }, 50);
        }
      });
    });
  } catch (error) {
    console.error("Error initializing CodeMirror:", error);

    // fallback to regular textarea if codemirror fails
    const textarea = document.getElementById("editFormContent");
    textarea.style.width = "100%";
    textarea.style.minHeight = "300px";
    textarea.style.fontFamily = "monospace";

    textarea.addEventListener("input", function () {
      const preview = document.getElementById("markdownPreview");
      if (marked && DOMPurify) {
        preview.innerHTML = DOMPurify.sanitize(marked.parse(textarea.value));
      } else {
        preview.innerHTML = `<pre>${textarea.value}</pre>`;
      }
    });

    const preview = document.getElementById("markdownPreview");
    if (marked && DOMPurify) {
      preview.innerHTML = DOMPurify.sanitize(marked.parse(textarea.value));
    } else {
      preview.innerHTML = `<pre>${textarea.value}</pre>`;
    }

    // add variables click handlers for textarea fallback
    document.querySelectorAll(".variable-tag").forEach((tag) => {
      tag.addEventListener("click", function () {
        const variable = this.getAttribute("data-variable");
        const cursorPos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursorPos);
        const textAfter = textarea.value.substring(cursorPos);
        textarea.value = textBefore + `{{${variable}}}` + textAfter;

        if (marked && DOMPurify) {
          preview.innerHTML = DOMPurify.sanitize(marked.parse(textarea.value));
        } else {
          preview.innerHTML = `<pre>${textarea.value}</pre>`;
        }

        textarea.focus();
      });
    });
  }

  document
    .getElementById("closeEditContentModal")
    .addEventListener("click", function () {
      if (confirm("Are you sure you want to close without saving changes?")) {
        modal.style.display = "none";
        document.body.removeChild(modal);
      }
    });

  document
    .getElementById("saveContentBtn")
    .addEventListener("click", function () {
      // get content from codemirror or textarea fallback
      let content;
      if (editor) {
        content = editor.getValue();
      } else {
        content = document.getElementById("editFormContent").value;
      }

      saveFormContent(form._id, content);
      modal.style.display = "none";
      document.body.removeChild(modal);
    });

  document
    .getElementById("cancelEditBtn")
    .addEventListener("click", function () {
      if (confirm("Are you sure you want to cancel without saving changes?")) {
        modal.style.display = "none";
        document.body.removeChild(modal);
      }
    });
}

function updateMarkdownPreview(editor) {
  const content = editor.getValue();
  const preview = document.getElementById("markdownPreview");

  if (!content) {
    preview.innerHTML = "<p><em>No content to preview</em></p>";
    return;
  }

  if (typeof marked !== "undefined" && typeof DOMPurify !== "undefined") {
    const html = DOMPurify.sanitize(marked.parse(content));
    preview.innerHTML = html;
  } else {
    preview.innerHTML = `<pre>${content}</pre>`;
  }
}

async function saveFormContent(formId, content) {
  try {
    Utils.showToast("Saving form...");

    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("Failed to save form");
    }

    Utils.showToast("Form saved successfully");

    const leadId = document.getElementById("leadId").value;

    if (leadId) {
      loadLeadForms(leadId);
    }
  } catch (error) {
    console.error("Error saving form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

async function deleteForm(formId, leadId) {
  try {
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete form");
    }

    // also remove the association from the lead
    const leadResponse = await fetch(
      `${API.getBaseUrl()}/api/leads/${leadId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          $pull: { associatedForms: formId },
        }),
      }
    );

    if (!leadResponse.ok) {
      console.warn("Form deleted but could not update lead association");
    }

    Utils.showToast("Form deleted successfully");

    loadLeadForms(leadId);
  } catch (error) {
    console.error("Error deleting form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

async function downloadForm(formId) {
  try {
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch form");
    }

    const form = await response.json();

    const blob = new Blob([form.content], { type: "text/markdown" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${form.title.replace(/\s+/g, "_")}.md`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

async function printForm(formId) {
  try {
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch form");
    }

    const form = await response.json();

    const printWindow = window.open("", "_blank");

    // convert markdown to html if marked is available
    const formattedContent = marked.parse
      ? DOMPurify.sanitize(marked.parse(form.content))
      : `<pre style="white-space: pre-wrap;">${form.content}</pre>`;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${form.title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
              }
              
              h1, h2, h3, h4, h5, h6 {
                margin-top: 1.5rem;
                margin-bottom: 1rem;
              }
              
              blockquote {
                border-left: 4px solid #ddd;
                padding-left: 1rem;
                margin-left: 0;
                color: #666;
              }
              
              pre {
                background-color: #f5f5f5;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
              }
              
              code {
                background-color: #f5f5f5;
                padding: 0.2rem 0.4rem;
                border-radius: 0.3rem;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
              }
              
              th, td {
                border: 1px solid #ddd;
                padding: 0.5rem;
              }
              
              th {
                background-color: #f5f5f5;
              }
              
              hr {
                border: 0;
                border-top: 1px solid #ddd;
                margin: 2rem 0;
              }
              
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${formattedContent}
          </body>
        </html>
      `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    Utils.showToast(
      "Pop-up blocked. Please allow pop-ups for this site to view the form."
    );
    console.warn("Pop-up blocked by the browser.");
  }
}

export {
  loadLeadForms,
  openFormTemplateModal,
  viewForm,
  downloadForm,
  printForm,
  saveFormContent,
  openEditContentModal,
  deleteForm,
};