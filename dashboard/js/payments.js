import {
  formatCurrency,
  formatDate,
  showToast,
  initializeMonetaryInputs,
} from "./utils.js";
import {
  fetchLeadPayments,
  updatePayment,
  createPayment,
  deletePayment,
} from "./api.js";

// render lead payments in the UI
function renderLeadPayments(leadPayments, leadId) {
  const paymentsContainer = document.querySelector(".payments-container");

  if (!paymentsContainer) {
    console.error("Payments container not found");
    return;
  }

  // get the date format from window object or use default
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  // clear the container first
  paymentsContainer.innerHTML = "";

  // make sure we have valid payments for this lead
  const filteredPayments = leadPayments.filter((payment) => {
    return payment && payment.leadId === leadId;
  });

  // if no payments for this lead
  if (!filteredPayments || filteredPayments.length === 0) {
    paymentsContainer.innerHTML =
      '<p class="no-payments-message">No payments found.  Click "Add Payment" to add one.</p>';
    return;
  }

  // sort payments by date (newest first)
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    // directly compare Date objects created from the UTC strings
    const dateA = new Date(a.paymentDate);
    const dateB = new Date(b.paymentDate);
    return dateB.getTime() - dateA.getTime(); // compare timestamps for accuracy
  });

  // check if we're in edit mode (Lead modal is open and in edit mode)
  const leadModal = document.getElementById("leadModal");
  // check if the lead modal is open and has a submit button that is visible (indicating edit mode)
  const submitButton = leadModal
    ? leadModal.querySelector('button[type="submit"]')
    : null;
  const isEditMode =
    leadModal &&
    leadModal.style.display !== "none" &&
    submitButton &&
    getComputedStyle(submitButton).display !== "none";

  // render each payment
  sortedPayments.forEach((payment) => {
    let formattedDate = "Not recorded";

    if (payment.paymentDate) {
      // create a Date object from the stored UTC string
      const paymentDateUTC = new Date(payment.paymentDate);

      // check if the date is valid before proceeding
      if (!isNaN(paymentDateUTC.getTime())) {
        // create a local date object representing the same date as the UTC date at local midnight
        // this is the standard way to display a date stored in UTC in the local timezone.
        const localDateForDisplay = new Date(
          paymentDateUTC.getUTCFullYear(),
          paymentDateUTC.getUTCMonth(),
          paymentDateUTC.getUTCDate() // use UTC date components to construct local date
        );

        // format the local date for display
        formattedDate = formatDate(localDateForDisplay, dateFormat);

        // debug log to compare dates
        console.log(
          `Render Payment Date: Original='${
            payment.paymentDate
          }', UTC Parsed='${paymentDateUTC.toISOString()}', Local Display Date='${localDateForDisplay.toLocaleDateString()}'`
        );
      } else {
        console.warn(
          `Invalid payment date format received: ${payment.paymentDate}`
        );
        formattedDate = "Invalid Date"; // display something if the date is invalid
      }
    }

    // create payment item element
    const paymentItem = document.createElement("div");
    paymentItem.className = "payment-item";
    paymentItem.dataset.leadId = payment.leadId;
    paymentItem.dataset.paymentId = payment._id;

    // create payment details section
    const paymentDetails = document.createElement("div");
    paymentDetails.className = "payment-details";

    // add payment amount
    const amountDiv = document.createElement("div");
    amountDiv.className = "payment-amount";
    amountDiv.textContent = formatCurrency(payment.amount);
    paymentDetails.appendChild(amountDiv);

    // add payment date
    const dateDiv = document.createElement("div");
    dateDiv.className = "payment-date";
    dateDiv.innerHTML = `<i class="fa-solid fa-money-bill-wave" style="opacity: 0.7"></i> Paid: ${formattedDate}`;
    paymentDetails.appendChild(dateDiv);

    // add payment notes if available
    if (payment.notes) {
      const notesDiv = document.createElement("div");
      notesDiv.className = "payment-notes";
      notesDiv.innerHTML = `<i class="fa-regular fa-clipboard" style="margin-left: 0.3rem;"></i><span style="font-style: normal; padding-left: 0.5rem;">Note: </span>"<span style="padding">${payment.notes}</span>"`;
      paymentDetails.appendChild(notesDiv);
    }

    // add details to the payment item
    paymentItem.appendChild(paymentDetails);

    // add action buttons if in edit mode
    if (isEditMode) {
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "payment-actions";

      // edit button
      const editButton = document.createElement("button");
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.title = "Edit Payment"; 
      editButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        // pass leadId and paymentId to open the modal in edit mode
        openPaymentModal(payment.leadId, payment._id);
      });
      actionsDiv.appendChild(editButton);

      // delete button
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.title = "Delete Payment"; // Add title for better UX
      deleteButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this payment?")) {
          // pass paymentId and leadId for deletion and subsequent refresh
          deletePaymentAction(payment._id, payment.leadId);
        }
      });
      actionsDiv.appendChild(deleteButton);

      // add actions div to the payment item
      paymentItem.appendChild(actionsDiv); 
    }

    // add the payment item to the container 
    paymentsContainer.appendChild(paymentItem); 
  });

  // log the rendered payments
  console.log(
    `Rendered ${filteredPayments.length} payments for lead ID: ${leadId}`
  );
}

