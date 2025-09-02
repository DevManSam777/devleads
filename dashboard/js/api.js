import { authApi } from "./authApi.js";

// function to determine the appropriate API URL based on the environment
function getApiUrl() {
  // check if we're running locally or on the production server
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // for local development, use the local API
    return "http://localhost:5000/api";
  } else {
    // for production (Render or other host), use relative URL
    return "/api";
  }
}

// set the API_URL based on the environment
const API_URL = getApiUrl();

// helper function to get base URL (also environment-aware)
function getBaseUrl() {
  // check if we're running locally (localhost) or on the production server
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // for local development
    return "http://localhost:5000";
  } else {
    // or production, use current origin
    return window.location.origin;
  }
}

// fetch all leads from the API
async function fetchLeads() {
  try {
    console.log("Fetching leads from:", API_URL + "/leads");
    const data = await authApi.get("/leads");
    console.log("Fetched leads data:", data);

    // make sure data is an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received");
    }

    return data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
}

// fetch a specific lead by ID
async function fetchLeadById(leadId) {
  try {
    const data = await authApi.get(`/leads/${leadId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching lead ${leadId}:`, error);
    throw error;
  }
}

// create a new lead
async function createLead(leadData) {
  try {
    const data = await authApi.post("/leads", leadData);
    return data;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
}

// in api.js, check if the update function is actually sending the data:
async function updateLead(leadId, leadData) {
  try {
    // debug the data before sending
    console.log("Sending lead update data:", leadData);

    const data = await fetch(`${API_URL}/leads/${leadId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    }).then((response) => response.json());

    return data;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
}


// delete a lead with retry logic
async function deleteLead(leadId, retries = 3) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }
    const token = await user.getIdToken();

    const response = await fetch(`${API_URL}/leads/${leadId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete lead");
    }

    return true;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying deleteLead... Attempts left: ${retries - 1}`);
      return deleteLead(leadId, retries - 1);
    }
    console.error("Error deleting lead after retries:", error);
    throw error;
  }
}

// search leads by query
async function searchLeads(query) {
  try {
    const data = await authApi.get(
      `/leads/search?query=${encodeURIComponent(query)}`
    );
    return data;
  } catch (error) {
    console.error("Error searching leads:", error);
    throw error;
  }
}

// PAYMENT API FUNCTIONS

// fetch all payments
async function fetchPayments() {
  try {
    const data = await authApi.get("/payments");
    return data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
}

// fetch payments for a specific lead
async function fetchLeadPayments(leadId) {
  try {
    console.log(`Fetching payments for lead ID: ${leadId}`);

    if (!leadId) {
      console.error("fetchLeadPayments called with no leadId");
      return [];
    }

    const payments = await authApi.get(`/payments/lead/${leadId}`);
    console.log(`Received ${payments.length} payments for lead ID: ${leadId}`);

    // verify each payment belongs to this lead
    const validPayments = payments.filter(
      (payment) => payment.leadId === leadId
    );

    if (validPayments.length !== payments.length) {
      console.warn(
        `Found ${
          payments.length - validPayments.length
        } payments with mismatched lead IDs`
      );
    }

    return validPayments;
  } catch (error) {
    console.error("Error fetching lead payments:", error);
    throw error;
  }
}

// create a new payment
async function createPayment(paymentData) {
  try {
    const data = await authApi.post("/payments", paymentData);
    return data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

// update an existing payment
async function updatePayment(paymentId, paymentData) {
  try {
    const data = await authApi.put(`/payments/${paymentId}`, paymentData);
    return data;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
}

// delete a payment
async function deletePayment(paymentId) {
  try {
    const data = await authApi.delete(`/payments/${paymentId}`);
    return data;
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
}

// fetch all settings
async function fetchAllSettings() {
  try {
    const settings = await authApi.get("/settings");
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);

    // fallback to localStorage if API fails
    return {
      theme:
        localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"),
    };
  }
}

// update a specific setting
async function updateSetting(key, value) {
  try {
    const updatedSetting = await authApi.put(`/settings/${key}`, { value });

    // update localStorage as a fallback
    localStorage.setItem(key, value);

    return updatedSetting;
  } catch (error) {
    console.error("Error updating setting:", error);

    // update localStorage as a fallback
    localStorage.setItem(key, value);

    return { key, value };
  }
}

// fetch all forms from the API
async function fetchForms(filters = {}) {
  try {
    // build query string from filters
    const queryParams = new URLSearchParams();

    if (filters.category) {
      queryParams.append("category", filters.category);
    }

    // handle the new template/draft filter
    if (filters.templateType === "template") {
      queryParams.append("isTemplate", "true");
    } else if (filters.templateType === "draft") {
      queryParams.append("isTemplate", "false");
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/forms?${queryString}` : "/forms";

    const data = await authApi.get(endpoint);

    // make sure data is an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received");
    }

    return data;
  } catch (error) {
    console.error("Error fetching forms:", error);
    throw error;
  }
}

// fetch a specific form by ID
async function fetchFormById(formId) {
  try {
    const data = await authApi.get(`/forms/${formId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching form ${formId}:`, error);
    throw error;
  }
}

// create a new form
async function createForm(formData) {
  try {
    const data = await authApi.post("/forms", formData);
    return data;
  } catch (error) {
    console.error("Error creating form:", error);
    throw error;
  }
}

// update an existing form
async function updateForm(formId, formData) {
  try {
    const data = await authApi.put(`/forms/${formId}`, formData);
    return data;
  } catch (error) {
    console.error("Error updating form:", error);
    throw error;
  }
}

// delete a form
async function deleteForm(formId) {
  try {
    const data = await authApi.delete(`/forms/${formId}`);
    return data;
  } catch (error) {
    console.error("Error deleting form:", error);
    throw error;
  }
}

// search forms by query
async function searchForms(query) {
  try {
    const data = await authApi.get(
      `/forms/search?query=${encodeURIComponent(query)}`
    );
    return data;
  } catch (error) {
    console.error("Error searching forms:", error);
    throw error;
  }
}

// clone a template form
async function cloneTemplateForm(templateId) {
  try {
    const data = await authApi.post(`/forms/${templateId}/clone`);
    return data;
  } catch (error) {
    console.error("Error cloning template:", error);
    throw error;
  }
}

// generate a form with lead data
async function generateFormWithLeadData(formId, leadId) {
  try {
    const data = await authApi.post(`/forms/${formId}/generate`, { leadId });
    return data;
  } catch (error) {
    console.error("Error generating form with lead data:", error);
    throw error;
  }
}

// get forms for a specific lead
async function getFormsByLead(leadId) {
  try {
    const data = await authApi.get(`/forms/lead/${leadId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching forms for lead ${leadId}:`, error);
    throw error;
  }
}

// generate a form for a lead using a template
async function generateFormForLead(templateId, leadId) {
  try {
    const data = await authApi.post(`/forms/${templateId}/generate`, {
      leadId,
    });
    return data;
  } catch (error) {
    console.error("Error generating form:", error);
    throw error;
  }
}

// get documents for a specific lead
async function getDocumentsByLead(leadId) {
  try {
    const data = await authApi.get(`/documents/lead/${leadId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching documents for lead ${leadId}:`, error);
    throw error;
  }
}

// upload a document for a lead
async function uploadDocument(leadId, documentData) {
  try {
    const data = await authApi.post(`/documents/lead/${leadId}`, documentData);
    return data;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

// delete a document
async function deleteDocument(documentId) {
  try {
    const data = await authApi.delete(`/documents/${documentId}`);
    return data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

// Hitlist API functions
async function fetchHitlists() {
  try {
    const data = await authApi.get("/hitlists");
    return data;
  } catch (error) {
    console.error("Error fetching hitlists:", error);
    throw error;
  }
}

async function fetchHitlistById(hitlistId) {
  try {
    const data = await authApi.get(`/hitlists/${hitlistId}`);
    return data;
  } catch (error) {
    console.error("Error fetching hitlist:", error);
    throw error;
  }
}

async function createHitlist(hitlistData) {
  try {
    const data = await authApi.post("/hitlists", hitlistData);
    return data;
  } catch (error) {
    console.error("Error creating hitlist:", error);
    throw error;
  }
}

async function updateHitlist(hitlistId, hitlistData) {
  try {
    const data = await authApi.put(`/hitlists/${hitlistId}`, hitlistData);
    return data;
  } catch (error) {
    console.error("Error updating hitlist:", error);
    throw error;
  }
}

async function deleteHitlist(hitlistId) {
  try {
    const data = await authApi.delete(`/hitlists/${hitlistId}`);
    return data;
  } catch (error) {
    console.error("Error deleting hitlist:", error);
    throw error;
  }
}

// business API functions
async function fetchBusinessesByHitlist(hitlistId) {
  try {
    const data = await authApi.get(`/hitlists/${hitlistId}/businesses`);
    return data;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
}

async function createBusiness(hitlistId, businessData) {
  try {
    const data = await authApi.post(
      `/hitlists/${hitlistId}/businesses`,
      businessData
    );
    return data;
  } catch (error) {
    console.error("Error creating business:", error);
    throw error;
  }
}

async function updateBusiness(businessId, businessData) {
  try {
    const data = await authApi.put(
      `/hitlists/businesses/${businessId}`,
      businessData
    );
    return data;
  } catch (error) {
    console.error("Error updating business:", error);
    throw error;
  }
}

async function deleteBusiness(businessId) {
  try {
    const data = await authApi.delete(`/hitlists/businesses/${businessId}`);
    return data;
  } catch (error) {
    console.error("Error deleting business:", error);
    throw error;
  }
}

export {
  getBaseUrl,
  getApiUrl,
  fetchLeads,
  fetchLeadById,
  createLead,
  updateLead,
  deleteLead,
  searchLeads,
  fetchPayments,
  fetchLeadPayments,
  createPayment,
  updatePayment,
  deletePayment,
  fetchAllSettings,
  updateSetting,
  fetchForms,
  fetchFormById,
  createForm,
  updateForm,
  deleteForm,
  searchForms,
  cloneTemplateForm,
  generateFormWithLeadData,
  getFormsByLead,
  generateFormForLead,
  getDocumentsByLead,
  uploadDocument,
  deleteDocument,
  fetchHitlists,
  fetchHitlistById,
  createHitlist,
  updateHitlist,
  deleteHitlist,
  fetchBusinessesByHitlist,
  createBusiness,
  updateBusiness,
  deleteBusiness,
};