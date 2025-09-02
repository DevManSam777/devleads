import * as API from "./api.js";
import * as Utils from "./utils.js";
import * as Pagination from "./pagination.js";

let allHitlists = [];
let currentHitlistId = null;
let currentBusinesses = []; 
let originalBusinesses = []; 

let hitlistCurrentPage = 1;
let hitlistPageSize = 12; 
let hitlistTotalPages = 1;

document.addEventListener("DOMContentLoaded", async function () {
  await initializeSettings();
  setupSidebarToggle();
  setupEventListeners();
  fetchAndRenderHitlists();
  setupImportExportButtons();

  // load saved page size from localStorage
  const savedPageSize = localStorage.getItem("hitlistPageSize");
  if (savedPageSize) {
    hitlistPageSize = parseInt(savedPageSize);
  }

  // listen for settings updates to refresh date displays
  window.addEventListener("settingsUpdated", function (event) {
    const { key, value } = event.detail;

    if (key === "dateFormat") {
      console.log("Date format updated to:", value);
      window.dateFormat = value;

      // refresh hitlists and businesses to update date displays
      if (allHitlists && allHitlists.length > 0) {
        renderPaginatedHitlists();
      }

      if (
        currentHitlistId &&
        currentBusinesses &&
        currentBusinesses.length > 0
      ) {
        renderBusinesses(currentBusinesses);
      }

      initializeDateInputs();
    }
  });
});

async function initializeSettings() {
  try {
    const settings = await API.fetchAllSettings();

    window.dateFormat = settings.dateFormat || "MM/DD/YYYY";

    console.log("Date format initialized:", window.dateFormat);

    return settings;
  } catch (error) {
    console.error("Error initializing settings:", error);

    // fallback to localStorage if api fails
    window.dateFormat = localStorage.getItem("dateFormat") || "MM/DD/YYYY";
    console.log("Using fallback date format:", window.dateFormat);

    return {
      dateFormat: window.dateFormat,
    };
  }
}

function setupSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (!sidebar || !mainContent) {
    console.error("Sidebar or main content not found");
    return;
  }

  const isSidebarCollapsed =
    localStorage.getItem("sidebarCollapsed") === "true";

  if (isSidebarCollapsed) {
    sidebar.classList.add("collapsed");
    mainContent.classList.add("expanded");
  }

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

function setupEventListeners() {
  document
    .getElementById("createHitlistBtn")
    .addEventListener("click", openCreateHitlistModal);
  document
    .getElementById("closeHitlistModal")
    .addEventListener("click", closeHitlistModal);
  document
    .getElementById("cancelHitlistBtn")
    .addEventListener("click", closeHitlistModal);
  document
    .getElementById("hitlistForm")
    .addEventListener("submit", handleHitlistSubmit);

  document
    .getElementById("closeBusinessListModal")
    .addEventListener("click", closeBusinessListModal);

  document
    .getElementById("addBusinessBtn")
    .addEventListener("click", openAddBusinessModal);

  document
    .getElementById("searchInput")
    .addEventListener("input", searchHitlists);
  document
    .getElementById("businessSearchInput")
    .addEventListener("input", filterBusinesses);
  document
    .getElementById("statusFilter")
    .addEventListener("change", filterBusinesses);

  const closeBusinessViewModalButton = document.getElementById(
    "closeBusinessViewModal"
  );
  if (closeBusinessViewModalButton) {
    closeBusinessViewModalButton.addEventListener("click", function () {
      document.getElementById("businessViewModal").style.display = "none";
    });
  }

  setupHitlistFormTextareas();
}

function setupHitlistFormTextareas() {
  const descriptionTextarea = document.getElementById("hitlistDescription");
  if (descriptionTextarea) {
    descriptionTextarea.style.height = "auto";
    descriptionTextarea.style.height = descriptionTextarea.scrollHeight + "px";

    descriptionTextarea.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  }
}

async function fetchAndRenderHitlists() {
  try {
    const hitlistsLoadingSpinner = document.getElementById(
      "hitlistsLoadingSpinner"
    );
    const hitlistsList = document.getElementById("hitlistsList");

    if (hitlistsLoadingSpinner) hitlistsLoadingSpinner.style.display = "flex";
    if (hitlistsList) hitlistsList.innerHTML = "";

    allHitlists = await API.fetchHitlists();
    allHitlists = sortHitlistsAlphabetically(allHitlists);

    // reset to page 1 when loading fresh data
    hitlistCurrentPage = 1;

    if (hitlistsLoadingSpinner) hitlistsLoadingSpinner.style.display = "none";

    renderPaginatedHitlists();
  } catch (error) {
    console.error("Error fetching hitlists:", error);

    const hitlistsLoadingSpinner = document.getElementById(
      "hitlistsLoadingSpinner"
    );
    if (hitlistsLoadingSpinner) hitlistsLoadingSpinner.style.display = "none";

    const hitlistsList = document.getElementById("hitlistsList");
    if (hitlistsList) {
      hitlistsList.innerHTML =
        '<div class="error-state">Error loading hitlists. Please try again.</div>';
    }
  }
}

// get filtered hitlists based on current search term (similar to getFilteredLeads in dashboard)
function getFilteredHitlists() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  
  let filteredHitlists = [...allHitlists];

  // apply search filter
  if (searchTerm) {
    filteredHitlists = filteredHitlists.filter(
      (hitlist) =>
        hitlist.name.toLowerCase().includes(searchTerm) ||
        (hitlist.description &&
          hitlist.description.toLowerCase().includes(searchTerm))
    );
  }

  // apply sorting (always sort alphabetically)
  return sortHitlistsAlphabetically(filteredHitlists);
}

function renderPaginatedHitlists() {
  // get filtered hitlists
  const filteredHitlists = getFilteredHitlists();

  // initialize pagination with the filtered hitlists
  const paginationInfo = Pagination.initPagination(
    filteredHitlists,
    hitlistCurrentPage,
    hitlistPageSize
  );

  // update current page from pagination info
  hitlistCurrentPage = paginationInfo.currentPage;
  hitlistTotalPages = paginationInfo.totalPages;

  // get only the hitlists for the current page
  const paginatedHitlists = Pagination.getPaginatedItems(
    filteredHitlists,
    hitlistCurrentPage,
    hitlistPageSize
  );

  // render them
  renderHitlists(paginatedHitlists);

  // update pagination UI
  Pagination.renderPagination({
    totalItems: filteredHitlists.length,
    totalPages: hitlistTotalPages,
    currentPage: hitlistCurrentPage,
    pageSize: hitlistPageSize,
    onPageChange: (newPage) => {
      hitlistCurrentPage = newPage;
      renderPaginatedHitlists();
    },
    onPageSizeChange: (newPageSize) => {
      hitlistPageSize = newPageSize;
      localStorage.setItem("hitlistPageSize", newPageSize);
      hitlistCurrentPage = 1;
      renderPaginatedHitlists();
    },
    containerId: ".hitlists-container",
  });
}