// open the payment modal for adding or editing a payment
function openPaymentModal(leadId, paymentId = null) {
  const paymentForm = document.getElementById("paymentForm");
  if (!paymentForm) return;

  paymentForm.reset();

  // clear previous values
  document.getElementById("paymentId").value = "";
  document.getElementById("paymentLeadId").value = "";

  // clear the date display
  const dateDisplay = document.getElementById("paymentDateDisplay");
  if (dateDisplay) {
    dateDisplay.textContent = "";
  }

  // set the lead ID & verify it exists
  if (!leadId) {
    showToast("Error: No lead ID provided");
    console.error("Attempted to open payment modal without lead ID");
    return;
  }

  console.log(
    `Opening payment modal for lead ID: ${leadId} ${
      paymentId ? "(Editing Payment ID: " + paymentId + ")" : "(New Payment)"
    }`
  );
  document.getElementById("paymentLeadId").value = leadId;

  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  // handle Editing an existing payment 
  if (paymentId) {
    // fetch payments for the lead to find the specific payment
    fetchLeadPayments(leadId)
      .then((payments) => {
        // find the specific payment by ID
        const payment = payments.find(
          (p) => p._id === paymentId && p.leadId === leadId // Added leadId check for safety
        );

        if (!payment) {
          showToast("Payment not found or doesn't belong to this lead");
          console.error(`Payment ID ${paymentId} not found for lead ${leadId}`);
          return;
        }

        // populate form fields with payment data
        document.getElementById("paymentId").value = payment._id;
        document.getElementById("paymentAmount").value = payment.amount;

        // date Handling for editing 
        if (payment.paymentDate) {
          // create a Date object from the stored UTC string
          const paymentDateUTC = new Date(payment.paymentDate);

          // create a local Date object representing the same date as the UTC date at local midnight
          // gives the correct local date to format for the input field.
          const localDateForInput = new Date(
            paymentDateUTC.getUTCFullYear(),
            paymentDateUTC.getUTCMonth(),
            paymentDateUTC.getUTCDate() // use UTC date components
          );

          // format the local Date object as YYYY-MM-DD for the input[type="date"] field
          const year = localDateForInput.getFullYear();
          const month = (localDateForInput.getMonth() + 1)
            .toString()
            .padStart(2, "0");
          const day = localDateForInput.getDate().toString().padStart(2, "0"); 

          const formattedDateForInput = `${year}-${month}-${day}`;
          document.getElementById("paymentDate").value = formattedDateForInput;

          // update the display element with formatted date using the dateFormat
          if (dateDisplay) {
            // use the same localDateForInput for formatting the display
            dateDisplay.textContent = formatDate(localDateForInput, dateFormat);
          }

          // debug log for editing date
          console.log(
            `Opening for Edit - Payment Date: Original='${
              payment.paymentDate
            }', UTC Parsed='${paymentDateUTC.toISOString()}', Local Date for Input='${localDateForInput.toLocaleDateString()}', Formatted for Input='${formattedDateForInput}'`
          );
        }

        // set notes content
        document.getElementById("paymentNotes").value = payment.notes || "";

        document.getElementById("paymentModalTitle").textContent =
          "Edit Payment";

        // make sure modal is visible before trying to resize textarea
        document.getElementById("paymentModal").style.display = "block";

        // after modal is shown, adjust the textarea height
        setTimeout(() => {
          autoResizePaymentTextarea();
        }, 0);
      })
      .catch((error) => {
        console.error("Error fetching payment for editing:", error);
        showToast("Error fetching payment details.");
      });
  }
  // handle adding a new payment 
  else {
    // for a new payment, set today's date in the input field and display
    const today = new Date();

    // format today's date for the input field as YYYY-MM-DD (local time)
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const todayFormattedForInput = `${year}-${month}-${day}`;
    document.getElementById("paymentDate").value = todayFormattedForInput;

    // update the display element with today's date in the correct format
    if (dateDisplay) {
      dateDisplay.textContent = formatDate(today, dateFormat); // Format local 'today' date
    }

    document.getElementById("paymentNotes").value = "";

    document.getElementById("paymentModalTitle").textContent = "Add Payment";

    // show modal
    document.getElementById("paymentModal").style.display = "block";

    // adjust textarea height
    setTimeout(() => {
      autoResizePaymentTextarea();
    }, 0);
  }

  // setup event listener for date input changes for both add and edit
  const paymentDateInput = document.getElementById("paymentDate");
  if (paymentDateInput) {
    // remove any existing listeners to avoid duplicates
    const oldInput = paymentDateInput;
    const newInput = oldInput.cloneNode(true);
    oldInput.parentNode.replaceChild(newInput, oldInput);
    // get the element reference again
    const updatedPaymentDateInput = document.getElementById("paymentDate");

    updatedPaymentDateInput.addEventListener("change", function () {
      if (this.value) {
        // the input value is YYYY-MM-DD local date string
        const dateParts = this.value.split("-");
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS
        const day = parseInt(dateParts[2]);

        // create a local Date object for display purposes
        const dateForDisplay = new Date(year, month, day); // local date at midnight

        if (dateDisplay) {
          dateDisplay.textContent = formatDate(dateForDisplay, dateFormat);
        }
      } else {
        if (dateDisplay) {
          dateDisplay.textContent = "";
        }
      }
    });
  }

  // set up textarea auto-resize
  const paymentNotesTextarea = document.getElementById("paymentNotes");
  if (paymentNotesTextarea) {
    // event listener for auto-resize 
    const oldTextarea = paymentNotesTextarea;
    const newTextarea = oldTextarea.cloneNode(true);
    oldTextarea.parentNode.replaceChild(newTextarea, oldTextarea);
    // get the element reference again
    const updatedPaymentNotesTextarea = document.getElementById("paymentNotes");

    updatedPaymentNotesTextarea.removeEventListener(
      "input",
      autoResizePaymentTextarea
    );
    updatedPaymentNotesTextarea.addEventListener(
      "input",
      autoResizePaymentTextarea
    );

    // trigger resize once on open
    autoResizePaymentTextarea();
  }

  // initialize monetary inputs in the payment modal
  initializeMonetaryInputs();
}

