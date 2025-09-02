const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const seederLogic = require("./utils/seeder");
const leadRoutes = require("./routes/leadRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const settingRoutes = require("./routes/settingRoutes");
const formRoutes = require("./routes/formRoutes");
const documentRoutes = require("./routes/documentRoutes");
const hitlistRoutes = require("./routes/hitlistRoutes");
const scraperRoutes = require("./routes/scraperRoutes");
const auth = require("./middleware/auth");

const app = express();

// force canonical domain  
// for production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    const host = req.headers.host;
    // redirect non-www to www 
    if (host === "your-domain.com") {
      return res.redirect(301, "https://www.your-domain.com" + req.originalUrl);
    }
    next();
  });
}

// CORS & API ROUTES FIRST
// special middleware just for the leads API endpoint to work with web component
app.use("/api/leads", (req, res, next) => {
  // allow requests from any origin
  res.header("Access-Control-Allow-Origin", "*");
  // allow the necessary methods
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  // allow the necessary headers
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // handle preflight requests immediately
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// use this for production
// General CORS configuration for other routes
// PRODUCTION CORS configuration - uncomment and modify for production use
// const corsOptions = {
//   origin: function (origin, callback) {
//     // List of allowed origins (add your production and development URLs)
//     const allowedOrigins = [
//       // Production URLs
//       "https://www.your-domain.com",
//       "https://your-domain.com",
//       // Development URLs
//       "http://localhost:3000",
//       "http://localhost:5000",
//       "http://127.0.0.1:5000",
//       "http://127.0.0.1:3000"
//     ];

//     // Allow requests with no origin (like mobile apps, curl requests, etc.)
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       console.log("CORS blocked origin:", origin);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true); // This will allow all origins
  },
  credentials: true,
};

app.use(cors(corsOptions));

// explicitly handle preflight requests
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "50mb" })); 

// add cache control headers for navigation protection
app.use((req, res, next) => {
  // skip cache control for your public API endpoints that need CORS support
  if (req.originalUrl.includes("/api/leads") && req.method === "POST") {
    next();
    return;
  }

  // apply cache control to all other routes
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// API routes BEFORE static/redirects
app.use("/api/leads", leadRoutes);
app.use("/api/payments", auth, paymentRoutes);
app.use("/api/settings", auth, settingRoutes);
app.use("/api/forms", auth, formRoutes);
app.use("/api/documents", auth, documentRoutes);
app.use("/api/hitlists", auth, hitlistRoutes);
app.use("/api/scraper", auth, scraperRoutes);

// security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  // this allows everything from anywhere
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
  );
  next();
});