function renderHitlists(hitlists) {
  const hitlistsList = document.getElementById("hitlistsList");

  if (!hitlists || hitlists.length === 0) {
    hitlistsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-bullseye"></i>
        <h3>No hitlists found</h3>
        <p>Try again or press the "Create Hitlist" button to get started</p>
      </div>
    `;
    return;
  }

  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  hitlistsList.innerHTML = hitlists
    .map(
      (hitlist) => `
    <div class="hitlist-card" data-id="${hitlist._id}">
      <div class="hitlist-header">
        <h3 class="hitlist-title"><span class="bullseye"><i class="fa-solid fa-bullseye"></i></span> ${
          hitlist.name
        }</h3>
        <div class="hitlist-actions">
          <button class="btn-icon edit-hitlist" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-hitlist" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <p class="hitlist-description">${
        hitlist.description || "No description"
      }</p>
      <div class="hitlist-stats">
        <span class="hitlist-stat">
          <i class="far fa-building"></i>
          ${hitlist.businessCount || 0} businesses
        </span>
        <div class="hitlist-dates">
          <span class="hitlist-stat">
            <i class="far fa-calendar-plus"></i>
            Created: ${
              hitlist.createdAt
                ? Utils.formatDate(new Date(hitlist.createdAt), dateFormat)
                : "N/A"
            }
          </span>
          <span class="hitlist-stat">
            <i class="far fa-clock"></i>
            Modified: ${
              hitlist.lastModified
                ? Utils.formatDate(new Date(hitlist.lastModified), dateFormat)
                : "N/A"
            }
          </span>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  const hitlistCards = document.querySelectorAll(".hitlist-card");
  hitlistCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      if (!e.target.closest(".hitlist-actions")) {
        openBusinessListModal(this.dataset.id);
      }
    });

    card.querySelector(".edit-hitlist").addEventListener("click", function (e) {
      e.stopPropagation();
      openEditHitlistModal(card.dataset.id);
    });

    card
      .querySelector(".delete-hitlist")
      .addEventListener("click", function (e) {
        e.stopPropagation();
        deleteHitlist(card.dataset.id);
      });
  });
}

// search hitlists based on input (similar to searchLeads in dashboard)
function searchHitlists() {
  // reset to first page when searching
  hitlistCurrentPage = 1;
  renderPaginatedHitlists();
}

function openCreateHitlistModal() {
  document.getElementById("hitlistModalTitle").textContent =
    "Create New Hitlist";
  document.getElementById("hitlistId").value = "";
  document.getElementById("hitlistForm").reset();
  document.getElementById("hitlistModal").style.display = "block";
}

function openEditHitlistModal(hitlistId) {
  const hitlist = allHitlists.find((h) => h._id === hitlistId);
  if (!hitlist) return;

  document.getElementById("hitlistModalTitle").textContent = "Edit Hitlist";
  document.getElementById("hitlistId").value = hitlist._id;
  document.getElementById("hitlistName").value = hitlist.name;

  const descriptionTextarea = document.getElementById("hitlistDescription");
  descriptionTextarea.value = hitlist.description || "";

  // auto-resize textarea after setting content
  setTimeout(() => {
    descriptionTextarea.style.height = "auto";
    descriptionTextarea.style.height = descriptionTextarea.scrollHeight + "px";
  }, 0);

  document.getElementById("hitlistModal").style.display = "block";
}

function closeHitlistModal() {
  document.getElementById("hitlistModal").style.display = "none";
}

async function handleHitlistSubmit(event) {
  event.preventDefault();

  const hitlistId = document.getElementById("hitlistId").value;
  const hitlistData = {
    name: document.getElementById("hitlistName").value.trim(),
    description: document.getElementById("hitlistDescription").value,
  };

  try {
    let savedHitlistId;
    let updatedHitlist;

    if (hitlistId) {
      updatedHitlist = await API.updateHitlist(hitlistId, hitlistData);
      Utils.showToast("Hitlist updated successfully");
      savedHitlistId = hitlistId;
      
      const hitlistIndex = allHitlists.findIndex(h => h._id === hitlistId);
      if (hitlistIndex !== -1) {
        allHitlists[hitlistIndex] = updatedHitlist;
        
        updateHitlistLastModified(hitlistId, new Date(updatedHitlist.lastModified));
      }
    } else {
      const newHitlist = await API.createHitlist(hitlistData);
      Utils.showToast("Hitlist created successfully");
      savedHitlistId = newHitlist._id;
      
      allHitlists.push(newHitlist);
      
      allHitlists = sortHitlistsAlphabetically(allHitlists);
    }

    closeHitlistModal();

    // refresh the paginated view
    if (!hitlistId) {
      // for new hitlists, reset to page 1
      hitlistCurrentPage = 1;
    }
    renderPaginatedHitlists();

    // open business list modal after creating/editing
    if (savedHitlistId) {
      openBusinessListModal(savedHitlistId);
    }
  } catch (error) {
    console.error("Error saving hitlist:", error);
    Utils.showToast("Error saving hitlist");
  }
}

async function openBusinessListModal(hitlistId) {
  currentHitlistId = hitlistId;
  const hitlist = allHitlists.find((h) => h._id === hitlistId);

  if (!hitlist) return;

  document.getElementById("businessListTitle").textContent =
    hitlist.name + " - Businesses";
  document.getElementById("businessListModal").style.display = "block";

  const businessesList = document.getElementById("businessesList");
  businessesList.innerHTML =
    '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading businesses...</div>';

  try {
    const businesses = await API.fetchBusinessesByHitlist(hitlistId);
    const sortedBusinesses = sortBusinessesAlphabetically(businesses);
    originalBusinesses = [...sortedBusinesses];
    currentBusinesses = [...sortedBusinesses];

    document.getElementById("businessSearchInput").value = "";
    document.getElementById("statusFilter").value = "";

    renderBusinesses(currentBusinesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    businessesList.innerHTML =
      '<div class="error-state">Error loading businesses. Please try again.</div>';
  }
}

function closeBusinessListModal() {
  document.getElementById("businessListModal").style.display = "none";
  currentHitlistId = null;
}

function attachBusinessActionListeners(businesses) {
  const businessesList = document.getElementById("businessesList");

  businessesList.querySelectorAll(".view-business").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const businessId = this.closest(".business-item").dataset.id;
      const business = businesses.find((b) => b._id === businessId);
      openViewBusinessModal(business);
    });
  });

  businessesList.querySelectorAll(".convert-to-lead").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const businessId = this.closest(".business-item").dataset.id;
      const business = businesses.find((b) => b._id === businessId);
      convertBusinessToLead(business);
    });
  });

  businessesList.querySelectorAll(".edit-business").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const businessId = this.closest(".business-item").dataset.id;
      const business = businesses.find((b) => b._id === businessId);
      openEditBusinessModal(business);
    });
  });

  businessesList.querySelectorAll(".delete-business").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const businessId = this.closest(".business-item").dataset.id;
      deleteBusiness(businessId);
    });
  });
}

function openAddBusinessModal() {
  const modal = document.getElementById("businessModal");
  if (!modal) {
    console.error("Business modal not found");
    return;
  }

  const form = document.getElementById("businessForm");
  if (form) {
    form.reset();
  }

  document.getElementById("businessId").value = "";
  document.getElementById("currentHitlistId").value = currentHitlistId || "";

  const lastContactedInput = document.getElementById("lastContactedDate");
  const lastContactedDisplay = document.getElementById("lastContactedDisplay");
  if (lastContactedInput) lastContactedInput.value = "";
  if (lastContactedDisplay) lastContactedDisplay.textContent = "";

  const hasWebsiteSelect = document.getElementById("hasWebsite");
  const websiteUrlGroup = document.getElementById("websiteUrlGroup");
  if (hasWebsiteSelect && websiteUrlGroup) {
    websiteUrlGroup.style.display =
      hasWebsiteSelect.value === "true" ? "block" : "none";
  } else if (websiteUrlGroup) {
    websiteUrlGroup.style.display = "none";
  }

  setupBusinessModalListeners();

  modal.style.display = "block";
}

