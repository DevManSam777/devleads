import * as API from "./api.js";
import * as Utils from "./utils.js";
import * as Pagination from "./pagination.js";

// global variables
let allForms = [];
let editor;
let currentFormId = null;
let globalSettings = {};

// pagination state
let currentPage = 1;
let pageSize = 6;
let categoryPagination = {}; 

document.addEventListener("DOMContentLoaded", async function () {
  await initializeSettings();
  setupSidebarToggle();
  initializeMarkdownEditor();
  setupEventListeners();
  fetchAndRenderForms();

  // configure marked.js globally to preserve whitespace
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // convert \n to <br>
    smartLists: true, // use smarter list behavior
    xhtml: true, // self close HTML tags
    headerIds: false, // don't add IDs to headers
  });
});

// initialize settings from the server
async function initializeSettings() {
  try {
    const settings = await API.fetchAllSettings();
    globalSettings = settings;

    // set date format in window object for global access
    window.dateFormat = settings.dateFormat || "MM/DD/YYYY";

    // apply theme from settings
    if (settings.theme) {
      document.documentElement.setAttribute("data-theme", settings.theme);
    } else {
      // use system preference as fallback
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.setAttribute("data-theme", systemTheme);
      // save it back to the server
      await API.updateSetting("theme", systemTheme);
    }

    console.log("Initialized settings:", {
      theme: settings.theme,
      dateFormat: window.dateFormat,
    });

    return settings;
  } catch (error) {
    console.error("Error initializing settings:", error);

    // use fallbacks from localStorage if API fails
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    document.documentElement.setAttribute("data-theme", savedTheme);

    window.dateFormat = localStorage.getItem("dateFormat") || "MM/DD/YYYY";

    return {
      theme: savedTheme,
      dateFormat: window.dateFormat,
    };
  }
}

// set up sidebar toggle functionality
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

  const toggleButton = document.createElement("button");
  toggleButton.className = "sidebar-toggle";
  toggleButton.setAttribute("aria-label", "Toggle Sidebar");
  toggleButton.innerHTML =
    '<i class="fas fa-angles-left"></i><i class="fas fa-angles-right"></i>';
  sidebar.appendChild(toggleButton);

  toggleButton.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
    localStorage.setItem(
      "sidebarCollapsed",
      sidebar.classList.contains("collapsed")
    );
  });
}

// set up all event listeners
function setupEventListeners() {
  // filter and search listeners
  document
    .getElementById("filterCategory")
    .addEventListener("change", applyFilters);
  document
    .getElementById("filterTemplate")
    .addEventListener("change", applyFilters);
  document
    .getElementById("searchInput")
    .addEventListener("input", applyFilters);

  document
    .getElementById("addFormBtnFormsPage")
    .addEventListener("click", openCreateFormModal);

  document
    .getElementById("closeFormEditorModal")
    .addEventListener("click", closeFormEditorModal);

  document
    .getElementById("closeFormPreviewModal")
    .addEventListener("click", closeFormPreviewModal);

  document
    .getElementById("closeLeadSelectionModal")
    .addEventListener("click", closeLeadSelectionModal);

  document
    .getElementById("closeGeneratedFormModal")
    .addEventListener("click", closeGeneratedFormModal);

  document
    .getElementById("cancelFormBtn")
    .addEventListener("click", closeFormEditorModal);

  document
    .getElementById("formEditorForm")
    .addEventListener("submit", handleFormSubmit);

  // mobile tabs for editor/preview
  document.querySelectorAll(".editor-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      document
        .querySelectorAll(".editor-tab")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const tabName = this.getAttribute("data-tab");

      if (tabName === "editor") {
        document.querySelector(".editor-section").classList.remove("inactive");
        document.querySelector(".preview-section").classList.remove("active");
      } else {
        document.querySelector(".editor-section").classList.add("inactive");
        document.querySelector(".preview-section").classList.add("active");
        updateMarkdownPreview();
      }
    });
  });

  // variable click handlers
  document.querySelectorAll(".variable-tag").forEach((tag) => {
    tag.addEventListener("click", function () {
      const variable = this.getAttribute("data-variable");
      insertVariable(variable);
    });
  });

  document.getElementById("editFormBtn").addEventListener("click", function () {
    closeFormPreviewModal();
    openEditFormModal(currentFormId);
  });

  document
    .getElementById("useWithLeadBtn")
    .addEventListener("click", function () {
      openLeadSelectionModal();
    });

  document
    .getElementById("downloadFormBtn")
    .addEventListener("click", function () {
      downloadForm();
    });

  document
    .getElementById("printFormBtn")
    .addEventListener("click", function () {
      printForm();
    });

  document
    .getElementById("downloadGeneratedBtn")
    .addEventListener("click", function () {
      downloadGeneratedForm();
    });

  document
    .getElementById("printGeneratedBtn")
    .addEventListener("click", function () {
      printGeneratedForm();
    });

  // search leads in the lead selection modal
  document
    .getElementById("leadSearchInput")
    .addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const leadItems = document.querySelectorAll("#leadsList .lead-item");

      leadItems.forEach((item) => {
        const leadName = item.querySelector("h4").textContent.toLowerCase();
        const leadBusiness = item.querySelector("p").textContent.toLowerCase();

        if (
          leadName.includes(searchTerm) ||
          leadBusiness.includes(searchTerm)
        ) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });

  // listen for settings updates from other pages
  window.addEventListener("settingsUpdated", function (event) {
    const { key, value } = event.detail;

    if (key === "dateFormat") {
      console.log("Date format updated to:", value);
      window.dateFormat = value;

      fetchAndRenderForms();
    } else if (key === "theme") {
      document.documentElement.setAttribute("data-theme", value);
    }
  });
}

