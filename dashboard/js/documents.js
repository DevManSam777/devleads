import * as API from "./api.js";
import * as Utils from "./utils.js";

function initDocumentUpload(leadId) {
  const fileInput = document.getElementById("fileInput");
  const selectFilesBtn = document.getElementById("selectFilesBtn");
  const uploadArea = document.getElementById("documentUploadArea");

  // Reset file input
  if (fileInput) {
    fileInput.value = "";
  }

  // Direct button click handler
  if (selectFilesBtn) {
    selectFilesBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (fileInput) {
        fileInput.value = "";
        fileInput.click();
      }
    };
  }

  // Direct file input change handler
  if (fileInput) {
    fileInput.onchange = function (e) {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files, leadId).then(() => {
          // Reset file input after processing
          e.target.value = "";
        });
      }
    };
  }

  // Handle drag and drop
  if (uploadArea) {
    uploadArea.ondragover = function (e) {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.add("highlight");
    };

    uploadArea.ondragleave = function (e) {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove("highlight");
    };

    uploadArea.ondrop = function (e) {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove("highlight");

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files, leadId);
      }
    };
  }

  // update UI mode for documents
  updateDocumentUiForMode();
}

async function processFiles(files, leadId) {
  // validate edit mode
  const submitButton = document.querySelector(
    '#leadForm button[type="submit"]'
  );
  const isEditMode =
    submitButton && getComputedStyle(submitButton).display !== "none";

  if (!isEditMode) {
    Utils.showToast("Please switch to edit mode to upload documents");
    return;
  }

  // validate lead ID
  if (!leadId) {
    Utils.showToast("Error: No lead selected for document upload");
    return;
  }

  // get existing document list
  const documentsContainer = document.getElementById("signedDocumentsList");
  const existingDocuments = Array.from(
    documentsContainer.querySelectorAll(".document-item")
  ).map((el) => el.querySelector(".document-title").textContent);

  // Show initial loading state
  const uploadArea = document.getElementById("documentUploadArea");
  const originalUploadAreaContent = uploadArea ? uploadArea.innerHTML : "";
  if (uploadArea) {
    uploadArea.innerHTML =
      '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Uploading documents...</div>';
    uploadArea.style.pointerEvents = "none";
  }

  try {
    // process each file
    for (let file of files) {
      // check if file already exists
      if (existingDocuments.includes(file.name)) {
        Utils.showToast(`${file.name} is already uploaded to this lead`);
        continue;
      }

      // validate file type
      if (file.type !== "application/pdf") {
        Utils.showToast(`${file.name} is not a PDF file`);
        continue;
      }

      // file size 16MB limit
      if (file.size > 16 * 1024 * 1024) {
        Utils.showToast(`${file.name} is too large (max 16MB)`);
        continue;
      }

      try {
        // Update loading message for current file
        if (uploadArea) {
          uploadArea.innerHTML = `<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Uploading ${file.name}...</div>`;
        }

        // read file
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // file data
        const documentData = {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: fileData,
        };

        // upload document
        const response = await fetch(
          `${API.getBaseUrl()}/api/documents/lead/${leadId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(documentData),
          }
        );

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        // show success and reload documents
        Utils.showToast(`${file.name} uploaded successfully`);
        await loadLeadDocuments(leadId);
      } catch (error) {
        console.error("Document upload error:", error);
        Utils.showToast(`Error uploading ${file.name}: ${error.message}`);
      }
    }
  } finally {
    // Restore upload area to original state
    if (uploadArea) {
      uploadArea.innerHTML = originalUploadAreaContent;
      uploadArea.style.pointerEvents = "auto";
    }

    // Reinitialize file upload functionality
    initDocumentUpload(leadId);
  }
}

async function loadLeadDocuments(leadId) {
  try {
    const documentsContainer = document.getElementById("signedDocumentsList");

    if (!documentsContainer) return;

    documentsContainer.innerHTML =
      '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading documents...</div>';

    // fetch documents for this lead
    const response = await fetch(
      `${API.getBaseUrl()}/api/documents/lead/${leadId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch lead documents");
    }

    const documents = await response.json();

    // clear container
    documentsContainer.innerHTML = "";

    // get date format from window object or use default
    const dateFormat = window.dateFormat || "MM/DD/YYYY";

    // add each document
    documents.forEach((doc) => {
      // format dates
      let formattedUploadDate = "Not recorded";
      if (doc.uploadedAt) {
        const uploadDate = new Date(doc.uploadedAt);
        formattedUploadDate = Utils.formatDateTime(uploadDate, dateFormat);
      }

      const documentItem = document.createElement("div");
      documentItem.className = "document-item";
      documentItem.dataset.documentId = doc._id;

      documentItem.innerHTML = `
        <div class="document-details">
          <div class="document-title">${doc.fileName}</div>
          <div class="document-date">
            <i class="far fa-calendar-plus"></i> Uploaded: ${formattedUploadDate}
          </div>
        </div>
        <div class="document-actions">
          <button type="button" class="view-document" title="View Document">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="delete-document" title="Delete Document">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      documentItem
        .querySelector(".view-document")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          viewDocument(doc._id, doc.fileName);
        });

      documentItem
        .querySelector(".delete-document")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${doc.fileName}"?`)) {
            deleteDocument(doc._id, leadId);
          }
        });

      // add to container
      documentsContainer.appendChild(documentItem);
    });

    // update UI mode
    updateDocumentUiForMode();
  } catch (error) {
    console.error("Error loading lead documents:", error);
    const documentsContainer = document.getElementById("signedDocumentsList");
    if (documentsContainer) {
      documentsContainer.innerHTML =
        '<p class="no-documents-message">Error loading documents</p>';
    }
  }
}