function openEditBusinessModal(business) {
  if (!business) {
    console.error("No business data provided");
    return;
  }

  const modal = document.getElementById("businessModal");
  if (!modal) {
    console.error("Business modal not found");
    return;
  }

  const nameParts = (business.contactName || "").split(" ");

  document.getElementById("businessId").value = business._id;
  document.getElementById("currentHitlistId").value = business.hitlistId;
  document.getElementById("businessName").value = business.businessName || "";
  document.getElementById("typeOfBusiness").value =
    business.typeOfBusiness || "";
  document.getElementById("contactFirstName").value = nameParts[0] || "";
  document.getElementById("contactLastName").value =
    nameParts.slice(1).join(" ") || "";
  document.getElementById("businessPhone").value = business.businessPhone || "";
  document.getElementById("businessPhoneExt").value =
    business.businessPhoneExt || "";
  document.getElementById("businessEmail").value = business.businessEmail || "";
  document.getElementById("websiteUrl").value = business.websiteUrl || "";

  const address = business.address || {};
  document.getElementById("businessStreet").value = address.street || "";
  document.getElementById("businessAptUnit").value = address.aptUnit || "";
  document.getElementById("businessCity").value = address.city || "";
  document.getElementById("businessState").value = address.state || "";
  document.getElementById("businessZipCode").value = address.zipCode || "";
  document.getElementById("businessCountry").value = address.country || "USA";

  document.getElementById("status").value = business.status || "not-contacted";
  document.getElementById("priority").value = business.priority || "low";
  document.getElementById("notes").value = business.notes || "";

  const lastContactedInput = document.getElementById("lastContactedDate");
  const lastContactedDisplay = document.getElementById("lastContactedDisplay");

  if (business.lastContactedDate) {
    const fetchedDate = new Date(business.lastContactedDate);
    if (fetchedDate && !isNaN(fetchedDate.getTime())) {
      // convert utc date to local date at noon to avoid timezone issues
      const localDateForDisplay = new Date(
        fetchedDate.getUTCFullYear(),
        fetchedDate.getUTCMonth(),
        fetchedDate.getUTCDate(),
        12,
        0,
        0
      );

      const year = localDateForDisplay.getFullYear();
      const month = (localDateForDisplay.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const day = localDateForDisplay.getDate().toString().padStart(2, "0");

      lastContactedInput.value = `${year}-${month}-${day}`;
      lastContactedDisplay.textContent = Utils.formatDate(
        localDateForDisplay,
        window.dateFormat || "MM/DD/YYYY"
      );
    } else {
      console.error(
        "Invalid lastContactedDate received for business (editing):",
        business._id,
        business.lastContactedDate
      );
      lastContactedInput.value = "";
      lastContactedDisplay.textContent = "";
    }
  } else {
    lastContactedInput.value = "";
    lastContactedDisplay.textContent = "";
  }

  setupBusinessModalListeners();

  modal.style.display = "block";
}

function closeBusinessModal() {
  document.getElementById("businessModal").style.display = "none";
  document.getElementById("businessForm").reset();
  document.getElementById("businessId").value = "";
  document.getElementById("currentHitlistId").value = "";
}

async function deleteBusiness(businessId) {
  if (!confirm("Are you sure you want to delete this business?")) {
    return;
  }

  try {
    const hitlistId = currentHitlistId;

    await API.deleteBusiness(businessId);
    Utils.showToast("Business deleted successfully");

    if (hitlistId) {
      decrementHitlistBusinessCount(hitlistId);
      
      const hitlist = allHitlists.find((h) => h._id === hitlistId);
      if (hitlist) {
        hitlist.lastModified = new Date();
        updateHitlistLastModified(hitlistId);
      }
    }

    originalBusinesses = originalBusinesses.filter((b) => b._id !== businessId);
    currentBusinesses = currentBusinesses.filter((b) => b._id !== businessId);

    renderBusinesses(currentBusinesses);
  } catch (error) {
    console.error("Error deleting business:", error);
    Utils.showToast("Error deleting business");
  }
}

function decrementHitlistBusinessCount(hitlistId) {
  try {
    const hitlistCard = document.querySelector(
      `.hitlist-card[data-id="${hitlistId}"]`
    );
    if (!hitlistCard) return;

    const businessStat = hitlistCard.querySelector(".hitlist-stat:first-child");
    if (!businessStat) return;

    const hitlist = allHitlists.find((h) => h._id === hitlistId);
    if (!hitlist || !hitlist.businesses || hitlist.businesses.length === 0)
      return;

    hitlist.businesses.pop();

    businessStat.innerHTML = `<i class="fas fa-building"></i> ${hitlist.businesses.length} businesses`;
  } catch (error) {
    console.error("Error updating hitlist business count:", error);
  }
}

async function deleteHitlist(hitlistId) {
  if (
    !confirm(
      "Are you sure you want to delete this hitlist? All businesses in this hitlist will also be deleted."
    )
  ) {
    return;
  }

  try {
    await API.deleteHitlist(hitlistId);

    allHitlists = allHitlists.filter((h) => h._id !== hitlistId);

    Utils.showToast("Hitlist deleted successfully");

    // refresh the paginated view after deletion
    renderPaginatedHitlists();
  } catch (error) {
    console.error("Error deleting hitlist:", error);
    Utils.showToast("Error deleting hitlist");
  }
}

async function convertBusinessToLead(business) {
  try {
    const nameParts = (business.contactName || "").split(" ");

    // set current date to noon to avoid timezone issues
    const currentDate = new Date();
    currentDate.setHours(12, 0, 0, 0);

    const lastContactedAt = currentDate;

    const leadData = {
      firstName: nameParts[0] || "???",
      lastName: nameParts.slice(1).join(" ") || "???",
      email: business.businessEmail || "example@email.com",
      phone: business.businessPhone || "",
      phoneExt: business.businessPhoneExt || "",
      businessName: business.businessName,
      businessPhone: business.businessPhone || "",
      businessPhoneExt: business.businessPhoneExt || "",
      businessEmail: business.businessEmail || "",
      businessServices: business.typeOfBusiness || "",
      websiteAddress: business.websiteUrl || "",
      serviceDesired: "Web Development",
      hasWebsite: business.websiteUrl ? "yes" : "no",
      status: "contacted",
      notes: business.notes || "",
      lastContactedAt: lastContactedAt,
      source: `Converted from Hitlist: ${
        business.hitlistId || currentHitlistId
      }`,
      message: `Converted from business hitlist`,
      billingAddress: business.address
        ? {
            street: business.address.street || "",
            aptUnit: business.address.aptUnit || "",
            city: business.address.city || "",
            state: business.address.state || "",
            zipCode: business.address.zipCode || "",
            country: business.address.country || "",
          }
        : {},
    };

    if (!leadData.businessName) {
      Utils.showToast("Business Name is required for conversion.");
      return;
    }
    if (leadData.email === "Not specified" && !leadData.phone) {
      Utils.showToast("Either Email or Phone is required for conversion.");
      return;
    }

    const createdLead = await API.createLead(leadData);

    const businessUpdateData = {
      status: "converted",
      lastContactedDate: currentDate,
    };

    await API.updateBusiness(business._id, businessUpdateData);

    Utils.showToast(
      `Business "${business.businessName}" successfully converted to lead!`
    );

    const hitlistId = business.hitlistId || currentHitlistId;
    if (hitlistId) {
      setTimeout(() => {
        openBusinessListModal(hitlistId);
      }, 300);
    }
  } catch (error) {
    console.error("Error converting business to lead:", error);
    Utils.showToast(`Error converting business to lead: ${error.message}`);
  }
}

function mapBusinessStatusToLeadStatus(businessStatus) {
  // map business statuses to corresponding lead statuses
  switch (businessStatus) {
    case "not-contacted":
      return "new";
    case "contacted":
    case "follow-up":
      return "contacted";
    case "not-interested":
      return "closed-lost";
    case "converted":
      // button is disabled for converted businesses anyway
      return "contacted";
    default:
      return "new";
  }
}

function updateHitlistLastModified(hitlistId, newDate = new Date()) {
  const hitlistCard = document.querySelector(`.hitlist-card[data-id="${hitlistId}"]`);
  if (!hitlistCard) return;

  // find modified date element by checking text content
  const hitlistStats = hitlistCard.querySelectorAll('.hitlist-stat');
  let modifiedDateElement = null;
  
  for (const stat of hitlistStats) {
    if (stat.textContent.includes('Modified:')) {
      modifiedDateElement = stat;
      break;
    }
  }
  
  if (!modifiedDateElement) return;
  
  const dateFormat = window.dateFormat || "MM/DD/YYYY";
  
  modifiedDateElement.innerHTML = `<i class="far fa-clock"></i> Modified: ${Utils.formatDate(newDate, dateFormat)}`;
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// removed the old filterHitlists function - now handled by searchHitlists and getFilteredHitlists

function filterBusinesses() {
  const searchTerm = document
    .getElementById("businessSearchInput")
    .value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;

  // always filter from original list to avoid compound filtering issues
  currentBusinesses = originalBusinesses.filter((business) => {
    const matchesSearch =
      (business.businessName &&
        business.businessName.toLowerCase().includes(searchTerm)) ||
      (business.contactName &&
        business.contactName.toLowerCase().includes(searchTerm)) ||
      (business.businessEmail &&
        business.businessEmail.toLowerCase().includes(searchTerm)) ||
      (business.businessPhone &&
        business.businessPhone.toLowerCase().includes(searchTerm)) ||
      (business.notes && business.notes.toLowerCase().includes(searchTerm)) ||
      (business.typeOfBusiness &&
        business.typeOfBusiness.toLowerCase().includes(searchTerm));

    const matchesStatus = !statusFilter || business.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  currentBusinesses = sortBusinessesAlphabetically(currentBusinesses);
  renderBusinesses(currentBusinesses);
}

function initializePhoneInputs() {
  const businessPhoneInput = document.getElementById("businessPhone");
  if (businessPhoneInput) {
    new Cleave(businessPhoneInput, {
      delimiters: ["-", "-"],
      blocks: [3, 3, 4],
      numericOnly: true,
    });
  }
}

function setupBusinessModalListeners() {
  const businessForm = document.getElementById("businessForm");
  if (businessForm && !businessForm.dataset.listenerAttached) {
    businessForm.addEventListener("submit", handleBusinessSubmit);
    businessForm.dataset.listenerAttached = "true";
  }

  const hasWebsiteSelect = document.getElementById("hasWebsite");
  const websiteUrlGroup = document.getElementById("websiteUrlGroup");

  if (
    hasWebsiteSelect &&
    websiteUrlGroup &&
    !hasWebsiteSelect.dataset.listenerAttached
  ) {
    hasWebsiteSelect.addEventListener("change", function () {
      websiteUrlGroup.style.display = this.value === "true" ? "block" : "none";
    });
    hasWebsiteSelect.dataset.listenerAttached = "true";
    hasWebsiteSelect.dispatchEvent(new Event("change"));
  }

  initializeDateInputs();

  initializePhoneInputs();

  const closeBusinessModalButton =
    document.getElementById("closeBusinessModal");
  const cancelBusinessButton = document.getElementById("cancelBusinessBtn");

  if (
    closeBusinessModalButton &&
    !closeBusinessModalButton.dataset.listenerAttached
  ) {
    closeBusinessModalButton.addEventListener("click", closeBusinessModal);
    closeBusinessModalButton.dataset.listenerAttached = "true";
  }
  if (cancelBusinessButton && !cancelBusinessButton.dataset.listenerAttached) {
    cancelBusinessButton.addEventListener("click", closeBusinessModal);
    cancelBusinessButton.dataset.listenerAttached = "true";
  }
}

function setupImportExportButtons() {
  const businessActionsContainer = document.querySelector(
    ".business-actions-container"
  );
  if (!businessActionsContainer) return;

  // Create import button
  const importBtn = document.createElement("button");
  importBtn.id = "importBtn";
  importBtn.className = "btn btn-info";
  importBtn.innerHTML = '<i class="fas fa-file-import"></i> Import Data';

  // Create export button
  const exportBtn = document.createElement("button");
  exportBtn.id = "exportBtn";
  exportBtn.className = "btn btn-danger";
  exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Export Hitlist';

  businessActionsContainer.appendChild(importBtn);
  businessActionsContainer.appendChild(exportBtn);

  // Create file input for import
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "dataFileInput";
  fileInput.accept = ".json,.csv";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  importBtn.addEventListener("click", function () {
    fileInput.click();
  });

  exportBtn.addEventListener("click", function () {
    showExportModal();
  });

  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (fileExtension !== 'json' && fileExtension !== 'csv') {
      Utils.showToast(
        "Invalid file type. Please select a JSON or CSV file."
      );
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        let businessData;
        
        if (fileExtension === 'json') {
          businessData = JSON.parse(e.target.result);
          
          if (!Array.isArray(businessData)) {
            Utils.showToast(
              "Invalid JSON format: File must contain an array of businesses"
            );
            return;
          }
        } else if (fileExtension === 'csv') {
          businessData = parseCSV(e.target.result);
        }

        await processImportedBusinesses(businessData);

        fileInput.value = "";
      } catch (error) {
        console.error("Error processing file:", error);
        Utils.showToast("Error processing file: " + error.message);
      }
    };

    reader.readAsText(file);
  });
}

// better approach - refresh the entire hitlist after import
async function refreshHitlistAfterImport(hitlistId) {
  try {
    // fetch updated hitlist data
    const updatedHitlist = await API.fetchHitlistById(hitlistId);
    
    // update the hitlist in the allHitlists array
    const hitlistIndex = allHitlists.findIndex(h => h._id === hitlistId);
    if (hitlistIndex !== -1) {
      allHitlists[hitlistIndex] = updatedHitlist;
    }
    
    // re-render the hitlists to show updated count
    renderPaginatedHitlists();
    
  } catch (error) {
    console.error("Error refreshing hitlist after import:", error);
  }
}

function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const businesses = [];

  // Expected CSV headers (case insensitive)
  const headerMap = {
    'business name': 'businessName',
    'businessname': 'businessName', 
    'name': 'businessName',
    'business type': 'businessType',
    'businesstype': 'businessType',
    'type': 'businessType',
    'phone': 'phone',
    'business phone': 'phone',
    'businessphone': 'phone',
    'email': 'businessEmail',
    'business email': 'businessEmail',
    'businessemail': 'businessEmail',
    'website': 'website',
    'website url': 'website',
    'websiteurl': 'website',
    'url': 'website',
    'address': 'streetAddress',
    'street address': 'streetAddress',
    'streetaddress': 'streetAddress',
    'street': 'streetAddress',
    'city': 'city',
    'state': 'state',
    'zip': 'zipCode',
    'zipcode': 'zipCode',
    'zip code': 'zipCode',
    'postal code': 'zipCode'
  };

  // Map headers to expected field names
  const mappedHeaders = headers.map(header => {
    const normalizedHeader = header.toLowerCase();
    return headerMap[normalizedHeader] || header;
  });

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const business = {};
    
    for (let j = 0; j < Math.min(headers.length, values.length); j++) {
      const fieldName = mappedHeaders[j];
      const value = values[j] ? values[j].trim() : '';
      
      if (value) {
        business[fieldName] = value;
      }
    }

    if (business.businessName) {
      businesses.push(business);
    }
  }

  if (businesses.length === 0) {
    throw new Error('No valid business data found in CSV file');
  }

  return businesses;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result.map(field => field.replace(/^"|"$/g, ''));
}

