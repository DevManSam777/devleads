function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "";

  const cleaned = phoneNumber.replace(/\D/g, "");

  // return original if not enough digits for complete phone number
  if (cleaned.length < 10) return phoneNumber;

  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return match[1] + "-" + match[2] + "-" + match[3];
  }

  return phoneNumber;
}

function formatPhoneInput(input) {
  if (!input) return;

  const cursorPos = input.selectionStart;
  let value = input.value.replace(/\D/g, "");
  const originalLength = input.value.length;

  // format as xxx-xxx-xxxx based on length
  if (value.length <= 3) {
    // do nothing for 1-3 digits
  } else if (value.length <= 6) {
    value = value.slice(0, 3) + "-" + value.slice(3);
  } else {
    // limit to 10 digits
    value =
      value.slice(0, 3) + "-" + value.slice(3, 6) + "-" + value.slice(6, 10);
  }

  input.value = value;

  // adjust cursor position if value changed
  if (input.value.length !== originalLength) {
    let newCursorPos = cursorPos;
    if (input.value.charAt(cursorPos - 1) === "-") {
      newCursorPos++;
    }
    if (cursorPos === 4 || cursorPos === 8) {
      newCursorPos++;
    }
    input.setSelectionRange(newCursorPos, newCursorPos);
  }
}

function initializePhoneFormatting() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  phoneInputs.forEach((input) => {
    input.addEventListener("input", function () {
      formatPhoneInput(this);
    });
  });
}

function restrictToDigits(input) {
  if (!input) return;

  const cursorPos = input.selectionStart;
  let value = input.value;
  const originalLength = value.length;

  // only allow digits and at most one decimal point
  const decimalIndex = value.indexOf(".");

  if (decimalIndex !== -1) {
    const beforeDecimal = value
      .substring(0, decimalIndex)
      .replace(/[^\d]/g, "");
    const afterDecimal = value
      .substring(decimalIndex + 1)
      .replace(/[^\d]/g, "")
      .substring(0, 2); // limit to 2 decimal places
    value = beforeDecimal + "." + afterDecimal;
  } else {
    value = value.replace(/[^\d.]/g, "");

    // ensure only one decimal point
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }
  }

  input.value = value;

  if (input.value.length !== originalLength) {
    let newPos = cursorPos;
    if (newPos > input.value.length) {
      newPos = input.value.length;
    }
    input.setSelectionRange(newPos, newPos);
  }
}

function preventExcessDecimals(event, input) {
  const value = input.value;
  const key = event.key;
  const cursorPos = input.selectionStart;
  
  // Allow control keys (backspace, delete, tab, escape, enter, etc.)
  if (event.ctrlKey || event.metaKey || 
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
    return;
  }
  
  // Only allow digits and one decimal point
  if (!/[\d.]/.test(key)) {
    event.preventDefault();
    return;
  }
  
  // Check for decimal point rules
  if (key === '.') {
    // Prevent multiple decimal points
    if (value.includes('.')) {
      event.preventDefault();
      return;
    }
  }
  
  // If there's already a decimal point, check decimal places
  const decimalIndex = value.indexOf('.');
  if (decimalIndex !== -1) {
    // If cursor is after decimal point
    if (cursorPos > decimalIndex) {
      const afterDecimal = value.substring(decimalIndex + 1);
      // If already 2 decimal places, prevent more digits
      if (afterDecimal.length >= 2) {
        event.preventDefault();
        return;
      }
    }
  }
}

function initializeMonetaryInputs() {
  const monetaryInputs = [
    document.getElementById("budget"),
    document.getElementById("totalBudget"),
    document.getElementById("paymentAmount"),
  ];

  monetaryInputs.forEach((input) => {
    if (input) {
      // Add keypress event to prevent typing beyond 2 decimal places
      input.addEventListener("keypress", function (e) {
        preventExcessDecimals(e, this);
      });
      
      input.addEventListener("input", function () {
        restrictToDigits(this);
      });

      // format as currency when field loses focus
      input.addEventListener("blur", function () {
        if (this.value) {
          const numValue = parseFloat(this.value);
          if (!isNaN(numValue)) {
            this.value = formatCurrency(numValue);
          }
        }
      });

      // convert from formatted currency to plain number and select all text
      input.addEventListener("focus", function () {
        this.select();

        if (this.value) {
          const numStr = this.value.replace(/[^\d.]/g, "");
          this.value = numStr;

          // re-select after changing value to ensure text stays selected
          setTimeout(() => this.select(), 0);
        }
      });
    }
  });
}

function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      currencyDisplay: "symbol",
    }).format(amount);
  } catch (error) {
    console.warn("Error formatting currency:", error);
    return "$" + amount.toFixed(2);
  }
}

function formatDate(date, format = "MM/DD/YYYY") {
  if (!date) return "";

  let dateObj;
  if (typeof date === "string") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) {
    console.warn("Invalid date:", date);
    return "";
  }

  // use local timezone methods to get date components
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // getmonth() returns 0-11
  const day = dateObj.getDate();

  const paddedMonth = month.toString().padStart(2, "0");
  const paddedDay = day.toString().padStart(2, "0");

  let formattedDate = format;
  formattedDate = formattedDate.replace(/YYYY/g, year);
  formattedDate = formattedDate.replace(/YY/g, String(year).slice(-2));
  formattedDate = formattedDate.replace(/MM/g, paddedMonth);
  formattedDate = formattedDate.replace(/M/g, month);
  formattedDate = formattedDate.replace(/DD/g, paddedDay);
  formattedDate = formattedDate.replace(/D/g, day);

  return formattedDate;
}