// initialize the markdown editor
function initializeMarkdownEditor() {
  const contentTextarea = document.getElementById("formContent");

  // make sure the textarea is visible while CodeMirror initializes
  contentTextarea.style.display = "block";

  editor = CodeMirror.fromTextArea(contentTextarea, {
    mode: "markdown",
    lineNumbers: true,
    lineWrapping: true,
    theme: "default",
    placeholder: "Write your form content here in Markdown format...",
  });

  // sync content back to textarea when needed
  editor.on("change", function () {
    editor.save();
    updateMarkdownPreview();
  });

  updateMarkdownPreview();
}

function updateMarkdownPreview() {
  const content = editor.getValue();
  const preview = document.getElementById("markdownPreview");

  if (!content) {
    preview.innerHTML = "<p><em>No content to preview</em></p>";
    return;
  }

  const html = DOMPurify.sanitize(marked.parse(content));
  preview.innerHTML = html;
}

// insert a variable at the current cursor position
function insertVariable(variable) {
  const cursor = editor.getCursor();
  editor.replaceRange(`{{${variable}}}`, cursor);
  editor.focus();
}

async function fetchAndRenderForms() {
  try {
    const formsList = document.getElementById("formsList");
    formsList.innerHTML =
      '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading forms...</div>';

    const categoryFilter = document.getElementById("filterCategory").value;
    const templateFilter = document.getElementById("filterTemplate").value;
    const searchTerm = document.getElementById("searchInput").value;

    let queryParams = {};
    if (categoryFilter) queryParams.category = categoryFilter;

    queryParams.templateType = templateFilter;

    // if search term exists, use search endpoint instead
    if (searchTerm) {
      allForms = await API.searchForms(searchTerm, queryParams);
    } else {
      allForms = await API.fetchForms(queryParams);
    }

    console.log(`Fetched ${allForms.length} forms`);

    if (allForms.length === 0) {
      formsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-file-alt"></i>
          <h3>No forms found</h3>
          <p>Create a form by clicking the "Create Form" button above</p>
        </div>
      `;
      return;
    }

    formsList.innerHTML = "";

    // group forms by category
    const groupedForms = {};
    allForms.forEach((form) => {
      if (!groupedForms[form.category]) {
        groupedForms[form.category] = [];
      }
      groupedForms[form.category].push(form);
    });

    const allCategoriesContainer = document.createElement("div");

    // define the desired category order
    const categoryOrder = [
      "proposal",
      "contract",
      "agreement",
      "invoice",
      "other",
    ];

    // initialize pagination 
    const categoryPageSizes = {
      drafts: 12, 
      templates: 12, 
    };

    // ensure pagination is initialized for each category
    Object.keys(groupedForms).forEach((category) => {
      if (!categoryPagination[category]) {
        categoryPagination[category] = { currentPage: 1 };
      }
    });

    // process each category in the specified order
    categoryOrder.forEach((category) => {
      // skip if there are no forms in this category
      if (!groupedForms[category] || groupedForms[category].length === 0) {
        return;
      }

      const forms = groupedForms[category];

      const categoryDiv = document.createElement("div");
      categoryDiv.className = "forms-category";
      categoryDiv.style.marginBottom = "30px";

      const header = document.createElement("h3");
      let icon = "fa-file-alt"; // default icon

      // set icon based on category
      switch (category) {
        case "contract":
          icon = "fa-file-contract";
          break;
        case "proposal":
          icon = "fa-file-invoice";
          break;
        case "invoice":
          icon = "fa-file-invoice-dollar";
          break;
        case "agreement":
          icon = "fa-handshake";
          break;
        case "drafts":
          icon = "fa-file-alt";
          break;
      }

      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

      header.innerHTML = `<i class="fas ${icon}"></i> ${categoryName}`;
      categoryDiv.appendChild(header);

      const cardsDiv = document.createElement("div");
      cardsDiv.className = "template-cards";
      cardsDiv.style.display = "grid";

      // determine page size for this category
      // check if the template filter is set to 'draft'
      const isDraftsCategory = templateFilter === "draft";
      const pageSize = isDraftsCategory
        ? categoryPageSizes["drafts"]
        : categoryPageSizes["templates"];

      // set up pagination for this category
      const totalItems = forms.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const currentPageForCategory =
        categoryPagination[category].currentPage || 1;

      // make sure current page is valid
      if (currentPageForCategory > totalPages) {
        categoryPagination[category].currentPage = 1;
      }

      // get items for current page
      const startIndex =
        (categoryPagination[category].currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);
      const paginatedForms = forms.slice(startIndex, endIndex);

      console.log(
        `Category ${category}: ${forms.length} forms, ${totalPages} pages, current page size: ${pageSize}, current page: ${categoryPagination[category].currentPage}`
      );
      console.log(`Showing items ${startIndex} to ${endIndex}`);

      paginatedForms.forEach((form) => {
        const card = createFormCard(form);
        card.style.display = "flex";
        cardsDiv.appendChild(card);
      });

      categoryDiv.appendChild(cardsDiv);

      // only show pagination if total forms exceed page size
      if (totalItems > pageSize) {
        const paginationContainer = document.createElement("div");
        paginationContainer.className = "pagination";
        paginationContainer.style.margin = "0 0 1rem";

        const prevButton = document.createElement("button");
        prevButton.className = "pagination-button";
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = categoryPagination[category].currentPage === 1;
        prevButton.addEventListener("click", () => {
          if (categoryPagination[category].currentPage > 1) {
            categoryPagination[category].currentPage--;
            fetchAndRenderForms();
          }
        });
        paginationContainer.appendChild(prevButton);

        // determine start and end pages to show
        let startPage = categoryPagination[category].currentPage - 1;
        let endPage = categoryPagination[category].currentPage + 1;

        // adjust start and end pages to always show 3 pages
        if (startPage < 1) {
          startPage = 1;
          endPage = Math.min(3, totalPages);
        }

        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = Math.max(1, totalPages - 2);
        }

        for (let i = startPage; i <= endPage; i++) {
          const pageButton = document.createElement("button");
          pageButton.className = "pagination-button";
          if (i === categoryPagination[category].currentPage) {
            pageButton.classList.add("active");
          }
          pageButton.textContent = i;
          pageButton.addEventListener("click", () => {
            categoryPagination[category].currentPage = i;
            fetchAndRenderForms();
          });
          paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement("button");
        nextButton.className = "pagination-button";
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled =
          categoryPagination[category].currentPage === totalPages ||
          totalPages === 0;
        nextButton.addEventListener("click", () => {
          if (categoryPagination[category].currentPage < totalPages) {
            categoryPagination[category].currentPage++;
            fetchAndRenderForms();
          }
        });
        paginationContainer.appendChild(nextButton);

        const pageInfo = document.createElement("div");
        pageInfo.className = "pagination-info";

        const startIndex =
          (categoryPagination[category].currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(
          categoryPagination[category].currentPage * pageSize,
          totalItems
        );

        pageInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalItems}`;
        paginationContainer.appendChild(pageInfo);

        categoryDiv.appendChild(paginationContainer);
      } else {
        // if fewer forms than page size, center the item count with padding
        const pageInfo = document.createElement("div");
        pageInfo.className = "pagination-info";
        pageInfo.style.textAlign = "center";
        pageInfo.style.padding = "1rem";
        pageInfo.style.color = "var(--text-muted)";
        pageInfo.textContent = `Showing ${totalItems} of ${totalItems} forms`;
        categoryDiv.appendChild(pageInfo);
      }

      allCategoriesContainer.appendChild(categoryDiv);
    });

    // process any remaining categories that aren't in our predefined order
    Object.keys(groupedForms).forEach((category) => {
      if (
        categoryOrder.includes(category) ||
        !groupedForms[category] ||
        groupedForms[category].length === 0
      ) {
        return;
      }

      const forms = groupedForms[category];

      const categoryDiv = document.createElement("div");
      categoryDiv.className = "forms-category";
      categoryDiv.style.marginBottom = "30px";

      const header = document.createElement("h3");
      let icon = "fa-file-alt";

      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

      header.innerHTML = `<i class="fas ${icon}"></i> ${categoryName}`;
      categoryDiv.appendChild(header);

      const cardsDiv = document.createElement("div");
      cardsDiv.className = "template-cards";
      cardsDiv.style.display = "grid";

      const isDraftsCategory = templateFilter === "draft";
      const pageSize = isDraftsCategory
        ? categoryPageSizes["drafts"]
        : categoryPageSizes["templates"];

      const totalItems = forms.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const currentPageForCategory =
        categoryPagination[category].currentPage || 1;

      if (currentPageForCategory > totalPages) {
        categoryPagination[category].currentPage = 1;
      }

      const startIndex =
        (categoryPagination[category].currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);
      const paginatedForms = forms.slice(startIndex, endIndex);

      paginatedForms.forEach((form) => {
        const card = createFormCard(form);
        card.style.display = "flex";
        cardsDiv.appendChild(card);
      });

      categoryDiv.appendChild(cardsDiv);

      if (totalItems > pageSize) {
        const paginationContainer = document.createElement("div");
        paginationContainer.className = "pagination";
        paginationContainer.style.margin = "0 0 1rem";

        const prevButton = document.createElement("button");
        prevButton.className = "pagination-button";
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = categoryPagination[category].currentPage === 1;
        prevButton.addEventListener("click", () => {
          if (categoryPagination[category].currentPage > 1) {
            categoryPagination[category].currentPage--;
            fetchAndRenderForms();
          }
        });
        paginationContainer.appendChild(prevButton);

        let startPage = categoryPagination[category].currentPage - 1;
        let endPage = categoryPagination[category].currentPage + 1;

        if (startPage < 1) {
          startPage = 1;
          endPage = Math.min(3, totalPages);
        }

        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = Math.max(1, totalPages - 2);
        }

        for (let i = startPage; i <= endPage; i++) {
          const pageButton = document.createElement("button");
          pageButton.className = "pagination-button";
          if (i === categoryPagination[category].currentPage) {
            pageButton.classList.add("active");
          }
          pageButton.textContent = i;
          pageButton.addEventListener("click", () => {
            categoryPagination[category].currentPage = i;
            fetchAndRenderForms();
          });
          paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement("button");
        nextButton.className = "pagination-button";
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled =
          categoryPagination[category].currentPage === totalPages ||
          totalPages === 0;
        nextButton.addEventListener("click", () => {
          if (categoryPagination[category].currentPage < totalPages) {
            categoryPagination[category].currentPage++;
            fetchAndRenderForms();
          }
        });
        paginationContainer.appendChild(nextButton);

        const pageInfo = document.createElement("div");
        pageInfo.className = "pagination-info";

        const startIndex =
          (categoryPagination[category].currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(
          categoryPagination[category].currentPage * pageSize,
          totalItems
        );

        pageInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalItems}`;
        paginationContainer.appendChild(pageInfo);

        categoryDiv.appendChild(paginationContainer);
      } else {
        const pageInfo = document.createElement("div");
        pageInfo.className = "pagination-info";
        pageInfo.style.textAlign = "center";
        pageInfo.style.padding = "1rem";
        pageInfo.style.color = "var(--text-muted)";
        pageInfo.textContent = `Showing ${totalItems} of ${totalItems} forms`;
        categoryDiv.appendChild(pageInfo);
      }

      allCategoriesContainer.appendChild(categoryDiv);
    });

    formsList.appendChild(allCategoriesContainer);

    console.log(
      `Rendered ${allForms.length} forms across ${
        Object.keys(groupedForms).length
      } categories`
    );
  } catch (error) {
    console.error("Error fetching forms:", error);
    const formsList = document.getElementById("formsList");
    formsList.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error Loading Forms</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="fetchAndRenderForms()">Try Again</button>
      </div>
    `;
  }
}

function createFormCard(form) {
  const card = document.createElement("div");
  card.className = "template-card";
  card.dataset.formId = form._id;

  // choose icon based on category
  let icon = "fa-file-alt";

  if (form.category === "contract") {
    icon = "fa-file-contract";
  } else if (form.category === "proposal") {
    icon = "fa-file-invoice";
  } else if (form.category === "invoice") {
    icon = "fa-file-invoice-dollar";
  } else if (form.category === "agreement") {
    icon = "fa-handshake";
  }

  // use the GLOBAL date format
  const currentDateFormat = window.dateFormat || "MM/DD/YYYY";

  let formattedModifiedDate = "Not recorded";
  if (form.lastModified) {
    const modifiedDate = new Date(form.lastModified);
    formattedModifiedDate = Utils.formatDateTime(
      modifiedDate,
      currentDateFormat
    );
  }

  let formattedCreationDate = "Not recorded";
  if (form.createdAt) {
    const creationDate = new Date(form.createdAt);
    formattedCreationDate = Utils.formatDateTime(
      creationDate,
      currentDateFormat
    );
  }

  const typeLabel = form.isTemplate
    ? '<span class="type-label template">Template</span>'
    : '<span class="type-label draft">Draft</span>';

  card.innerHTML = `
    <div class="template-icon">
      <i class="fas ${icon}"></i>
    </div>
    <div class="template-details">
      <h4>${form.title} ${typeLabel}</h4>
      <p>${form.description || "No description"}</p>
      <div class="template-meta">
        <span><i class="far fa-calendar-plus"></i> Created: ${formattedCreationDate}</span>
        <span><i class="far fa-clock"></i> Modified: ${formattedModifiedDate}</span>
      </div>
    </div>
    <div class="template-actions">
      <button class="btn-icon preview-form" title="Preview">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn-icon edit-form" title="Edit">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn-icon delete-form" title="Delete">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;

  card.querySelector(".preview-form").addEventListener("click", function (e) {
    e.stopPropagation();
    openFormPreview(form._id);
  });

  card.querySelector(".edit-form").addEventListener("click", function (e) {
    e.stopPropagation();
    openEditFormModal(form._id);
  });

  card.querySelector(".delete-form").addEventListener("click", function (e) {
    e.stopPropagation();
    confirmDeleteForm(form._id);
  });

  card.addEventListener("click", function () {
    openFormPreview(form._id);
  });

  return card;
}

// apply filters and search
function applyFilters() {
  // reset category pagination when filters change
  categoryPagination = {};
  fetchAndRenderForms();
}

// open the form creation modal
function openCreateFormModal() {
  document.getElementById("formId").value = "";
  document.getElementById("formTitle").value = "";
  document.getElementById("formDescription").value = "";
  document.getElementById("formCategory").value = "contract";
  document.getElementById("isTemplate").value = "true";

  if (editor) {
    editor.setValue("");

    setTimeout(() => {
      editor.refresh();
      editor.focus();
      updateMarkdownPreview();
    }, 50);
  }

  document.getElementById("formEditorTitle").textContent = "Create New Form";
  document.getElementById("formEditorModal").style.display = "block";
}

async function openEditFormModal(formId) {
  try {
    Utils.showToast("Loading form...");

    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch form details");
    }

    const form = await response.json();

    document.getElementById("formId").value = form._id;
    document.getElementById("formTitle").value = form.title;
    document.getElementById("formDescription").value = form.description || "";
    document.getElementById("formCategory").value = form.category;
    document.getElementById("isTemplate").value = form.isTemplate.toString();

    editor.setValue(form.content);

    // refresh the editor after setting content
    setTimeout(() => {
      editor.refresh();
      // also force focus on the editor to ensure it's visible
      editor.focus();
    }, 10);

    document.getElementById("formEditorTitle").textContent = "Edit Form";

    document.getElementById("formEditorModal").style.display = "block";
  } catch (error) {
    console.error("Error loading form for editing:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// close the form editor modal
function closeFormEditorModal() {
  document.getElementById("formEditorModal").style.display = "none";
}

// handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();

  Utils.showToast("Saving form...");

  const formId = document.getElementById("formId").value;
  const title = document.getElementById("formTitle").value;
  const description = document.getElementById("formDescription").value;
  const category = document.getElementById("formCategory").value;
  const isTemplate = document.getElementById("isTemplate").value === "true";

  // get content from CodeMirror editor instead of the hidden textarea
  const content = editor.getValue();

  console.log("Form data gathered:", {
    formId,
    title,
    description,
    category,
    isTemplate,
    contentLength: content.length,
  });

  if (!title) {
    Utils.showToast("Title is required");
    document.getElementById("formTitle").focus();
    return;
  }

  if (!content) {
    Utils.showToast("Content is required");
    editor.focus();
    return;
  }

  const formData = {
    title,
    description,
    category,
    isTemplate,
    content,
  };

  try {
    console.log("Attempting to save form...");
    const baseUrl = API.getBaseUrl() + "/api/forms";

    let response;
    if (formId) {
      console.log(`Updating form ID: ${formId}`);
      response = await fetch(`${baseUrl}/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    } else {
      console.log("Creating new form");
      response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error response:", errorData);
      throw new Error(
        errorData.message || `Server returned ${response.status}`
      );
    }

    const savedForm = await response.json();
    console.log("Form saved successfully:", savedForm);

    closeFormEditorModal();

    Utils.showToast(
      formId ? "Form updated successfully" : "Form created successfully"
    );

    fetchAndRenderForms();
  } catch (error) {
    console.error("Error saving form:", error);
    Utils.showToast(
      `Error: ${
        error.message || "Failed to save form"
      }. Check console for details.`
    );
  }
}