function showExportModal() {
  if (!currentHitlistId) {
    Utils.showToast("Please select a hitlist first");
    return;
  }

  const modalHTML = `
    <div id="exportModal" class="modal" style="display: block;">
      <div class="modal-content">
        <span class="close-modal" id="closeExportModal">&times;</span>
        <div class="modal-header">
          <h3>Export Hitlist</h3>
        </div>
        <div class="modal-actions">
          <button id="exportJsonBtn" class="btn btn-outline">
            <i class="fas fa-file-code"></i> Export as JSON
          </button>
          <button id="exportCsvBtn" class="btn btn-primary">
            <i class="fas fa-file-csv"></i> Export as CSV
          </button>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('exportModal');
  if (existingModal) {
    existingModal.remove();
  }

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Setup event listeners
  document.getElementById('closeExportModal').addEventListener('click', closeExportModal);
  document.getElementById('exportJsonBtn').addEventListener('click', () => exportHitlist('json'));
  document.getElementById('exportCsvBtn').addEventListener('click', () => exportHitlist('csv'));

  // Close modal when clicking outside
  document.getElementById('exportModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeExportModal();
    }
  });
}

function closeExportModal() {
  const modal = document.getElementById('exportModal');
  if (modal) {
    modal.remove();
  }
}

async function exportHitlist(format) {
  if (!currentHitlistId) {
    Utils.showToast("No hitlist selected");
    return;
  }

  try {
    const hitlist = allHitlists.find(h => h._id === currentHitlistId);
    const businesses = originalBusinesses || currentBusinesses || [];
    
    if (businesses.length === 0) {
      Utils.showToast("No businesses to export");
      return;
    }

    const fileName = `${hitlist ? hitlist.name.replace(/[^a-z0-9]/gi, '_') : 'hitlist'}_export_${Utils.getLocalDateString()}`;
    
    if (format === 'json') {
      exportAsJSON(businesses, fileName);
    } else if (format === 'csv') {
      exportAsCSV(businesses, fileName);
    }

    closeExportModal();
    Utils.showToast(`Hitlist exported as ${format.toUpperCase()} successfully`);
  } catch (error) {
    console.error('Error exporting hitlist:', error);
    Utils.showToast('Error exporting hitlist: ' + error.message);
  }
}

function exportAsJSON(businesses, fileName) {
  const exportData = businesses.map(business => ({
    businessName: business.businessName || '',
    businessType: business.typeOfBusiness || '',
    contactName: business.contactName || '',
    phone: business.businessPhone || '',
    phoneExt: business.businessPhoneExt || '',
    businessEmail: business.businessEmail || '',
    website: business.websiteUrl || '',
    streetAddress: business.address?.street || '',
    aptUnit: business.address?.aptUnit || '',
    city: business.address?.city || '',
    state: business.address?.state || '',
    zipCode: business.address?.zipCode || '',
    country: business.address?.country || '',
    status: business.status || '',
    priority: business.priority || '',
    lastContactedDate: business.lastContactedDate || '',
    notes: business.notes || ''
  }));

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  downloadFile(blob, `${fileName}.json`);
}

function exportAsCSV(businesses, fileName) {
  const headers = [
    'Business Name',
    'Business Type', 
    'Contact Name',
    'Phone',
    'Phone Ext',
    'Email',
    'Website',
    'Street Address',
    'Apt/Unit',
    'City',
    'State',
    'ZIP Code',
    'Country',
    'Status',
    'Priority',
    'Last Contacted',
    'Notes'
  ];

  const csvRows = [headers.join(',')];

  businesses.forEach(business => {
    const row = [
      escapeCSVField(business.businessName || ''),
      escapeCSVField(business.typeOfBusiness || ''),
      escapeCSVField(business.contactName || ''),
      escapeCSVField(business.businessPhone || ''),
      escapeCSVField(business.businessPhoneExt || ''),
      escapeCSVField(business.businessEmail || ''),
      escapeCSVField(business.websiteUrl || ''),
      escapeCSVField(business.address?.street || ''),
      escapeCSVField(business.address?.aptUnit || ''),
      escapeCSVField(business.address?.city || ''),
      escapeCSVField(business.address?.state || ''),
      escapeCSVField(business.address?.zipCode || ''),
      escapeCSVField(business.address?.country || ''),
      escapeCSVField(business.status || ''),
      escapeCSVField(business.priority || ''),
      escapeCSVField(business.lastContactedDate ? new Date(business.lastContactedDate).toLocaleDateString() : ''),
      escapeCSVField(business.notes || '')
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadFile(blob, `${fileName}.csv`);
}

function escapeCSVField(field) {
  if (typeof field !== 'string') {
    field = String(field);
  }
  
  // If field contains comma, newline, or double quote, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

function downloadFile(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Conservative duplicate detection - only flags as duplicate if ALL fields match exactly
function isDuplicateBusiness(newBusiness, existingBusinesses) {
  const normalizeString = (str) => (str || "").toLowerCase().trim();
  const normalizePhone = (phone) => (phone || "").replace(/\D/g, "");
  const normalizeEmail = (email) => (email || "").toLowerCase().trim();
  
  // Build normalized address for new business
  const newAddress = {
    street: normalizeString(newBusiness.address?.street || ""),
    city: normalizeString(newBusiness.address?.city || ""),
    state: normalizeString(newBusiness.address?.state || ""),
    zipCode: normalizeString(newBusiness.address?.zipCode || "")
  };
  
  const newName = normalizeString(newBusiness.businessName);
  const newPhone = normalizePhone(newBusiness.businessPhone);
  const newEmail = normalizeEmail(newBusiness.businessEmail);
  
  return existingBusinesses.some(existing => {
    // Build normalized address for existing business
    const existingAddress = {
      street: normalizeString(existing.address?.street || ""),
      city: normalizeString(existing.address?.city || ""),
      state: normalizeString(existing.address?.state || ""),
      zipCode: normalizeString(existing.address?.zipCode || "")
    };
    
    const existingName = normalizeString(existing.businessName);
    const existingPhone = normalizePhone(existing.businessPhone);
    const existingEmail = normalizeEmail(existing.businessEmail);
    
    // Must match business name
    if (newName !== existingName) return false;
    
    // If both have phone numbers, they must match
    if (newPhone && existingPhone && newPhone !== existingPhone) return false;
    
    // If both have email addresses, they must match
    if (newEmail && existingEmail && newEmail !== existingEmail) return false;
    
    // If both have complete addresses, they must match
    const newHasFullAddress = newAddress.street && newAddress.city && newAddress.state;
    const existingHasFullAddress = existingAddress.street && existingAddress.city && existingAddress.state;
    
    if (newHasFullAddress && existingHasFullAddress) {
      if (newAddress.street !== existingAddress.street ||
          newAddress.city !== existingAddress.city ||
          newAddress.state !== existingAddress.state ||
          newAddress.zipCode !== existingAddress.zipCode) {
        return false;
      }
    }
    
    // If we get here, it's a potential duplicate
    return true;
  });
}

async function processImportedBusinesses(businesses) {
  if (!currentHitlistId) {
    Utils.showToast("Please select a hitlist first");
    return;
  }

  try {
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    let processingCount = 0;
    const totalBusinesses = businesses.length;
    const batchSize = 100; // process in batches to handle rate limits
    const delayBetweenBatches = 5000;

    const businessesList = document.getElementById("businessesList");
    if (businessesList) {
      businessesList.innerHTML = `
        <div class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i> Checking for duplicates and importing businesses...
        </div>
        <div class="upload-progress-container">
          <div class="upload-progress">
            <div class="upload-progress-bar" style="width: 0%"></div>
          </div>
          <div class="upload-status">Processed 0 of ${totalBusinesses} businesses</div>
        </div>`;
    }

    // Fetch existing businesses to check for duplicates
    const existingBusinesses = await API.fetchBusinessesByHitlist(currentHitlistId);
    console.log(`Found ${existingBusinesses.length} existing businesses in hitlist for duplicate checking`);

    // process businesses in batches
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      for (const scrapedBusiness of batch) {
        try {
          let phone = scrapedBusiness.phone || "";
          phone = phone.replace(/\D/g, "");
          if (phone && phone.length >= 10) {
            phone = formatPhoneNumber(phone);
          }

          let phoneExt = "";
          if (scrapedBusiness.phone) {
            const extMatch = scrapedBusiness.phone.match(
              /(?:\s+ext\.?|\s+x)(\s*\d+)$/i
            );
            if (extMatch && extMatch[1]) {
              phoneExt = extMatch[1].trim();
            }
          }

          let websiteUrl = scrapedBusiness.website || "";
          if (websiteUrl && !websiteUrl.startsWith("http")) {
            websiteUrl = "https://" + websiteUrl;
          }

          const businessData = {
            businessName: scrapedBusiness.businessName || "",
            typeOfBusiness: scrapedBusiness.businessType || "",
            contactName: "", // scraped data typically doesn't include contact names
            businessPhone: phone,
            businessPhoneExt: phoneExt || "",
            businessEmail: scrapedBusiness.businessEmail || "",
            websiteUrl: websiteUrl,
            address: {
              street: scrapedBusiness.streetAddress || "",
              aptUnit: "",
              city: scrapedBusiness.city || "",
              state: scrapedBusiness.state || "",
              zipCode: scrapedBusiness.zipCode || "",
              country: "USA",
            },
            status: "not-contacted",
            priority: "low",
            notes: `Imported from JSON on ${new Date().toLocaleDateString()}`,
          };

          // Check for duplicates before creating
          if (isDuplicateBusiness(businessData, existingBusinesses)) {
            console.log(`Skipping duplicate business: ${businessData.businessName}`);
            duplicateCount++;
          } else {
            await API.createBusiness(currentHitlistId, businessData);
            successCount++;
            
            // Add the newly created business to our existing list to check against future imports
            existingBusinesses.push(businessData);
          }

          processingCount++;
          updateImportProgress(
            processingCount,
            totalBusinesses,
            successCount,
            errorCount,
            duplicateCount
          );
        } catch (error) {
          console.error("Error importing business:", error);
          errorCount++;

          processingCount++;
          updateImportProgress(
            processingCount,
            totalBusinesses,
            successCount,
            errorCount,
            duplicateCount
          );

          // wait longer if we hit quota limits
          if (error.message && error.message.includes("quota")) {
            await new Promise((resolve) => setTimeout(resolve, 10000));
          }
        }
      }

      // wait between batches to avoid rate limits
      if (i + batchSize < businesses.length) {
        const statusText = document.querySelector(".upload-status");
        if (statusText) {
          const originalText = statusText.textContent;
          statusText.textContent = `Processed ${processingCount} of ${totalBusinesses} businesses - Waiting for rate limits...`;

          await new Promise((resolve) =>
            setTimeout(resolve, delayBetweenBatches)
          );

          statusText.textContent = originalText;
        } else {
          await new Promise((resolve) =>
            setTimeout(resolve, delayBetweenBatches)
          );
        }
      }
    }

    // after all businesses are imported, refresh the hitlist data
    await refreshHitlistAfterImport(currentHitlistId);
    
    // then update the business list in the modal
    const updatedBusinesses = await API.fetchBusinessesByHitlist(currentHitlistId);
    const sortedBusinesses = sortBusinessesAlphabetically(updatedBusinesses);
    originalBusinesses = [...sortedBusinesses];
    currentBusinesses = [...sortedBusinesses];
    renderBusinesses(currentBusinesses);

    Utils.showToast(
      `Import complete: ${successCount} businesses added, ${duplicateCount} duplicates skipped, ${errorCount} failed`
    );
  } catch (error) {
    console.error("Error processing businesses:", error);
    Utils.showToast("Error processing businesses: " + error.message);
  }
}

function updateImportProgress(current, total, successes, errors, duplicates = 0) {
  const progressBar = document.querySelector(".upload-progress-bar");
  const statusText = document.querySelector(".upload-status");

  if (progressBar && statusText) {
    const percentage = Math.round((current / total) * 100);
    progressBar.style.width = `${percentage}%`;
    statusText.textContent = `Processed ${current} of ${total} businesses (${successes} succeeded, ${duplicates} duplicates skipped, ${errors} failed)`;
  }
}

function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "";

  const cleaned = ("" + phoneNumber).replace(/\D/g, "");

  if (cleaned.length >= 10) {
    return (
      cleaned.substring(0, 3) +
      "-" +
      cleaned.substring(3, 6) +
      "-" +
      cleaned.substring(6, 10)
    );
  }

  return phoneNumber;
}

// sorts hitlists alphabetically by name
function sortHitlistsAlphabetically(hitlists) {
  if (!hitlists || !Array.isArray(hitlists) || hitlists.length === 0) {
    return hitlists;
  }

  return [...hitlists].sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

// sorts businesses alphabetically by business name
function sortBusinessesAlphabetically(businesses) {
  if (!businesses || !Array.isArray(businesses) || businesses.length === 0) {
    return businesses;
  }

  return [...businesses].sort((a, b) => {
    const nameA = (a.businessName || "").toLowerCase();
    const nameB = (b.businessName || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
}


async function handleBusinessSubmit(event) {
  event.preventDefault();

  const businessId = document.getElementById("businessId").value;
  const hitlistId = document.getElementById("currentHitlistId").value;

  if (!hitlistId) {
    console.error("Cannot save business: No hitlist ID found.");
    Utils.showToast("Error saving business: No hitlist selected.");
    return;
  }

  const contactFirstName = document
    .getElementById("contactFirstName")
    .value.trim();
  const contactLastName = document
    .getElementById("contactLastName")
    .value.trim();
  const contactName =
    contactFirstName || contactLastName
      ? `${contactFirstName} ${contactLastName}`.trim()
      : "";

  let businessPhone = document.getElementById("businessPhone").value.trim();
  let businessPhoneExt = document
    .getElementById("businessPhoneExt")
    .value.trim();

  let websiteUrl = document.getElementById("websiteUrl").value.trim();
  if (
    websiteUrl &&
    !websiteUrl.startsWith("http://") &&
    !websiteUrl.startsWith("https://")
  ) {
    websiteUrl = "https://" + websiteUrl;
  }

  const businessData = {
    businessName: document.getElementById("businessName").value.trim(),
    typeOfBusiness: document.getElementById("typeOfBusiness").value.trim(),
    contactName: contactName,
    businessPhone: businessPhone,
    businessPhoneExt: businessPhoneExt,
    businessEmail: document.getElementById("businessEmail").value.trim() || "",
    websiteUrl: websiteUrl,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    notes: document.getElementById("notes").value.trim(),
    hitlistId: hitlistId,
    address: {
      street: document.getElementById("businessStreet").value.trim(),
      aptUnit: document.getElementById("businessAptUnit").value.trim(),
      city: document.getElementById("businessCity").value.trim(),
      state: document.getElementById("businessState").value.trim(),
      zipCode: document.getElementById("businessZipCode").value.trim(),
      country: document.getElementById("businessCountry").value.trim(),
    },
  };

  const lastContactedDateValue =
    document.getElementById("lastContactedDate").value;

  let lastContactedISO = null;
  if (lastContactedDateValue) {
    const date = new Date(lastContactedDateValue + "T12:00:00"); // treat as local noon to avoid timezone issues
    if (date && !isNaN(date.getTime())) {
      lastContactedISO = date.toISOString();
    } else {
      console.warn(
        "Invalid lastContactedDate value from input:",
        lastContactedDateValue
      );
    }
  }
  businessData.lastContactedDate = lastContactedISO;

  try {
    let savedBusiness;

    if (businessId) {
      savedBusiness = await API.updateBusiness(businessId, businessData);
      Utils.showToast("Business updated successfully");

      const businessIndex = currentBusinesses.findIndex(
        (b) => b._id === businessId
      );
      if (businessIndex !== -1) {
        currentBusinesses[businessIndex] = savedBusiness;
      }

      const originalIndex = originalBusinesses.findIndex(
        (b) => b._id === businessId
      );
      if (originalIndex !== -1) {
        originalBusinesses[originalIndex] = savedBusiness;
      }
    } else {
      savedBusiness = await API.createBusiness(hitlistId, businessData);
      Utils.showToast("Business added successfully");

      currentBusinesses.push(savedBusiness);
      originalBusinesses.push(savedBusiness);

      currentBusinesses = sortBusinessesAlphabetically(currentBusinesses);
      originalBusinesses = sortBusinessesAlphabetically(originalBusinesses);

      // Use the fixed function to update hitlist business count
      await updateHitlistBusinessCount(hitlistId);
    }

    // update lastModified date for the hitlist
    const hitlist = allHitlists.find((h) => h._id === hitlistId);
    if (hitlist) {
      hitlist.lastModified = new Date();
      updateHitlistLastModified(hitlistId);
    }

    closeBusinessModal();
    filterBusinesses();
  } catch (error) {
    console.error("Error saving business:", error);
    Utils.showToast("Error saving business");
  }
}

async function updateHitlistBusinessCount(hitlistId, addedCount = 1) {
  try {
    const hitlistCard = document.querySelector(
      `.hitlist-card[data-id="${hitlistId}"]`
    );
    if (!hitlistCard) return;

    const businessStat = hitlistCard.querySelector(".hitlist-stat:first-child");
    if (!businessStat) return;

    const hitlist = allHitlists.find((h) => h._id === hitlistId);
    if (!hitlist) return;

    // get the current count from the actual businesses data
    try {
      const actualBusinesses = await API.fetchBusinessesByHitlist(hitlistId);
      const actualCount = actualBusinesses ? actualBusinesses.length : 0;
      
      // update the UI with the actual count
      businessStat.innerHTML = `<i class="far fa-building"></i> ${actualCount} businesses`;
      
      // update the hitlist object in memory
      hitlist.businesses = actualBusinesses || [];
      
    } catch (error) {
      console.error("Error fetching actual business count:", error);
      
      // fallback estimate the count
      if (!hitlist.businesses) {
        hitlist.businesses = [];
      }
      const estimatedCount = hitlist.businesses.length + addedCount;
      businessStat.innerHTML = `<i class="far fa-building"></i> ${estimatedCount} businesses`;
    }

  } catch (error) {
    console.error("Error updating hitlist business count:", error);
  }
}

function renderBusinesses(businesses) {
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  const businessesList = document.getElementById("businessesList");

  if (!businessesList) {
    console.error("Businesses list container not found");
    return;
  }

  if (!businesses || businesses.length === 0) {
    businessesList.innerHTML =
      '<div class="no-businesses-message">No businesses found with current filters. Try adjusting your search criteria.</div>';
    return;
  }

  businessesList.innerHTML = businesses
    .map((business) => {
      let displayPhone = business.businessPhone || "";
      if (displayPhone && !displayPhone.includes("-")) {
        displayPhone = formatPhoneNumber(displayPhone);
      }

      if (business.businessPhoneExt) {
        displayPhone += ` Ext: ${business.businessPhoneExt}`;
      }

      let displayWebsite = "";
      let fullWebsiteUrl = "";

      if (business.websiteUrl) {
        fullWebsiteUrl = business.websiteUrl;
        if (
          !fullWebsiteUrl.startsWith("http://") &&
          !fullWebsiteUrl.startsWith("https://")
        ) {
          fullWebsiteUrl = "https://" + fullWebsiteUrl;
        }

        try {
          const urlObj = new URL(fullWebsiteUrl);
          displayWebsite = urlObj.hostname;
        } catch (error) {
          displayWebsite = business.websiteUrl;
        }
      }

      const address = business.address || {};
      let addressForMap = "";
      if (address.street) {
        addressForMap += address.street;
        if (address.aptUnit) addressForMap += ` ${address.aptUnit}`;
        if (address.city) addressForMap += `, ${address.city}`;
        if (address.state) addressForMap += `, ${address.state}`;
        if (address.zipCode) addressForMap += ` ${address.zipCode}`;
      }

      return `
  <div class="business-item ${
    business.status === "converted" ? "converted" : ""
  }" data-id="${business._id}">
    <div class="business-info">
      <div class="business-header">
        <span class="business-title">${business.businessName}</span>
        <span class="status-badge status-${business.status}">${formatStatus(
        business.status
      )}</span>
        <span class="priority-badge priority-${business.priority}">${
        business.priority
      }</span>
      </div>
      <div class="business-details">
        ${
          business.contactName
            ? `<div class="business-detail"><i class="fas fa-user"></i> ${business.contactName}</div>`
            : ""
        }
        ${
          displayPhone
            ? `<div class="business-detail"><i class="fas fa-phone"></i> ${displayPhone}</div>`
            : ""
        }
        ${
          business.businessEmail
            ? `<div class="business-detail"><i class="fas fa-envelope"></i> ${business.businessEmail}</div>`
            : ""
        }
        ${
          business.websiteUrl
            ? `<div class="business-detail"><i class="fas fa-globe"></i> <a href="${fullWebsiteUrl}" target="_blank">${displayWebsite}</a></div>`
            : ""
        }
        ${
          addressForMap
            ? `<div class="business-detail">
                <i class="fas fa-map-marker-alt"></i> 
                <a href="https://maps.google.com/?q=${encodeURIComponent(
                  addressForMap
                )}" 
                   target="_blank">View on Map</a>
              </div>`
            : ""
        }
        ${
          business.lastContactedDate
            ? `
          <div class="business-detail"><i class="fas fas fa-clock"></i> Last contact: ${(() => {
            const fetchedDate = new Date(business.lastContactedDate);
            if (fetchedDate && !isNaN(fetchedDate.getTime())) {
              // create local date at noon to avoid timezone issues
              const localDateForDisplay = new Date(
                fetchedDate.getUTCFullYear(),
                fetchedDate.getUTCMonth(),
                fetchedDate.getUTCDate(),
                12,
                0,
                0
              );
              return Utils.formatDate(localDateForDisplay, dateFormat);
            } else {
              console.error(
                "Invalid lastContactedDate for business ID",
                business._id,
                ":",
                business.lastContactedDate
              );
              return "N/A";
            }
          })()}</div>
        `
            : ""
        }
      </div>
    </div>
    <div class="business-actions">
      <button class="btn-icon view-business" title="View Business Details">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn-icon edit-business" title="Edit">
        <i class="fas fa-edit"></i>
      </button>
      ${
        business.status !== "converted"
          ? `<button class="btn-icon convert-to-lead" title="Convert to Lead">
          <i class="fas fa-user-plus"></i>
        </button>`
          : `<button class="btn-icon" disabled title="Already Converted" style="cursor: not-allowed; opacity: 0.5;">
          <i class="fas fa-check"></i>
        </button>`
      }
      <button class="btn-icon delete-business" title="Delete">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
