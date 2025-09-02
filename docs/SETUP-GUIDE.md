# DevLeads Setup Guide

Complete step-by-step guide to deploy your own DevLeads instance.

**→ [README](../README.md)** - Main project overview and introduction

**→ [Features Guide](./FEATURES.md)** - Learn what DevLeads can do after setup

## Table of Contents

1. [Quick Start Checklist](#quick-start-checklist)
2. [Prerequisites](#prerequisites)
3. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
4. [Authentication Setup (Firebase)](#authentication-setup-firebase)
5. [Email Setup (Optional)](#email-setup-optional-but-highly-recommended)
6. [Repository Setup](#repository-setup)
7. [Environment Configuration](#environment-configuration)
8. [Installation & Development](#installation--development)
9. [Customization Guide](#customization-guide)
10. [Create Your GitHub Repository](#create-your-github-repository)
11. [Web Forms Integration (Optional)](#web-forms-integration-optional-but-highly-recommended)
12. [Production Deployment](#production-deployment)
13. [Configuration Checklist](#configuration-checklist)
14. [Troubleshooting](#troubleshooting)

---

## Quick Start Checklist

- [ ] Create MongoDB Atlas account and cluster
- [ ] Create Firebase project and setup authentication
- [ ] Clone repository and install dependencies
- [ ] Set up .gitignore file for security
- [ ] Configure environment variables
- [ ] Update Firebase configuration in frontend
- [ ] Customize email templates
- [ ] Test application locally
- [ ] Deploy to production
- [ ] Add web forms to website (optional)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- **Text editor** (VS Code recommended)

**Accounts needed:**

- [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available)
- [Firebase](https://console.firebase.google.com) (free tier available)
- Email account with SMTP access (optional but **highly** recommended)

---

## Database Setup (MongoDB Atlas)

### Step 1: Create Account and Cluster

1. **Visit [MongoDB Atlas](https://www.mongodb.com/atlas)** and click **"Get Started"**:

![Get Started](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_Atlas_get_started_updated.png)

2. **Fill out the signup form** and create your free account:

![Sign up form](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_Atlas_signup_form.png)

3. **Set up Multi-Factor Authentication** (recommended for security):
   - Verify your email address first
   - Choose your preferred MFA method

![MFA Setup](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_Atlas_mfa_setup.png)

4. **Complete the welcome questionnaire**:
   - **Primary goal**: Select "Build a project I have in mind"
   - **MongoDB experience**: Select your experience level
   - **Programming language**: Choose "JavaScript / Node.js"
   - Fill in other details as appropriate

![Welcome questionnaire](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_Atlas_questionnaire.png)

5. **Create your first cluster** by clicking the **"Create"** button:

![Create cluster](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_Atlas_create_cluster_button.png)

6. **Deploy your cluster** - Choose the **Free** tier:
   - Select **"Free"** cluster option
   - **Provider**: Choose your preferred cloud provider
   - **Region**: Choose the region closest to your users
   - **Cluster Name**: Use the default name or choose your own
   - Click **"Create Deployment"**

![Deploy cluster](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_Atlas_deploy_cluster.png)

7. **Set up security** - You'll be prompted to create a database user and configure network access:

![Security quickstart](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_Atlas_security_quickstart.png)

   - **Username**: Choose a username
   - **Password**: Use the auto-generated password or create your own
   - **⚠️ Important**: Copy and save this password - you'll need it for your connection string
   - Click **"Create Database User"**

8. **Your cluster will be created** (this takes 1-3 minutes)

### Step 2: Get Connection String

1. **Choose connection method** - Click **"Choose a connection method"**:

![Choose connection method](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_Atlas_choose_connection.png)

2. **Select "Drivers"** to connect your application:

![Select Drivers](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_Atlas_drivers_connection.png)

3. **Copy the connection string**:
   - **Driver**: Node.js
   - **Version**: 4.1 or later (should be selected by default)

![Connection String](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_Atlas_connection_string.png)

4. **Copy and save the connection string** - you'll need this for your `.env` file
   - The connection string format will be: `mongodb+srv://username:password@cluster.mongodb.net/`
   - Save this complete connection string for later use in `.env`

### Step 3: Configure Network Access

1. **Go to Network Access** in the left sidebar

![Network Access tab](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_network_access1.png)

2. **Add IP Address**:

![Add IP address](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_add_an_IP_address.png)

   - For development: Add `0.0.0.0/0` (allows access from anywhere)
   - For production: Add your server's specific IP addresses

   ![Set IP](../dashboard/assets/devleads_setup_images/mongodb/MongoDB_add_IP_access.png)
3. **Confirm**

4. **You can now sign out of MongoDB Atlas**

---

## Authentication Setup (Firebase)

### Step 1: Create Firebase Project

1. **Go to [Firebase Console](https://console.firebase.google.com)** and click **"Go to console"**:

![Firebase Homepage](../dashboard/assets/devleads_setup_images/firebase/firebase_homepage.png)

2. **Create a project**:
   - Project name: Choose your project name
   - Continue through setup wizard

![Get started](../dashboard/assets/devleads_setup_images/firebase/firebase_get_started.png)

![Create project](../dashboard/assets/devleads_setup_images/firebase/firebase_create_project.png)

![Disable Gemini](../dashboard/assets/devleads_setup_images/firebase/firebase_disable_gemini.png)

![Disable Google Analytics](../dashboard/assets/devleads_setup_images/firebase/firebase_create_and_disable_google_analytics.png)

3. **Your Firebase project is ready**:

![Project Ready](../dashboard/assets/devleads_setup_images/firebase/firebase_project_ready.png)

### Step 2: Get Web App Configuration

1. **Project Settings** (Get Started By Adding Firebase to Your App) → **Web '</>'** 

![Get started by adding firebase to your app](../dashboard/assets/devleads_setup_images/firebase/firebase_choose_web.png)

2. **Register app**:
   - Pick an App nickname: e.g. "DevLeads Web"
   - Don't check hosting checkbox 

   ![Register app](../dashboard/assets/devleads_setup_images/firebase/firebase_register_app.png)
   
3. **Copy the config object**
   - Copy the Firebase configuration public facing keys locally 
     (you'll need this later for `dashboard/js/authApi.js`):
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id",
     measurementId: "your-measurement-id",
   };
   ```

   ![Copy public keys](../dashboard/assets/devleads_setup_images/firebase/firebase_copy_pub_keys.png)

4. **Continue to console**
   - Click the 'Continue to console' button

### Step 3: Setup Authentication

1. **Go to Authentication** → **Get Started**

![Click Authentication](../dashboard/assets/devleads_setup_images/firebase/firebase_click_auth.png)

![Get Started with Authentication](../dashboard/assets/devleads_setup_images/firebase/firebase_auth_get_started.png)

2. **Sign-in method** tab → **Email/Password**:
   - Enable **Email/Password**

![Select Email/Password](../dashboard/assets/devleads_setup_images/firebase/firebase_select_email_password.png)

![Enable Email/Password](../dashboard/assets/devleads_setup_images/firebase/firebase_enable_email_password.png)

3. **Users** tab → Add your first user

![Add User](../dashboard/assets/devleads_setup_images/firebase/firebase_add_user.png)

![Add firt user](../dashboard/assets/devleads_setup_images/firebase/firebase_add_first_user.png)

![Set email/password](../dashboard/assets/devleads_setup_images/firebase/firebase_set_email_password.png)

### Step 4: Generate Service Account Key

1. **Project Settings** → **Service accounts** tab

![Click gear icon](../dashboard/assets/devleads_setup_images/firebase/firebase_generate_key1.png)

2. **Generate new private key** → **Generate key**

![alt text](../dashboard/assets/devleads_setup_images/firebase/firebase_generate_key2.png)

![Service Account Page](../dashboard/assets/devleads_setup_images/firebase/firebase_generate_key4_new.png)

![Generate Key Dialog](../dashboard/assets/devleads_setup_images/firebase/firebase_generate_key3_new.png)

3. **Download the JSON file** (keep it secure!)
   - These will go in .env later

4. **Extract these values** from the JSON file:
   - `project_id`
   - `private_key_id`
   - `private_key`
   - `client_email`
   - `client_id`
   - `auth_uri`
   - `token_uri`
   - `auth_provider_x509_cert_url`
   - `client_x509_cert_url`
   - `universe_domain`

5. **You can now sign out of the Firebase Console**
---

## Email Setup (Optional but highly recommended)

Email notifications are optional but highly recommended for lead management. It is set up to work seamlessly with the [web form](#web-forms-integration-optional-but-highly-recommended) web components provided later on in this document. Both you and the person submitting the form are sent email confirmations.

### Understanding Email Password (EMAIL_PASS)

#### What is EMAIL_PASS?

The `EMAIL_PASS` field is where you put your email account's authentication credentials. This is not your regular login password for your email.

**App Password**

- A special password generated specifically for applications
- More secure than your main account password
- Required for two-factor authentication
- Unique to each application you connect

#### How to Get the Right Password

**For Most Email Providers**:

1. Log into your email account settings
2. Find the security or app passwords section
3. Enable two-factor authentication (if not already active)
4. Generate an app-specific password
5. Select "Mail" or "SMTP" as the application type
6. Copy the generated password
7. Use THIS password in EMAIL_PASS

**Specific Provider Examples**:

- **Gmail**:

  1. Go to Google Account > Security
  2. Enable 2-Step Verification
  3. Go to "App passwords"
     **https://myaccount.google.com/apppasswords**
  4. Generate a 16-character password
  5. Save password for use in .env

- **Outlook/Office 365**:
  1. Go to Microsoft Account security settings
  2. Look for "App passwords" or "Additional security"
  3. Generate an app-specific password
  4. Save password for .env

### Email Provider Settings 

**Gmail (for .env):**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Outlook (for .env):**

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-outlook@outlook.com
EMAIL_PASS=your-app-password
```

### Finding Your SMTP Settings

#### How to Get Accurate SMTP Details

1. Check your email provider's official documentation
2. Contact your email provider's support
3. Look for these key pieces of information:
   - SMTP Server Address
   - Port Number (usually 587 or 465)
   - Whether SSL/TLS is required

#### Common Providers' Documentation

- **Gmail**: Google Workspace SMTP Settings
- **Outlook/Office 365**: Microsoft SMTP Configuration
- **Other Providers**: Check their support websites

---

## Repository Setup

### Step 1: Clone the Repository

**Open your terminal/command prompt** and navigate to where you want the project saved locally, then run:

```bash
# Clone the repository
git clone <your-repo-url>
cd devleads
```

### Step 2: Set Up Git Protection

**Important:** Create a `.gitignore` file in your project root to protect sensitive data:

1. **Create a new file** called `.gitignore` in the project root directory
2. **Copy and paste** the following content into the file:

```
# Dependency directories
node_modules/
/server/node_modules/

# Environment variables
/.env

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Mac system files
.DS_Store

# Editor directories and files
.idea/
.vscode/
*.swp
*.swo
```

3. **Save the file**

This prevents accidentally committing sensitive environment variables, dependencies, and system files to your repository.

### Step 3: Install Dependencies

**In your terminal/command prompt**, run:

```bash
# Install server dependencies
cd server
npm install
cd ..
```

---

## Environment Configuration

### Step 1: Copy Environment Template

**In your terminal/command prompt** (make sure you're in the project root directory), run:

```bash
# From the project root directory
cp .env.example .env
```

### Step 2: Configure .env File

Open `.env` and replace placeholders with your values from MongoDB Atlas, the Firebase JSON, and your email app password:

```env
# ===== DATABASE =====
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/devleads

# ===== SERVER =====
PORT=5000
NODE_ENV=development

# ===== FIREBASE ADMIN SDK =====
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/project/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com

# ===== EMAIL NOTIFICATIONS (OPTIONAL) =====
ADMIN_EMAIL=your-admin-email@example.com
EMAIL_FROM=your-sending-email@example.com
EMAIL_USER=your-sending-email@example.com
EMAIL_PASS=your-app-specific-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**Important Notes:**

- ⚠️ Never commit the `.env` file to version control
- **FIREBASE_PRIVATE_KEY**: Copy the entire private key value from the JSON file, including the quotation marks and everything between them (e.g., `"-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"`)
- The `FIREBASE_PRIVATE_KEY` should include the `\n` characters for line breaks
- Email settings are optional - the app works without them but it is highly recommended

---

## Installation & Development

### Step 1: Update Frontend Firebase Config

Edit `dashboard/js/authApi.js` and replace the `firebaseConfig` object with your Firebase web app configuration (these are public facing keys and they are ok to expose. These are different from the Firebase SDK keys from the JSON file that you added to the .env):

```javascript
// Replace this object with your Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id",
};
```

### Step 2: Start Development Server

**In your terminal/command prompt**, run:

```bash
# From the server directory
cd server
npm run dev
```

### Step 3: Access the Application

- **Login**: http://localhost:5000/login
- **Dashboard**: http://localhost:5000/dashboard
- **API Documentation**: http://localhost:5000/api

### Step 4: Seed Form Templates

DevLeads includes starter form templates for contracts, proposals, and invoices. **In your terminal/command prompt** (from the server directory), run:

```bash
# From the server directory
npm run seed:reset
```

This adds default form templates without affecting any existing data.

**Available seeding options:**

- `npm run seed:reset` - Adds missing default templates (safe, preserves existing forms)
- `npm run seed:force` - Replaces all templates with defaults (WARNING: deletes existing forms)

**Note:** You can run these commands anytime in the future from the server directory if you need to add or reset form templates.

![Command line form seeding](../dashboard/assets/devleads_features/npm_run_seed.png)

### Step 5: Login for the first time

1. Navigate to http://localhost:5000/login
2. Log in using email/password you set up in firebase console
3. You should be redirected to the dashboard

![Login](../dashboard/assets/devleads_features/login_dark.png)

---

## Customization Guide

### Email Templates

1. **Business Information**: Update contact details
2. **Footer**: Update copyright and contact information
3. **Call-to-Action**: Update consultation link

### Email Template Customization

After setting up your email configuration, you'll need to customize the email templates in the [`/server/utils/emailNotification.js`](../server/utils/emailNotification.js) file:

#### Required Customizations

1. **Schedule Consultation Link** ([`emailNotification.js:444`](../server/utils/emailNotification.js#L444))

   - Replace `href="#"` with your actual scheduling URL
   - Example: `href="https://cal.com/your-business/consultation"`

2. **Support Email Address** ([`emailNotification.js:451`](../server/utils/emailNotification.js#L451))

   - Replace `your-email@example.com` with your actual support email
   - This appears in the "Questions?" section of confirmation emails

3. **Business Name** ([`emailNotification.js:456`](../server/utils/emailNotification.js#L456))
   - Replace `Your Business Name` with your actual business name
   - This appears in the footer copyright section

#### Style Customization Warning

⚠️ **Caution**: The email templates use inline CSS for maximum email client compatibility. While you can modify the existing styles, be aware that:

- The current styles have been tested and are optimized for responsiveness
- Email clients have limited CSS support
- Inline styles are more reliable than external stylesheets
- Test thoroughly across different email clients if you make style changes
- Consider using email testing tools before deploying style modifications

1. **Client Form Submission Confirmation Email**

   - ![Client Email](../dashboard/assets/confirmation_emails/client_confirmation_email.png)

2. **Developer Form Submission Confirmation Email**

   - ![Dev Email](../dashboard/assets/confirmation_emails/developer_confirmation_email.png)

---

### Important Warnings

- Do NOT use your regular account password
- Keep your .env file PRIVATE
- Never commit .env to version control
- The .gitignore file should already prevent .env from being shared

### Troubleshooting

- Double-check ALL settings
- Verify app password is copied correctly
- Ensure two-factor authentication is enabled
- Confirm SMTP settings with your email provider

### Want to Skip Email Notifications?

Simply do not add your email and SMTP information to the .env file. The app will work normally. (Not Recommended)

---

## Create Your GitHub Repository

Now that you have fully configured and tested your DevLeads application, you need to create your own GitHub repository and push your customized code there. This is required for deployment.

### Step 1: Create New GitHub Repository

1. **Go to [GitHub](https://github.com)** and sign in
2. **In the upper-right corner**, select the **"+"** dropdown menu and click **"New repository"**
3. **Repository settings**:
   - Use the **Owner** dropdown to select the account that will own the repository
   - Repository name: `devleads` (or your preferred name)
   - Description: "Professional Lead and Project Management System"
   - Choose repository visibility: **Private** (recommended) or **Public**
   - **Do NOT** check any boxes to initialize with README, .gitignore, or license (you already have these)
4. **Click "Create repository"**

### Step 2: Connect Your Local Repository

**In your terminal/command prompt**, run:

```bash
# Add your new repository as the remote origin
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Verify the remote was added correctly
git remote -v
```

### Step 3: Commit Your Configuration

**In your terminal/command prompt**, run:

```bash
# Add all your configured files
git add .

# Commit your customized setup
git commit -m "Initial DevLeads setup with custom configuration

- Added MongoDB Atlas connection
- Configured Firebase authentication
- Set up environment variables
- Customized email templates and branding
- Added web forms integration (if applicable)
- Ready for deployment"

# Push to your repository
git push -u origin main
```

**Important Notes:**

- Your `.env` file will NOT be pushed (protected by `.gitignore`)
- Only your configuration files and customizations will be uploaded
- This repository will be used for deployment in the next steps
- Keep your repository private if it contains any sensitive configuration
- You now have your own copy of DevLeads ready for deployment!

---

## Web Forms Integration (Optional but highly recommended)

After your DevLeads application is deployed, you can add web forms to your website to automatically capture leads. The styles are customizable, light and dark mode support, and quick and easy to embed in any website.

### Choose Your Web Form

**Need a simple contact form?** → Use **Minimalist Contact Form**  
**Need detailed business inquiries?** → Use **Full Web Inquiry Form**

### Option 1: Minimalist Contact Form

![Min form](../dashboard/assets/contact_forms/minimal_form/min_form.png)

**Basic Setup:**

```html
<script
  src="https://raw.githack.com/DevManSam777/minimalist-contact-form/main/contact-form.js"
  defer
></script>
<contact-form endpoint="https://your-devleads-api.com/api/leads"></contact-form>
```

**Repository**: https://github.com/DevManSam777/minimalist-contact-form  
_See the README for customization options and styling guidance_

### Option 2: Full Web Inquiry Form

![Full form](../dashboard/assets/contact_forms/full_form/form1.png)

**Basic Setup:**

```html
<script
  src="https://raw.githack.com/DevManSam777/web_inquiry_form/main/web-inquiry-form.js"
  defer
></script>
<web-inquiry-form
  api-url="https://your-devleads-api.com/api/leads"
></web-inquiry-form>
```

**Repository**: https://github.com/DevManSam777/web_inquiry_form  
_See the README for customization options and styling guidance_

### Important Notes

- Replace `https://your-devleads-api.com` with your actual DevLeads deployment URL
  - Don't forget to append API end point `/api/leads` to the end of your URL
- Ensure CORS is configured in your DevLeads application for your website domain
- Forms will automatically create new leads in your DevLeads dashboard
- Email notifications will be sent (if configured) for new form submissions

---

## Production Deployment

### Recommended Platforms

#### Render (Recommended)

1. **Connect GitHub repository** to Render
2. **CRITICAL: Choose Docker Environment**
   - When creating the web service, select **"Docker"** as the environment
   - ⚠️ **Do NOT choose Node.js** - Business Finder requires Chrome (only available in Docker)
3. **Set environment variables** in Render dashboard (Environment tab)
   - **Create production `.env`**:

   ```env
   NODE_ENV=production
   # Update MongoDB URI for production if different
   # Set all other variables
   ```

   -  **⚠️ IMPORTANT**: For security, the API documentation endpoint (`/api`) is only accessible in development mode. Setting `NODE_ENV=production` in your environmental variables for your deployed version will automatically disable API documentation access in your production deployment.

4. **Configure auto-deploy** on commits
5. **Deploy**:
   - Click "Create Web Service"
   - Render builds your Docker image automatically
   - First deployment takes 5-10 minutes
   - Subsequent deployments are faster due to layer caching

**Important Render Considerations:**

**RECOMMENDED: Upgrade to a paid plan for persistent storage and no sleep mode.**

**Free Tier Limitations:**

- Apps sleep after 15 minutes of inactivity (causes ~50 second cold start)
- 750 hours/month of runtime total for ALL projects, not EACH
- No persistent disk storage on free tier

**Free Tier Pro-Tip:** If you are absolutely unable to afford a paid account, as a last resort you can use [cron-job.org](https://cron-job.org) to send an HTTP request to your app every 10 minutes to prevent it from spinning down due to inactivity (use at your own risk)

#### Other Options

- **Railway**: Simple deployment with GitHub integration
- **Heroku**: Use Heroku CLI or GitHub integration
- **DigitalOcean**: App Platform or Droplets
- **Vercel**: For frontend, separate backend deployment needed
- **Netlify**: For frontend, separate backend deployment needed

<small>- Again, I recommend Render for monolithic deployments such as this</small>

### Domain Configuration

#### After deployment

1. **Update server/server.js**:

   ```javascript
   if (host === "your-domain.com") {
     return res.redirect(301, "https://www.your-domain.com" + req.originalUrl);
   }
   ```

2. **Update CORS settings** for production domains
3. **Configure Firebase authorized domains**

---

## Configuration Checklist

Use this checklist to ensure your DevLeads application is properly configured before and after deployment.

### Pre-Setup Requirements

- [ ] Node.js v16+ installed
- [ ] Git installed
- [ ] Text editor ready
- [ ] MongoDB Atlas account created
- [ ] Firebase account created

### Database Setup

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 for development)
- [ ] Connection string obtained and tested
- [ ] Database name added to connection string

### Firebase Setup

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Web app configuration obtained
- [ ] Service account key downloaded
- [ ] All required values extracted from service account JSON

### Environment Configuration

- [ ] `.env.example` copied to `.env`
- [ ] `MONGO_URI` configured with your connection string
- [ ] All `FIREBASE_*` variables configured
- [ ] `PORT` and `NODE_ENV` set appropriately
- [ ] Email variables configured (if using email notifications)

### Repository Setup

- [ ] Repository cloned successfully
- [ ] `.gitignore` file created in project root
- [ ] `.env` file added to .gitignore
- [ ] `node_modules/` directories added to .gitignore
- [ ] Server dependencies installed (`npm install` in server directory)
- [ ] Sensitive files protected from version control

### Frontend Configuration

- [ ] Firebase config updated in `dashboard/js/authApi.js`
- [ ] API public keys replaced with your values

### Application Customization

- [ ] Business name updated in email templates
- [ ] Contact email updated in email templates
- [ ] Consultation link updated in email templates
- [ ] Domain references updated for production

### Testing

- [ ] Server starts (`npm run dev`)
- [ ] Can access login page (http://localhost:5000/login)
- [ ] Can log in successfully
- [ ] Can create a test lead
- [ ] Business form templates are seeded
- [ ] Business Finder works from hitlists page

### Production Preparation

- [ ] Environment variables set for production on Render (or where you deploy to)
- [ ] CORS settings updated for production domains
- [ ] Firebase authorized domains updated
- [ ] Database connection tested in production environment

### Web Forms Integration Checklist

- [ ] DevLeads application deployed and accessible
- [ ] CORS configured for website domain(s)
- [ ] Chosen appropriate web form type (Minimalist vs Full)
- [ ] Web component form script added to website
- [ ] Web component custom element added to HTML of your website with correct endpoint URL
- [ ] Test form submission creates leads in DevLeads
- [ ] Email notifications working for form submissions

### Security Verification

- [ ] `.env` file is in `.gitignore`
- [ ] No sensitive data committed to version control
- [ ] Production uses HTTPS

### Post-Deployment

- [ ] Application accessible at production URL
- [ ] All features tested in production
- [ ] Email notifications working
- [ ] Database backups configured
- [ ] Monitoring/logging set up
- [ ] Domain SSL certificate valid

### Troubleshooting Checklist

If something isn't working:

- [ ] Check browser console for JavaScript errors
- [ ] Check server logs in terminal
- [ ] Verify all environment variables are set
- [ ] Test database connection separately
- [ ] Verify Firebase configuration matches console
- [ ] Check network connectivity
- [ ] Validate CORS settings
- [ ] Test with fresh browser session (incognito)

### Common Configuration Mistakes

**Avoid these common issues:**

1. **Firebase Config Mismatch**: Ensure frontend config matches Firebase Console exactly
2. **MongoDB URI Format**: Include database name at the end of connection string
3. **Private Key Format**: FIREBASE_PRIVATE_KEY must include \n characters
4. **Email Passwords**: Use app-specific passwords, not account passwords
5. **CORS Origins**: Production origins must match exactly (including https://)
6. **Environment Variables**: Restart server after changing .env file
7. **Firebase Domains**: Add production domain to Firebase authorized domains
8. **MongoDB**: Add production domain to MongoDB authorized domains

---

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed

- Verify connection string format
- Check username/password
- Confirm IP address is whitelisted
- Disable VPN (if using one)
- Test connection with MongoDB Compass

#### Firebase Authentication Issues

- Verify `authApi.js` config matches Firebase Console
- Check authorized domains in Firebase Console
- Ensure Authentication is enabled

#### Email Not Working

- Verify SMTP settings
- Verify web form is using correct API endpoint URL
- Use app-specific passwords, not account passwords
- Test credentials with email client first
- Check spam folder

#### CORS Errors

- Check server CORS configuration
- Verify allowed origins include your domain
- Test API endpoints with Postman

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

### Getting Help

1. Check browser console for errors
2. Check server logs in terminal
3. Verify all environment variables are set
4. Test individual components separately

---

Congratulations! Your DevLeads application should now be ready for use.