// auto-resize payment notes textarea
function autoResizePaymentTextarea() {
  const textarea = document.getElementById("paymentNotes");
  if (!textarea) return;

  // reset height to auto to get the correct scrollHeight
  textarea.style.height = "auto";

  // get the scroll height 
  const scrollHeight = textarea.scrollHeight;

  // set a minimum height to match input fields
  const minHeight = 38; // in pixels - matches standard input height

  // only expand beyond minimum if content requires it
  if (scrollHeight > minHeight) {
    textarea.style.cssText += `height: ${scrollHeight}px !important;`;
  } else {
    textarea.style.cssText += `height: ${minHeight}px !important;`;
  }
}

// close payment modal
function closePaymentModal() {
  const paymentModal = document.getElementById("paymentModal");
  if (!paymentModal) return;

  // hide the payment modal
  paymentModal.style.display = "none";

  // get the stored lead modal state
  const leadModalState = paymentModal.dataset.leadModalState;

  // if we have a stored state and it was "block", ensure lead modal stays open
  if (leadModalState === "block") {
    document.getElementById("leadModal").style.display = "block";
  }
}


async function validateAndSavePayment(event) {
  event.preventDefault();

  // get form data
  const paymentId = document.getElementById("paymentId").value;
  const leadId = document.getElementById("paymentLeadId").value;
  const amountStr = document.getElementById("paymentAmount").value;
  const paymentDateString = document.getElementById("paymentDate").value;
  const notes = document.getElementById("paymentNotes").value;

  // validation checks 
  if (!leadId) {
    showToast("Error: Missing lead ID");
    return;
  }

  // extract numeric value from formatted amount
  const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ""));

  if (isNaN(amount) || amount <= 0) {
    showToast("Please enter a valid amount");
    return;
  }

  if (!paymentDateString) {
    showToast("Payment date is required");
    return;
  }

  // get the current totalBudget value from the form
  const totalBudgetStr = document.getElementById("totalBudget").value;
  const totalBudget = parseFloat(totalBudgetStr.replace(/[^\d.-]/g, "")) || 0;

  try {
    //  save the totalBudget to ensure it's up-to-date
    // Use the globally exposed function through the window object
    const leadData = {
      totalBudget: totalBudget,
    };

    // try to use the global window function
    if (typeof window.updateLead === "function") {
      await window.updateLead(leadId, leadData);
    }
    // Or try to use the imported function
    else if (
      typeof window.API !== "undefined" &&
      typeof window.API.updateLead === "function"
    ) {
      await window.API.updateLead(leadId, leadData);
    }
    // fallback to direct fetch 
    else {
      const response = await fetch(`${getApiUrl()}/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update lead: ${response.status}`);
      }
    }

    console.log("Saved totalBudget before processing payment:", totalBudget);

    
    // prepare date format the way you were already doing it
    const [year, month, day] = paymentDateString.split("-").map(Number);
    const paymentDateLocalMidnight = new Date(year, month - 1, day);
    const paymentDateForSaving = paymentDateLocalMidnight.toISOString();

    // prepare payment data
    const paymentData = {
      leadId,
      amount,
      paymentDate: paymentDateForSaving,
      notes,
    };

    let result;
    if (paymentId) {
      // update existing payment
      result = await updatePayment(paymentId, paymentData);
    } else {
      // create new payment
      result = await createPayment(paymentData);
    }

    // close the payment modal
    closePaymentModal();

    // get updated payments list for this lead
    const updatedLeadPayments = await fetchLeadPayments(leadId);

    // calculate the total paid for this lead
    const totalPaid = updatedLeadPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      return sum + amount;
    }, 0);

    // calculate remaining balance
    const remainingBalance = Math.max(0, totalBudget - totalPaid);

    // update the lead with both the paidAmount and remainingBalance
    const finalUpdateData = {
      paidAmount: totalPaid,
      remainingBalance: remainingBalance,
    };

    // try each possible method for updating the lead
    if (typeof window.updateLead === "function") {
      await window.updateLead(leadId, finalUpdateData);
    } else if (
      typeof window.API !== "undefined" &&
      typeof window.API.updateLead === "function"
    ) {
      await window.API.updateLead(leadId, finalUpdateData);
    } else {
      const response = await fetch(`${getApiUrl()}/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalUpdateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update lead: ${response.status}`);
      }
    }

    // update UI fields with the latest values
    const paidAmountField = document.getElementById("paidAmount");
    if (paidAmountField) {
      paidAmountField.value = formatCurrency(totalPaid);
    }

    const remainingBalanceField = document.getElementById("remainingBalance");
    if (remainingBalanceField) {
      remainingBalanceField.value = formatCurrency(remainingBalance);
    }

    // render updated payment list in the modal
    renderLeadPayments(updatedLeadPayments, leadId);

    // success message
    showToast(
      paymentId ? "Payment updated successfully" : "Payment added successfully"
    );

    // signal that ALL payments have been updated for dashboard stats
    window.dispatchEvent(new CustomEvent("paymentsUpdated"));
  } catch (error) {
    console.error("Error saving payment:", error);
    showToast("Error: " + (error.message || "An unknown error occurred"));
  }
}