// STATIC FILES & REDIRECTS AFTER
// serve static files from the dashboard directory with proper MIME types
app.use(
  "/dashboard",
  express.static(path.join(__dirname, "../dashboard"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      } else if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// handle login page
app.get(["/login", "/login/"], (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/index.html"));
});

// handle dashboard pages
app.get(["/dashboard", "/dashboard/"], (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/html/dashboard.html"));
});

app.get(["/dashboard/home", "/dashboard/home/"], (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/html/dashboard.html"));
});

app.get(["/dashboard/hitlists", "/dashboard/hitlists/"], (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/html/hitlists.html"));
});

app.get(["/dashboard/forms", "/dashboard/forms/"], (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/html/forms.html"));
});

app.get(["/dashboard/resources", "/dashboard/resources/"], (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/html/resources.html"));
});

app.get(["/dashboard/settings", "/dashboard/settings/"], (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/html/settings.html"));
});

// redirect root to dashboard
app.get(["/", "/index.html"], (req, res) => {
  res.redirect("/login");
});

app.get("/api", (req, res) => {
  // Only show API documentation in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }
  
  // get the PORT for URL construction
  const PORT = process.env.PORT || 5000;

  res.json({
    message: `🍕 Congratulations! Freelance Lead Management API is now running on port ${PORT}! 🍕`,
    status: "Active",
    serverInfo: {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
      apiVersion: "1.0.0",
    },

    endpoints: {
      allLeads: `${getBaseUrl(PORT)}/api/leads`,
      leadById: `${getBaseUrl(PORT)}/api/leads/:id`,
      searchLeads: `${getBaseUrl(PORT)}/api/leads/search?query=term`,
    },
    paymentEndpoints: {
      allPayments: `${getBaseUrl(PORT)}/api/payments`,
      paymentsByLead: `${getBaseUrl(PORT)}/api/payments/lead/:leadId`,
      createPayment: `${getBaseUrl(PORT)}/api/payments`,
      updatePayment: `${getBaseUrl(PORT)}/api/payments/:id`,
      deletePayment: `${getBaseUrl(PORT)}/api/payments/:id`,
    },
    settingsEndpoints: {
      allSettings: `${getBaseUrl(PORT)}/api/settings`,
      settingByKey: `${getBaseUrl(PORT)}/api/settings/:key`,
      updateSetting: `${getBaseUrl(PORT)}/api/settings/:key`,
    },
    formEndpoints: {
      allForms: `${getBaseUrl(PORT)}/api/forms`,
      formById: `${getBaseUrl(PORT)}/api/forms/:id`,
      searchForms: `${getBaseUrl(PORT)}/api/forms/search?query=term`,
      createForm: `${getBaseUrl(PORT)}/api/forms`,
      updateForm: `${getBaseUrl(PORT)}/api/forms/:id`,
      deleteForm: `${getBaseUrl(PORT)}/api/forms/:id`,
      cloneTemplate: `${getBaseUrl(PORT)}/api/forms/:id/clone`,
      generateForm: `${getBaseUrl(PORT)}/api/forms/:id/generate`,
    },
    documentEndpoints: {
      allDocumentsByLead: `${getBaseUrl(PORT)}/api/documents/lead/:leadId`,
      documentById: `${getBaseUrl(PORT)}/api/documents/:id`,
      uploadDocument: `${getBaseUrl(PORT)}/api/documents/lead/:leadId`,
      deleteDocument: `${getBaseUrl(PORT)}/api/documents/:id`,
    },
    hitlistEndpoints: {
      allHitlists: `${getBaseUrl(PORT)}/api/hitlists`,
      hitlistById: `${getBaseUrl(PORT)}/api/hitlists/:id`,
      createHitlist: `${getBaseUrl(PORT)}/api/hitlists`,
      updateHitlist: `${getBaseUrl(PORT)}/api/hitlists/:id`,
      deleteHitlist: `${getBaseUrl(PORT)}/api/hitlists/:id`,
      businessesByHitlist: `${getBaseUrl(
        PORT
      )}/api/hitlists/:hitlistId/businesses`,
      createBusiness: `${getBaseUrl(PORT)}/api/hitlists/:hitlistId/businesses`,
      updateBusiness: `${getBaseUrl(PORT)}/api/hitlists/businesses/:id`,
      deleteBusiness: `${getBaseUrl(PORT)}/api/hitlists/businesses/:id`,
    },
    documentation: {
      description: "LEADS REST API",
      endpoints: [
        // lead endpoints
        {
          method: "GET",
          path: "/api/leads",
          description: "Get all leads (with optional filters and pagination)",
          parameters: [
            {
              name: "page",
              type: "integer",
              description: "Page number for pagination",
              required: false,
            },
            {
              name: "limit",
              type: "integer",
              description: "Number of leads per page",
              required: false,
            },
            {
              name: "sort",
              type: "string",
              description: "Sort order (e.g., 'createdAt', '-name')",
              required: false,
            },
            {
              name: "status",
              type: "string",
              description: "Filter by lead status",
              required: false,
            },
          ],
          response: "Array of lead objects",
        },
        {
          method: "GET",
          path: "/api/leads/:id",
          description: "Get lead by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the lead",
              required: true,
            },
          ],
          response: "Lead object",
        },
        {
          method: "POST",
          path: "/api/leads",
          description: "Create a new lead",
          requestBody: "Lead object in JSON format",
          response: "Newly created lead object",
        },
        {
          method: "PUT",
          path: "/api/leads/:id",
          description: "Update a lead",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the lead to update",
              required: true,
            },
          ],
          requestBody: "Updated lead object in JSON format",
          response: "Updated lead object",
        },
        {
          method: "DELETE",
          path: "/api/leads/:id",
          description: "Delete a lead",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the lead to delete",
              required: true,
            },
          ],
          response: "Success message or error",
        },
        {
          method: "GET",
          path: "/api/leads/search?query=term",
          description: "Search leads by keyword",
          parameters: [
            {
              name: "query",
              type: "string",
              description: "Search term",
              required: true,
            },
          ],
          response: "Array of matching lead objects",
        },

        // payment endpoints
        {
          method: "GET",
          path: "/api/payments",
          description:
            "Get all payments (with optional filters and pagination)",
          parameters: [
            {
              name: "page",
              type: "integer",
              description: "Page number for pagination",
              required: false,
            },
            {
              name: "limit",
              type: "integer",
              description: "Number of payments per page",
              required: false,
            },
            {
              name: "sort",
              type: "string",
              description: "Sort order (e.g., 'createdAt', '-amount')",
              required: false,
            },
            {
              name: "status",
              type: "string",
              description: "Filter by payment status",
              required: false,
            },
          ],
          response: "Array of payment objects",
        },
        {
          method: "GET",
          path: "/api/payments/lead/:leadId",
          description: "Get payments for a specific lead",
          parameters: [
            {
              name: "leadId",
              type: "string",
              description: "ID of the lead",
              required: true,
            },
          ],
          response: "Array of payment objects for the lead",
        },
        {
          method: "POST",
          path: "/api/payments",
          description: "Create a new payment",
          requestBody: "Payment object in JSON format",
          response: "Newly created payment object",
        },
        {
          method: "PUT",
          path: "/api/payments/:id",
          description: "Update a payment",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the payment to update",
              required: true,
            },
          ],
          requestBody: "Updated payment object in JSON format",
          response: "Updated payment object",
        },
        {
          method: "DELETE",
          path: "/api/payments/:id",
          description: "Delete a payment",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the payment to delete",
              required: true,
            },
          ],
          response: "Success message or error",
        },

        // settings endpoints
        {
          method: "GET",
          path: "/api/settings",
          description: "Get all settings",
          response: "Array of setting objects",
        },
        {
          method: "GET",
          path: "/api/settings/:key",
          description: "Get setting by key",
          parameters: [
            {
              name: "key",
              type: "string",
              description: "Key of the setting",
              required: true,
            },
          ],
          response: "Setting object",
        },
        {
          method: "PUT",
          path: "/api/settings/:key",
          description: "Update a setting",
          parameters: [
            {
              name: "key",
              type: "string",
              description: "Key of the setting to update",
              required: true,
            },
          ],
          requestBody:
            "Updated setting value in JSON format (e.g., { value: 'new value' })",
          response: "Updated setting object",
        },
        // form endpoints
        {
          method: "GET",
          path: "/api/forms",
          description: "Get all forms (with optional filters and pagination)",
          parameters: [
            {
              name: "page",
              type: "integer",
              description: "Page number for pagination",
              required: false,
            },
            {
              name: "limit",
              type: "integer",
              description: "Number of forms per page",
              required: false,
            },
            {
              name: "sort",
              type: "string",
              description: "Sort order (e.g., 'createdAt', '-name')",
              required: false,
            },
          ],
          response: "Array of form objects",
        },
        {
          method: "GET",
          path: "/api/forms/:id",
          description: "Get form by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the form",
              required: true,
            },
          ],
          response: "Form object",
        },
        {
          method: "POST",
          path: "/api/forms",
          description: "Create a new form",
          requestBody: "Form object in JSON format",
          response: "Newly created form object",
        },
        {
          method: "PUT",
          path: "/api/forms/:id",
          description: "Update a form",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the form to update",
              required: true,
            },
          ],
          requestBody: "Updated form object in JSON format",
          response: "Updated form object",
        },
        {
          method: "DELETE",
          path: "/api/forms/:id",
          description: "Delete a form",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the form to delete",
              required: true,
            },
          ],
          response: "Success message or error",
        },
        {
          method: "GET",
          path: "/api/forms/search?query=term",
          description: "Search forms by keyword",
          parameters: [
            {
              name: "query",
              type: "string",
              description: "Search term",
              required: true,
            },
          ],
          response: "Array of matching form objects",
        },
        {
          method: "POST",
          path: "/api/forms/:id/clone",
          description: "Clone a template form",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the template form to clone",
              required: true,
            },
          ],
          response: "Cloned form object",
        },
        {
          method: "POST",
          path: "/api/forms/:id/generate",
          description: "Generate form with lead data",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the form to generate",
              required: true,
            },
          ],
          requestBody: "Lead data object in JSON format",
          response: "Generated form data object",
        },
        // documents (pdf uploads) endpoints
        {
          method: "GET",
          path: "/api/documents/lead/:leadId",
          description: "Get all documents associated with a specific lead.",
          parameters: [
            {
              name: "leadId",
              type: "string",
              description: "Unique ID of the lead",
              required: true,
            },
          ],
          response: "JSON array of document metadata objects.",
          exampleResponse:
            "[{ _id: '...', lead: ':leadId', filename: '...', uploadDate: '...', size: '...', mimetype: '...', url: '...' }]", // Example placeholder
        },
        {
          method: "GET",
          path: "/api/documents/:id",
          description:
            "Retrieve or download a specific document by its unique ID.",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "Unique ID of the document",
              required: true,
            },
          ],
          response:
            "File content or a redirect to the file's storage location.",
          exampleResponse: "Binary file data (e.g., PDF, image) or a redirect.",
        },
        {
          method: "POST",
          path: "/api/documents/lead/:leadId",
          description: "Upload a new document for a specific lead.",
          parameters: [
            {
              name: "leadId",
              type: "string",
              description:
                "Unique ID of the lead to associate the document with",
              required: true,
            },
          ],
          requestBody: {
            type: "multipart/form-data", // File uploads typically use multipart/form-data
            description: "Form data containing the file to upload.",
            schema:
              "File data under a specific form field name (e.g., 'document')", 
          },
          response:
            "JSON object confirming the upload and returning document metadata.",
          exampleResponse:
            "{ message: 'Document uploaded successfully', document: { _id: '...', filename: '...', ... } }", 
        },
        {
          method: "DELETE",
          path: "/api/documents/:id",
          description: "Delete a specific document by its unique ID.",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "Unique ID of the document to delete",
              required: true,
            },
          ],
          response: "JSON success message or error.",
          exampleResponse: "{ message: 'Document deleted successfully' }",
        },
        // hitlist endpoints
        {
          method: "GET",
          path: "/api/hitlists",
          description: "Get all hitlists",
          response: "Array of hitlist objects",
        },
        {
          method: "GET",
          path: "/api/hitlists/:id",
          description: "Get specific hitlist by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the hitlist",
              required: true,
            },
          ],
          response: "Hitlist object",
        },
        {
          method: "POST",
          path: "/api/hitlists",
          description: "Create a new hitlist",
          requestBody: "Hitlist object in JSON format",
          response: "Newly created hitlist object",
        },
        {
          method: "PUT",
          path: "/api/hitlists/:id",
          description: "Update a hitlist",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the hitlist to update",
              required: true,
            },
          ],
          requestBody: "Updated hitlist object in JSON format",
          response: "Updated hitlist object",
        },
        {
          method: "DELETE",
          path: "/api/hitlists/:id",
          description: "Delete a hitlist",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the hitlist to delete",
              required: true,
            },
          ],
          response: "Success message or error",
        },
        {
          method: "GET",
          path: "/api/hitlists/:hitlistId/businesses",
          description: "Get all businesses for a specific hitlist",
          parameters: [
            {
              name: "hitlistId",
              type: "string",
              description: "ID of the hitlist",
              required: true,
            },
          ],
          response: "Array of business objects",
        },
        {
          method: "POST",
          path: "/api/hitlists/:hitlistId/businesses",
          description: "Create a new business for a hitlist",
          parameters: [
            {
              name: "hitlistId",
              type: "string",
              description: "ID of the hitlist",
              required: true,
            },
          ],
          requestBody: "Business object in JSON format",
          response: "Newly created business object",
        },
        {
          method: "PUT",
          path: "/api/hitlists/businesses/:id",
          description: "Update a business",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the business to update",
              required: true,
            },
          ],
          requestBody: "Updated business object in JSON format",
          response: "Updated business object",
        },
        {
          method: "DELETE",
          path: "/api/hitlists/businesses/:id",
          description: "Delete a business",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the business to delete",
              required: true,
            },
          ],
          response: "Success message or error",
        },
      ],
    },
  });
});

// helper function to get the base URL for examples
function getBaseUrl(port) {
  const isProduction = process.env.NODE_ENV === "production";
  return isProduction
    ? "https://www.your-domain.com"
    : `http://localhost:${port}`;
}

// this function ensures the correct sequence: Connect -> Seed -> Start Server
async function startServer() {
  try {
    // connect to the database and returns a Promise
    await connectDB(); // await the database connection to complete

    console.log("MongoDB connection established by connectDB function.");

    // after successful database connection, run the initial seeding logic
    // the seedFormsIfFirstRun function is designed to only seed if necessary based on the flag/existing data
    await seederLogic.seedFormsIfFirstRun(); // Call the seeder function from the imported module

    // start the Express server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(
        `Freelance Lead Management API is now running on port ${PORT}`
      );
    });
  } catch (err) {
    console.error("FATAL ERROR: Server initialization failed:", err);
    // exit the process if database connection or server start fails
    process.exit(1);
  }
}

// call the main server startup function to initiate the process
startServer();