async function openFormPreview(formId) {
  try {
    currentFormId = formId;

    Utils.showToast("Loading preview...");

    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch form details");
    }

    const form = await response.json();

    const dateFormat = window.dateFormat || "MM/DD/YYYY";

    let formattedCreationDate = "Not recorded";
    let formattedModifiedDate = "Not recorded";

    if (form.createdAt) {
      const creationDate = new Date(form.createdAt);
      formattedCreationDate = Utils.formatDateTime(creationDate, dateFormat);
    }

    if (form.lastModified) {
      const modifiedDate = new Date(form.lastModified);
      formattedModifiedDate = Utils.formatDateTime(modifiedDate, dateFormat);
    }

    document.getElementById("previewFormTitle").textContent = form.title;

    // create metadata section for dates
    const metadataHTML = `
       <div class="form-metadata">
          <div><strong>Form Id: ${formId}</strong></div>
          <div><strong>Created:</strong> ${formattedCreationDate}</div>
          <div><strong>Last Modified:</strong> ${formattedModifiedDate}</div>
          <small>(Form Metadata will not be visible outside of this preview)</small>
          <hr>
        </div> 
    `;

    const html = DOMPurify.sanitize(marked.parse(form.content));

    const previewContent = document.getElementById("previewContent");
    previewContent.innerHTML = metadataHTML + html;

    // only show the "Use with Lead" button for templates
    const useWithLeadButton = form.isTemplate
      ? `<button type="button" id="useWithLeadBtn" class="btn btn-outline">
        <i class="fas fa-user"></i> Use Customer Data
      </button>`
      : "";

    const modalActions = document.querySelector(
      "#formPreviewModal .modal-actions"
    );
    if (modalActions) {
      modalActions.innerHTML = `
        <div>
          <button type="button" id="editFormBtn" class="btn btn-outline">
            <i class="fas fa-edit"></i> Edit
          </button>
          ${useWithLeadButton}
        </div>
        <div>
          <button type="button" id="downloadFormBtn" class="btn btn-primary">
            <i class="fas fa-download"></i> Download .md
          </button>
          <button type="button" id="printFormBtn" class="btn btn-primary">
            <i class="fas fa-print"></i> Print PDF
          </button>
        </div>
      `;
    }

    document.getElementById("formPreviewModal").style.display = "block";

    document
      .getElementById("editFormBtn")
      .addEventListener("click", function () {
        closeFormPreviewModal();
        openEditFormModal(formId);
      });

    document
      .getElementById("downloadFormBtn")
      .addEventListener("click", function () {
        downloadForm(formId);
      });

    document
      .getElementById("printFormBtn")
      .addEventListener("click", function () {
        printForm(formId);
      });

    // only add the Use with Lead event listener if the button exists
    const useWithLeadBtn = document.getElementById("useWithLeadBtn");
    if (useWithLeadBtn) {
      useWithLeadBtn.addEventListener("click", function () {
        openLeadSelectionModal();
      });
    }
  } catch (error) {
    console.error("Error loading form preview:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// close the form preview modal
function closeFormPreviewModal() {
  document.getElementById("formPreviewModal").style.display = "none";
}

// confirm delete form
function confirmDeleteForm(formId) {
  if (
    confirm(
      "Are you sure you want to delete this form? This action cannot be undone."
    )
  ) {
    deleteForm(formId);
  }
}

// delete a form
async function deleteForm(formId) {
  try {
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete form");
    }

    Utils.showToast("Form deleted successfully");
    fetchAndRenderForms();
  } catch (error) {
    console.error("Error deleting form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

async function downloadForm(formId) {
  try {
    let formContent;
    let title;

    if (formId) {
      // fetch form from server to get original content with all whitespace
      const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch form");
      }

      const form = await response.json();
      formContent = form.content;
      title = form.title;
    } else {
      title = document.getElementById("previewFormTitle").textContent;

      if (editor) {
        formContent = editor.getValue();
      } else {
        // fallback in case editor isn't available
        const previewContent = document.getElementById("previewContent");
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = previewContent.innerHTML;
        formContent = tempDiv.innerText;
      }
    }

    // create a blob with the raw content
    const blob = new Blob([formContent], {
      type: "text/markdown;charset=utf-8",
    });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${title.replace(/\s+/g, "_")}.md`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error("Error downloading form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

async function printForm(formId) {
  try {
    let form;
    if (formId) {
      const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch form");
      }

      form = await response.json();
    } else {
      const title = document.getElementById("previewFormTitle").textContent;
      const content = editor
        ? editor.getValue()
        : document.getElementById("previewContent").innerText;
      form = { title, content };
    }

    const printWindow = window.open("", "_blank");

    const formattedContent = marked.parse(form.content);

    // write content to print window with special styling for whitespace
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
        
        p {
          margin: 1em 0;
          white-space: pre-wrap;
        }
        
        blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1rem;
          margin-left: 0;
          color: #666;
        }
        
        pre, code {
          white-space: pre;
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: monospace;
        }
        
        ul, ol {
          padding-left: 2em;
          margin: 1em 0;
        }
        
        li {
          margin-bottom: 0.5em;
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

async function openLeadSelectionModal() {
  try {
    // first, close the form preview modal
    const previewModal = document.getElementById("formPreviewModal");
    if (previewModal) {
      previewModal.style.display = "none";
    }

    // check if the current form is a template
    if (currentFormId) {
      const form = await fetchFormById(currentFormId);

      if (!form.isTemplate) {
        Utils.showToast(
          "Only templates can be used with leads. This is a regular form."
        );
        return;
      }
    } else {
      Utils.showToast("Form not found");
      return;
    }

    Utils.showToast("Loading leads...");

    const response = await fetch(`${API.getBaseUrl()}/api/leads`);

    if (!response.ok) {
      throw new Error("Failed to fetch leads");
    }

    const leads = await response.json();

    const leadsList = document.getElementById("leadsList");
    leadsList.innerHTML = "";

    if (leads.length === 0) {
      leadsList.innerHTML = "<p>No leads found</p>";
    } else {
      leads.forEach((lead) => {
        const leadItem = document.createElement("div");
        leadItem.className = "lead-item";
        leadItem.style.display = "flex";
        leadItem.style.alignItems = "center";
        leadItem.style.justifyContent = "space-between";
        leadItem.style.padding = "1rem";
        leadItem.style.borderBottom = "1px solid var(--border-color)";

        const fullName = `${lead.firstName} ${lead.lastName}`;
        const businessName = lead.businessName || "N/A";

        leadItem.innerHTML = `
      <div>
        <h4 style="margin: 0 0 0.5rem 0;">${fullName}</h4>
        <p style="margin: 0; color: var(--text-muted);">${businessName}</p>
      </div>
      <button class="btn btn-primary">Use</button>
    `;

        leadItem.querySelector("button").addEventListener("click", function () {
          generateFormFromTemplate(currentFormId, lead._id);
          closeLeadSelectionModal();
        });

        leadsList.appendChild(leadItem);
      });
    }

    document.getElementById("leadSelectionModal").style.display = "block";
  } catch (error) {
    console.error("Error loading leads:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// helper function to fetch a single form
async function fetchFormById(formId) {
  try {
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch form");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching form:", error);
    throw error;
  }
}

async function generateFormFromTemplate(templateId, leadId) {
  try {
    Utils.showToast("Generating form...");

    // multi-method timezone detection for iOS compatibility
    let timezone;

    // method 1 try Intl.DateTimeFormat().resolvedOptions().timeZone (works in most browsers)
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log("Timezone detected via Intl.DateTimeFormat:", timezone);
    } catch (error) {
      console.warn("Failed to detect timezone via Intl.DateTimeFormat:", error);
    }

    // method 2 try to calculate timezone offset and determine name (fallback for iOS)
    if (!timezone) {
      try {
        const offsetMinutes = new Date().getTimezoneOffset();
        const offsetHours = -offsetMinutes / 60;
        const formattedOffset = `${offsetHours >= 0 ? "+" : "-"}${Math.abs(
          Math.floor(offsetHours)
        )
          .toString()
          .padStart(2, "0")}:${(Math.abs(offsetHours % 1) * 60)
          .toString()
          .padStart(2, "0")}`;

        // map common offsets to timezone names, not perfect solution
        const offsetToTimezone = {
          "-08:00": "America/Los_Angeles",
          "-07:00": "America/Los_Angeles",
          "-05:00": "America/New_York", 
          "-04:00": "America/New_York", 
          "+00:00": "Europe/London", 
          "+01:00": "Europe/Paris", 
          "+02:00": "Europe/Helsinki", 
          "+05:30": "Asia/Kolkata", 
          "+08:00": "Asia/Singapore", 
          "+09:00": "Asia/Tokyo", 
          "+10:00": "Australia/Sydney", 
        };

        timezone =
          offsetToTimezone[formattedOffset] ||
          `Etc/GMT${formattedOffset.replace(":", "")}`;
        console.log(
          "Timezone detected via offset calculation:",
          timezone,
          "offset:",
          formattedOffset
        );
      } catch (error) {
        console.warn(
          "Failed to detect timezone via offset calculation:",
          error
        );
      }
    }

    // method 3 try getting timezone from date string parsing (another iOS fallback)
    if (!timezone) {
      try {
        const dateString = new Date().toString();
        const tzAbbr = dateString.match(/\(([^)]+)\)$/)?.[1];

        const tzAbbrMap = {
          PST: "America/Los_Angeles",
          PDT: "America/Los_Angeles",
          EST: "America/New_York",
          EDT: "America/New_York",
          CST: "America/Chicago",
          CDT: "America/Chicago",
          MST: "America/Denver",
          MDT: "America/Denver",
          GMT: "Europe/London",
          BST: "Europe/London",
          CET: "Europe/Paris",
          CEST: "Europe/Paris",
          JST: "Asia/Tokyo",
          IST: "Asia/Kolkata",
        };

        timezone = tzAbbrMap[tzAbbr] || "America/Los_Angeles"; // default to Los Angeles if unknown
        console.log(
          "Timezone detected via date string:",
          timezone,
          "abbr:",
          tzAbbr
        );
      } catch (error) {
        console.warn("Failed to detect timezone via date string:", error);
      }
    }

    // final fallback use a default timezone
    if (!timezone) {
      timezone = "America/Los_Angeles"; // default to Pacific Time
      console.warn(
        "All timezone detection methods failed, using default:",
        timezone
      );
    }

    console.log("Client timezone detection complete:", {
      detectedTimezone: timezone,
      dateInfo: {
        localeDateString: new Date().toLocaleDateString(),
        localeTimeString: new Date().toLocaleTimeString(),
        isoString: new Date().toISOString(),
        utcString: new Date().toUTCString(),
        dateString: new Date().toString(),
      },
      browserInfo: navigator.userAgent,
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
          timezone, // send the timezone with the request
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Form generation failed:", errorData);
      throw new Error(errorData.message || "Failed to generate form");
    }

    const result = await response.json();

    console.log("Form generated successfully with timezone info:", {
      serverUsedTimezone: result.debug?.usedTimezone || result.usedTimezone,
      formattedDateExample: result.debug?.formattedDateExample,
      timezoneSource: result.debug?.timezoneSource || "unknown",
      generatedFormId: result._id,
    });

    const modal = document.getElementById("formTemplateModal");
    if (modal) {
      modal.style.display = "none";
      document.body.removeChild(modal);
    }

    Utils.showToast(`Form created successfully using timezone: ${timezone}`);

    console.log("Form generated from forms page for lead:", leadId);
    fetchAndRenderForms();
  } catch (error) {
    console.error("Error generating form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

function initializeGeneratedFormEditor() {
  const textarea = document.getElementById("editGeneratedContent");
  if (!textarea) return;

  // check if CodeMirror is already initialized on this textarea
  if (
    textarea.nextSibling &&
    textarea.nextSibling.classList &&
    textarea.nextSibling.classList.contains("CodeMirror")
  ) {
    return;
  }

  try {
    window.generatedFormEditor = CodeMirror.fromTextArea(textarea, {
      mode: "markdown",
      lineNumbers: true,
      lineWrapping: true,
      theme: "default",
      placeholder: "Edit your form content here in Markdown format...",
    });

    window.generatedFormEditor.on("change", function () {
      updateGeneratedFormPreview();
    });

    setTimeout(() => {
      if (window.generatedFormEditor) {
        window.generatedFormEditor.refresh();
      }
    }, 50);
  } catch (error) {
    console.error("Error initializing CodeMirror editor:", error);
    // fallback to regular textarea if CodeMirror fails
  }
}

function updateGeneratedFormPreview() {
  if (!window.generatedFormEditor) return;

  const content = window.generatedFormEditor.getValue();
  const preview = document.getElementById("generatedContent");

  if (!content) {
    preview.innerHTML = "<p><em>No content to preview</em></p>";
    return;
  }

  const html = DOMPurify.sanitize(marked.parse(content));
  preview.innerHTML = html;
}

function setupGeneratedFormModalEvents(leadId) {
  // tab switching
  document
    .querySelectorAll("#generatedFormModal .editor-tab")
    .forEach((tab) => {
      tab.addEventListener("click", function () {
        console.log("Tab clicked:", this.getAttribute("data-tab"));

        document
          .querySelectorAll("#generatedFormModal .editor-tab")
          .forEach((t) => {
            t.classList.remove("active");
          });
        this.classList.add("active");

        const tabName = this.getAttribute("data-tab");
        const editorSection = document.querySelector(
          "#generatedFormModal .editor-section"
        );
        const previewSection = document.querySelector(
          "#generatedFormModal .preview-section"
        );

        console.log("Switching to tab:", tabName);
        console.log("Editor section:", editorSection);
        console.log("Preview section:", previewSection);

        if (tabName === "editor") {
          if (editorSection) editorSection.classList.remove("inactive");
          if (previewSection) previewSection.classList.remove("active");

          if (window.generatedFormEditor) {
            setTimeout(() => {
              window.generatedFormEditor.refresh();
              window.generatedFormEditor.focus();
            }, 50);
          }
        } else {
          if (editorSection) editorSection.classList.add("inactive");
          if (previewSection) previewSection.classList.add("active");

          updateGeneratedFormPreview();
        }
      });
    });

  document
    .getElementById("saveGeneratedBtn")
    .addEventListener("click", function () {
      saveGeneratedForm(leadId);
    });

  document
    .getElementById("closeGeneratedFormModal")
    .addEventListener("click", function () {
      document.getElementById("generatedFormModal").style.display = "none";
    });

  document
    .getElementById("downloadGeneratedBtn")
    .addEventListener("click", function () {
      downloadGeneratedForm();
    });

  document
    .getElementById("printGeneratedBtn")
    .addEventListener("click", function () {
      printGeneratedForm();
    });
}

async function saveGeneratedForm(leadId) {
  try {
    if (!window.generatedFormEditor || !window.currentGeneratedForm) {
      Utils.showToast("Error: Form editor not initialized");
      return;
    }

    const formId = window.currentGeneratedForm._id;
    const content = window.generatedFormEditor.getValue();

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

    updateGeneratedFormPreview();

    // reload lead forms
    if (leadId) {
      try {
        // first check if the function exists in the global scope
        if (typeof window.loadLeadForms === "function") {
          window.loadLeadForms(leadId);
        } else if (typeof loadLeadForms === "function") {
          loadLeadForms(leadId);
        } else {
          console.log(
            "Note: Form saved but couldn't refresh lead forms list automatically."
          );
        }
      } catch (err) {
        console.log(
          "Note: Form saved but couldn't refresh lead forms list automatically."
        );
      }
    }
  } catch (error) {
    console.error("Error saving form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// close the generated form modal
function closeGeneratedFormModal() {
  document.getElementById("generatedFormModal").style.display = "none";
}

function closeLeadSelectionModal() {
  const modal = document.getElementById("leadSelectionModal");
  if (modal) {
    modal.style.display = "none";
  }
}

function downloadGeneratedForm() {
  try {
    let content;

    if (window.currentGeneratedForm && window.currentGeneratedForm.content) {
      content = window.currentGeneratedForm.content;
    } else if (window.generatedFormEditor) {
      content = window.generatedFormEditor.getValue();
    } else {
      const generatedContent = document.getElementById("generatedContent");
      const tempElement = document.createElement("div");
      tempElement.innerHTML = generatedContent.innerHTML;
      content = tempElement.innerText;
    }

    const title = document.getElementById("generatedFormTitle").textContent;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${title.replace(/\s+/g, "_")}.md`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error("Error downloading generated form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// print the generated form
function printGeneratedForm() {
  const title = document.getElementById("generatedFormTitle").textContent;
  const content = document.getElementById("generatedContent").innerHTML;

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
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
    ${content}
  </body>
</html>
`);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export {
  openFormPreview,
  downloadForm,
  printForm,
  openEditFormModal,
  deleteForm,
};