// helper function to get API URL
function getApiUrl() {
  // use the existing function if available
  if (typeof window.getApiUrl === "function") {
    return window.getApiUrl();
  }

  // fallback implementation
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  } else {
    return "/api";
  }
}

async function deletePaymentAction(paymentId, leadId) {
  try {
    if (!paymentId || !leadId) {
      throw new Error("Missing payment ID or lead ID");
    }

    // store the lead modal state before any operations
    const leadModalDisplayStyle =
      document.getElementById("leadModal").style.display;

    // delete the payment
    const response = await deletePayment(paymentId);
    if (!response) {
      throw new Error("Failed to delete payment");
    }

    // get updated payments for this specific lead
    const leadPayments = await fetchLeadPayments(leadId);
    console.log("Updated payments after deletion:", leadPayments);

    // calculate the total paid
    const totalPaid = leadPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      return sum + amount;
    }, 0);

    // update paid amount field
    const paidAmountField = document.getElementById("paidAmount");
    if (paidAmountField) {
      paidAmountField.value = formatCurrency(totalPaid);
    }

    // update remaining balance field
    const remainingBalanceField = document.getElementById("remainingBalance");
    if (remainingBalanceField) {
      // get the total budget from the form
      const totalBudgetStr = document.getElementById("totalBudget").value;
      const totalBudget =
        parseFloat(totalBudgetStr.replace(/[^\d.-]/g, "")) || 0;
      const remainingBalance = totalBudget - totalPaid;
      remainingBalanceField.value = formatCurrency(remainingBalance);
    }

    // force re-render payment list with current date format
    renderLeadPayments(leadPayments, leadId);

    // ensure lead modal stays in its original state
    document.getElementById("leadModal").style.display = leadModalDisplayStyle;

    // signal that payments have been updated
    window.dispatchEvent(new CustomEvent("paymentsUpdated"));

    // show success message
    showToast("Payment deleted successfully");
  } catch (error) {
    console.error("Error deleting payment:", error);
    showToast("Error: " + error.message);
  }
}

export {
  renderLeadPayments,
  openPaymentModal,
  closePaymentModal,
  validateAndSavePayment,
  deletePaymentAction,
};