async function viewDocument(documentId, fileName) {
  try {
    // find the document item and show loader
    const documentItem = document.querySelector(
      `.document-item[data-document-id="${documentId}"]`
    );
    if (documentItem) {
      const originalContent = documentItem.innerHTML;
      documentItem.innerHTML =
        '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Opening document...</div>';
      documentItem.style.pointerEvents = "none";

      const user = auth.currentUser;
      if (!user) {
        throw new Error("User is not authenticated");
      }
      const token = await user.getIdToken();

      const documentUrl = `${API.getBaseUrl()}/api/documents/${documentId}`;
      const response = await fetch(documentUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch document: ${response.status} - ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, "_blank");

      // check if the new window was successfully opened
      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed === "undefined"
      ) {
        Utils.showToast(
          "Pop-up blocked. Please allow pop-ups for this site to view the document."
        );
        console.warn("Pop-up blocked by the browser.");
      } else {
        // restore original content after successful opening
        documentItem.innerHTML = originalContent;
        documentItem.style.pointerEvents = "auto";

        // reattach event listeners
        documentItem
          .querySelector(".view-document")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            viewDocument(documentId, fileName);
          });

        documentItem
          .querySelector(".delete-document")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
              deleteDocument(documentId, leadId);
            }
          });
      }
    }
  } catch (error) {
    console.error("Error viewing document:", error);
    Utils.showToast(`Error: ${error.message}`);

    // restore the document item if it exists
    if (documentItem) {
      documentItem.innerHTML = originalContent;
      documentItem.style.pointerEvents = "auto";

      // reattach event listeners
      documentItem
        .querySelector(".view-document")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          viewDocument(documentId, fileName);
        });

      documentItem
        .querySelector(".delete-document")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
            deleteDocument(documentId, leadId);
          }
        });
    }
  }
}

async function deleteDocument(documentId, leadId) {
  const documentItem = document.querySelector(
    `.document-item[data-document-id="${documentId}"]`
  );
  const originalContent = documentItem ? documentItem.innerHTML : null;

  try {
    // Show loading state
    if (documentItem) {
      documentItem.innerHTML =
        '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Deleting document...</div>';
      documentItem.style.pointerEvents = "none";
    }

    const response = await fetch(
      `${API.getBaseUrl()}/api/documents/${documentId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete document: ${response.status} - ${response.statusText}`
      );
    }

    Utils.showToast("Document deleted successfully");

    // Show loading state in documents container
    const documentsContainer = document.getElementById("signedDocumentsList");
    if (documentsContainer) {
      documentsContainer.innerHTML =
        '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Reloading documents...</div>';
    }

    try {
      // reload documents list
      await loadLeadDocuments(leadId);
    } catch (loadError) {
      console.error("Error reloading documents:", loadError);
      Utils.showToast("Error reloading documents. Please refresh the page.");

      // Restore the document item if it exists
      if (documentItem && originalContent) {
        documentItem.innerHTML = originalContent;
        documentItem.style.pointerEvents = "auto";

        // Reattach event listeners
        documentItem
          .querySelector(".view-document")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            const fileName =
              documentItem.querySelector(".document-title").textContent;
            viewDocument(documentId, fileName);
          });

        documentItem
          .querySelector(".delete-document")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            const fileName =
              documentItem.querySelector(".document-title").textContent;
            if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
              deleteDocument(documentId, leadId);
            }
          });
      }
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    Utils.showToast(`Error: ${error.message}`);

    // Restore the document item if it exists
    if (documentItem && originalContent) {
      documentItem.innerHTML = originalContent;
      documentItem.style.pointerEvents = "auto";

      // Reattach event listeners
      documentItem
        .querySelector(".view-document")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          const fileName =
            documentItem.querySelector(".document-title").textContent;
          viewDocument(documentId, fileName);
        });

      documentItem
        .querySelector(".delete-document")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          const fileName =
            documentItem.querySelector(".document-title").textContent;
          if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
            deleteDocument(documentId, leadId);
          }
        });
    }
  }
}

function updateDocumentUiForMode() {
  const submitButton = document.querySelector(
    '#leadForm button[type="submit"]'
  );
  const isEditMode =
    submitButton && getComputedStyle(submitButton).display !== "none";

  // update upload area visibility
  const uploadArea = document.getElementById("documentUploadArea");
  if (uploadArea) {
    uploadArea.style.display = isEditMode ? "flex" : "none";
  }

  // update delete button visibility
  const deleteButtons = document.querySelectorAll(
    ".document-actions .delete-document"
  );
  deleteButtons.forEach((button) => {
    button.style.display = isEditMode ? "flex" : "none";
  });
}

export { initDocumentUpload, loadLeadDocuments, updateDocumentUiForMode };
