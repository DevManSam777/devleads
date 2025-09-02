import { 
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence,
} from "./authApi.js";

// handle login form submission
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const loginContainer = document.querySelector(".login-container");
const emailInput = document.getElementById("email");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = document.getElementById("password").value;

  // clear previous error messages
  errorMessage.style.display = "none";

  const submitBtn = loginForm.querySelector(".login-btn");
  const originalButtonText = submitBtn.textContent;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
  submitBtn.disabled = true;

  // set persistence and then sign in
  setPersistence(auth, browserSessionPersistence)
    .then(() => {
      // After setting persistence, sign in with email/password
      return signInWithEmailAndPassword(auth, email, password);
    })
    .then(() => {
      // replace the current history entry with the dashboard instead of adding a new one
      window.history.replaceState(null, "", "/dashboard/home");

      // then navigate to the dashboard
      window.location.href = "/dashboard/home";
    })
    .catch((error) => {
      // reset button
      submitBtn.textContent = originalButtonText;
      submitBtn.disabled = false;

      // show error with animation
      errorMessage.textContent = getErrorMessage(error.code);
      errorMessage.style.display = "block";
      loginContainer.classList.add("shake");

      // remove animation class after it completes
      setTimeout(() => {
        loginContainer.classList.remove("shake");
      }, 500);
    });
});

// handle forgot password link
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

forgotPasswordLink.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    errorMessage.textContent = "Please enter your email address first.";
    errorMessage.style.display = "block";
    errorMessage.style.backgroundColor = "rgba(220, 53, 69, 0.08)";
    errorMessage.style.color = "#dc3545";
    return;
  }

  // clear previous messages
  errorMessage.style.display = "none";

  // disable the login button to prevent multiple submissions
  const submitBtn = loginForm.querySelector(".login-btn");
  const originalButtonText = submitBtn.textContent;
  submitBtn.textContent = "Processing...";
  submitBtn.disabled = true;

  try {
    await sendPasswordResetEmail(auth, email);

    // show success message
    errorMessage.textContent = "Password reset email sent. Check your inbox.";
    errorMessage.style.display = "block";
    errorMessage.style.backgroundColor = "rgba(40, 167, 69, 0.08)";
    errorMessage.style.color = "#28a745";
  } catch (error) {
    // show error message
    errorMessage.textContent =
      "Failed to send reset email. " + getErrorMessage(error.code);
    errorMessage.style.display = "block";
    errorMessage.style.backgroundColor = "rgba(220, 53, 69, 0.08)";
    errorMessage.style.color = "#dc3545";
  } finally {
    // re-enable the login button
    submitBtn.textContent = originalButtonText;
    submitBtn.disabled = false;
  }
});

function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Please enter a valid email address";
    case "auth/user-disabled":
      return "This account has been disabled";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again later";
    case "auth/missing-password":
      return "Please enter your password";
    default:
      return "Invalid email or password.";
  }
}

// redirect to dashboard if already logged in
// check at page load time and redirect if needed
onAuthStateChanged(auth, (user) => {
  if (user) {
    // user is already logged in
    console.log("User already authenticated:", user.email);

    // replace the current history entry with the dashboard instead of adding a new one
    window.history.replaceState(null, "", "/dashboard/home");

    // then navigate to the dashboard
    window.location.href = "/dashboard/home";
  } else {
    // user is not logged in, stay on login page
    console.log("User not authenticated, staying on login page");

    // ensure any back navigation from protected pages redirects back to login
    const referrer = document.referrer;
    if (referrer && referrer.includes("/dashboard")) {
      // we got here from a protected page, make sure to replace state to prevent back navigation
      window.history.replaceState(null, "", "/login");
    }
  }
});