`;
    })
    .join("");

  attachBusinessActionListeners(businesses);
}

function openViewBusinessModal(business) {
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  document.getElementById("viewBusinessName").textContent =
    business.businessName || "N/A";
  document.getElementById("viewTypeOfBusiness").textContent =
    business.typeOfBusiness || "N/A";

  const nameParts = (business.contactName || "").split(" ");
  document.getElementById("viewContactFirstName").textContent =
    nameParts[0] || "N/A";
  document.getElementById("viewContactLastName").textContent =
    nameParts.slice(1).join(" ") || "N/A";

  let displayPhone = business.businessPhone || "N/A";
  if (displayPhone !== "N/A" && !displayPhone.includes("-")) {
    displayPhone = formatPhoneNumber(displayPhone);
  }
  document.getElementById("viewBusinessPhone").textContent = displayPhone;

  document.getElementById("viewBusinessPhoneExt").textContent =
    business.businessPhoneExt ? `Ext: ${business.businessPhoneExt}` : "";

  document.getElementById("viewBusinessEmail").textContent =
    business.businessEmail || "N/A";

  const address = business.address || {};
  document.getElementById("viewBusinessStreet").textContent =
    address.street || "N/A";
  document.getElementById("viewBusinessAptUnit").textContent =
    address.aptUnit || "N/A";
  document.getElementById("viewBusinessCity").textContent =
    address.city || "N/A";
  document.getElementById("viewBusinessState").textContent =
    address.state || "N/A";
  document.getElementById("viewBusinessZipCode").textContent =
    address.zipCode || "N/A";
  document.getElementById("viewBusinessCountry").textContent =
    address.country || "N/A";

  if (business.websiteUrl) {
    document.getElementById("viewWebsiteUrlText").textContent =
      business.websiteUrl;

    let fullUrl = business.websiteUrl;
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = `https://${fullUrl}`;
    }

    const websiteLinkHtml = `
      <div class="website-link-container">
        <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="website-link">
          <i class="fas fa-external-link-alt"></i> Visit Website
        </a>
      </div>
    `;

    document.getElementById("viewWebsiteUrl").innerHTML = websiteLinkHtml;
  } else {
    document.getElementById("viewWebsiteUrlText").textContent = "N/A";
    document.getElementById("viewWebsiteUrl").textContent = "";
  }

  if (address.street && address.city) {
    let fullAddress = address.street;
    if (address.aptUnit) fullAddress += ` ${address.aptUnit}`;
    if (address.city) fullAddress += `, ${address.city}`;
    if (address.state) fullAddress += `, ${address.state}`;
    if (address.zipCode) fullAddress += ` ${address.zipCode}`;

    const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(
      fullAddress
    )}`;

    const viewBusinessStreet = document.getElementById("viewBusinessStreet");
    let addressContainer = null;

    if (viewBusinessStreet) {
      addressContainer =
        viewBusinessStreet.closest(".form-section") ||
        viewBusinessStreet.closest(".form-group") ||
        viewBusinessStreet.parentElement.parentElement;
    }

    if (addressContainer) {
      const existingLink = document.getElementById("businessViewMapLink");
      if (existingLink) existingLink.remove();

      const mapLinkContainer = document.createElement("div");
      mapLinkContainer.id = "businessViewMapLink";
      mapLinkContainer.className = "business-map-link";
      mapLinkContainer.style.marginTop = "1rem";
      mapLinkContainer.style.textAlign = "right";

      mapLinkContainer.innerHTML = `
        <a href="${mapUrl}" target="_blank" class="btn btn-outline map-button">
          <i class="fas fa-map-marker-alt"></i><span class="map-text">View on Google Maps</span>
        </a>
      `;

      addressContainer.appendChild(mapLinkContainer);
    }
  }

  document.getElementById("viewStatus").textContent = formatStatus(
    business.status
  );
  document.getElementById("viewPriority").textContent = business.priority;

  const lastContactedDisplayDate = business.lastContactedDate
    ? new Date(business.lastContactedDate)
    : null;

  let formattedLastContacted = "N/A";

  if (lastContactedDisplayDate && !isNaN(lastContactedDisplayDate.getTime())) {
    // use utc components to create local date at noon 
    const localDateForDisplay = new Date(
      lastContactedDisplayDate.getUTCFullYear(),
      lastContactedDisplayDate.getUTCMonth(),
      lastContactedDisplayDate.getUTCDate(),
      12,
      0,
      0
    );
    formattedLastContacted = Utils.formatDate(localDateForDisplay, dateFormat);
  } else if (business.lastContactedDate) {
    console.error(
      "Invalid lastContactedDate received for business (viewing):",
      business._id,
      business.lastContactedDate
    );
  }

  document.getElementById("viewLastContactedDate").textContent =
    formattedLastContacted;

  document.getElementById("viewNotes").textContent = business.notes || "N/A";

  document.getElementById("businessViewModal").style.display = "block";
}

function initializeDateInputs() {
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  const lastContactedInput = document.getElementById("lastContactedDate");
  const lastContactedDisplay = document.getElementById("lastContactedDisplay");

  if (
    lastContactedInput &&
    lastContactedDisplay &&
    !lastContactedInput.dataset.listenerAttached
  ) {
    lastContactedInput.addEventListener("change", function () {
      if (this.value) {
        const [year, month, day] = this.value.split("-").map(Number);
        // create local date at noon to avoid timezone issues
        const date = new Date(year, month - 1, day, 12, 0, 0);

        if (date && !isNaN(date.getTime())) {
          const displayElement = document.getElementById(
            "lastContactedDisplay"
          );
          if (displayElement) {
            displayElement.textContent = Utils.formatDate(date, dateFormat);
          }
        } else {
          console.error("Invalid date input value:", this.value);
          lastContactedDisplay.textContent = "";
        }
      } else {
        lastContactedDisplay.textContent = "";
      }
    });
    lastContactedInput.dataset.listenerAttached = "true";
  }
}

// Expose functions to window for non-module scripts
window.openBusinessListModal = openBusinessListModal;
window.refreshHitlistAfterImport = refreshHitlistAfterImport;
window.fetchAndRenderHitlists = fetchAndRenderHitlists;
window.exportHitlist = exportHitlist;
window.parseCSV = parseCSV;
window.showExportModal = showExportModal;

export {
  setupSidebarToggle,
  setupEventListeners,
  fetchAndRenderHitlists,
  renderHitlists,
  renderPaginatedHitlists,
  openBusinessListModal,
  openAddBusinessModal,
  convertBusinessToLead,
  openEditBusinessModal,
  openViewBusinessModal,
  sortHitlistsAlphabetically,
  sortBusinessesAlphabetically,
  searchHitlists,
  getFilteredHitlists,
  refreshHitlistAfterImport,
};