function toISODateString(dateStr, format = "MM/DD/YYYY") {
  if (!dateStr) return "";

  let year, month, day;

  if (format === "MM/DD/YYYY") {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "";
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else if (format === "DD/MM/YYYY") {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "";
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else if (format === "YYYY-MM-DD") {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    // for other formats, use date object parsing
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return "";
    year = dateObj.getFullYear();
    month = dateObj.getMonth() + 1;
    day = dateObj.getDate();
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return "";
  }

  // format as yyyy-mm-dd for input[type="date"]
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

function formatDateTime(datetime, dateFormat = "MM/DD/YYYY") {
  if (!datetime) return "";

  let dateObj;
  if (typeof datetime === "string") {
    dateObj = new Date(datetime);
  } else {
    dateObj = datetime;
  }

  if (isNaN(dateObj.getTime())) {
    console.warn("Invalid datetime:", datetime);
    return "";
  }

  return formatDate(dateObj, dateFormat);
}

function updateDateInputDisplay(inputId, displayId, format = null) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);

  if (!input || !display) return;

  const dateFormat = format || window.dateFormat || "MM/DD/YYYY";

  if (input.value) {
    const date = new Date(input.value);
    display.textContent = formatDate(date, dateFormat);
  } else {
    display.textContent = "";
  }
}

function setupDateInput(inputId, displayId) {
  const input = document.getElementById(inputId);

  if (!input) return;

  input.addEventListener("change", function () {
    updateDateInputDisplay(inputId, displayId);
  });

  updateDateInputDisplay(inputId, displayId);
}

function initializeDateInputs() {
  setupDateInput("lastContactedAt", "lastContactedDisplay");
  setupDateInput("paymentDate", "paymentDateDisplay");

  window.addEventListener("settingsUpdated", function (event) {
    const { key, value } = event.detail;

    if (key === "dateFormat") {
      updateDateInputDisplay("lastContactedAt", "lastContactedDisplay", value);
      updateDateInputDisplay("paymentDate", "paymentDateDisplay", value);
    }
  });
}

let toastTimer;

function showToast(message, type = "default") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  if (!toast || !toastMessage) {
    console.error("Toast elements not found");
    return;
  }

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastMessage.textContent = message;
  toast.classList.remove("deletion");

  if (type === "deletion" || message.includes("deleted")) {
    toast.classList.add("deletion");
  }

  toast.classList.remove("show", "hide");

  // force reflow to ensure animation plays
  void toast.offsetWidth;

  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.add("hide");
    toast.classList.remove("show");
    toastTimer = null;
  }, 3000);
}

function safeSetTextContent(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  } else {
    console.warn(`Element with id ${elementId} not found in the DOM`);
  }
}

function safeUpdateChangeIndicator(elementId, value, period) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Change indicator element with id ${elementId} not found`);
    return;
  }

  try {
    // new leads doesn't show period text
    if (elementId === "newLeadsChange") {
      if (value > 0) {
        element.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(
          value
        ).toFixed(1)}%`;
        element.className = "change positive";
      } else if (value < 0) {
        element.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(
          value
        ).toFixed(1)}%`;
        element.className = "change negative";
      } else {
        element.innerHTML = `<i class="fas fa-minus"></i> 0% from last month`;
        element.className = "change";
      }
    } else {
      // all other stats show "from last month"
      if (value > 0) {
        element.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(
          value
        ).toFixed(1)}% from last month`;
        element.className = "change positive";
      } else if (value < 0) {
        element.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(
          value
        ).toFixed(1)}% from last month`;
        element.className = "change negative";
      } else {
        element.innerHTML = `<i class="fas fa-minus"></i> 0% from last month`;
        element.className = "change";
      }
    }
  } catch (error) {
    console.error(`Error updating change indicator ${elementId}:`, error);
    if (element.innerHTML) {
      if (elementId === "newLeadsChange") {
        element.innerHTML = `<i class="fas fa-minus"></i> 0% from`;
      } else {
        element.innerHTML = `<i class="fas fa-minus"></i> 0% from last month`;
      }
      element.className = "change";
    }
  }
}

function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getLeadName(lead) {
  if (lead.firstName && lead.lastName) {
    return `${lead.firstName} ${lead.lastName}`;
  } else if (lead.name) {
    return lead.name;
  } else {
    return "Unknown";
  }
}

function showInputError(input, errorElement, message) {
  input.classList.add("invalid");

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.className = "error-message";
    input.parentNode.appendChild(errorElement);
  }

  errorElement.textContent = message;
  errorElement.style.display = "block";
  return false;
}

function clearInputError(input, errorElement) {
  input.classList.remove("invalid");

  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
  return true;
}

function getErrorElement(input) {
  let errorElement = input.parentNode.querySelector(".error-message");

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.className = "error-message";
    input.parentNode.appendChild(errorElement);
  }

  return errorElement;
}

function initializeAutoResizeTextareas() {
  const textareas = document.querySelectorAll("textarea");

  textareas.forEach((textarea) => {
    adjustTextareaHeight(textarea);

    textarea.addEventListener("input", function () {
      adjustTextareaHeight(this);
    });
  });
}

function adjustTextareaHeight(textarea) {
  // reset height to auto to get correct scrollheight
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

function getLocalDateString() {
  // create local date string in YYYY-MM-DD format using local timezone
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export {
  formatPhoneNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  toISODateString,
  updateDateInputDisplay,
  setupDateInput,
  initializeDateInputs,
  getLocalDateString,
  showToast,
  safeSetTextContent,
  safeUpdateChangeIndicator,
  capitalizeFirstLetter,
  getLeadName,
  showInputError,
  clearInputError,
  getErrorElement,
  formatPhoneInput,
  initializePhoneFormatting,
  restrictToDigits,
  initializeMonetaryInputs,
  initializeAutoResizeTextareas,
  adjustTextareaHeight,
};