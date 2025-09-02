# DevLeads - Professional Lead and Project Management System

A comprehensive lead and project management application built with Node.js, Express, MongoDB, and Firebase Authentication. Features a powerful dashboard for managing leads, forms, payments, business hitlists, developer resources, and document management with analytics and visualizations.  

Includes automated email notifications, quick integration of embeddable contact form web components, and native Business Finder for automated lead generation.  

Deployed via Docker for reliable, scalable production hosting.

![DevLeads light](./dashboard/assets/devleads_features/analytics_light.png)

![DevLeads dark](./dashboard/assets/devleads_features/analytics_dark.png)

## Ready to Get Started?

**→ [Setup Guide](docs/SETUP-GUIDE.md)** - Complete setup instructions to get DevLeads running

**→ [Features Guide](docs/FEATURES.md)** - Learn what DevLeads can do

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Overview](#quick-overview)
- [Live Demo](#live-demo)
- [License](#license)

## Key Features

### Complete Lead Management
- Track leads from inquiry to project completion
- Advanced search, filtering, and status management
- Automated email notifications and confirmations for web form submissions
- Document management with PDF uploads
- Import/Export of business hitlists
= Export of single or bulk leads

### Professional Form Builder
- Create contracts, proposals, invoices with built-in Markdown editor
- Dynamic templates with variable substitution
- PDF or Markdown export and professional document generation using client info
- Customizable business form templates

### Financial Tracking
- Monitor project payments and balances
- Revenue analytics and financial reporting
- Payment status tracking
- Month-over-month performance metrics

### Web Forms Integration
- **Minimalist Contact Form**: Simple lead capture
- **Full Inquiry Form**: Comprehensive business details
- Embeddable components for any website
- Automatic lead creation from form submissions
- Automated confirmation emails for you and client

### Business Intelligence
- Interactive charts and analytics dashboards
- Lead status distribution and conversion tracking
- Revenue trends and performance insights
- Business hitlists for prospect management

### Developer Resources
- **Resources Library**: Curated collection of business tools and development resources
- **Categorized Links**: Business, design, development, and hosting resources
- **Quick Access**: Links to documentation, tools, and services for developers

### Developer-Friendly
- Self-hosted solution with full control
- Clean, extensible codebase
- Comprehensive documentation
- Native Business Finder for automated lead generation


## Tech Stack

### Frontend
- **Vanilla JavaScript** - ES6 modules, no framework dependencies
- **HTML5/CSS3** - Responsive design with CSS Grid and Flexbox
- **Chart.js** - Interactive analytics and visualizations
- **CodeMirror** - Markdown editor for form templates
- **Firebase Auth** - User authentication and management

### Backend
- **Node.js/Express** - RESTful API server
- **MongoDB Atlas** - Cloud database with built-in backups
- **Firebase Admin SDK** - Server-side authentication
- **Nodemailer** - Email notifications (optional)
- **Mongoose** - MongoDB object modeling
- **Puppeteer** -  Web scraper

### Native Lead Generation
- **Business Finder** - Real-time, native, automated, lead generation

### External Components
- **Web Forms** - Quick and easy implementation with embeddable components

## Quick Overview

DevLeads is a **self-hosted lead management system** specifically designed for freelance developers and small agencies. Unlike SaaS solutions, you own your data and can customize everything to fit your workflow.

### What Makes It Different
- **No vendor lock-in** - Self-hosted with full control
- **Developer-focused** - Clean code, extensible architecture
- **Free & Open Source** - MIT license, no usage fees
- **Complete solution** - Native lead generation and form submission data → management → invoicing

### Perfect For
- **Freelance Developers** - Manage clients and projects
- **Small Agencies** - Team collaboration and lead tracking
- **Consultants** - Professional client management
- **Anyone** wanting to own their business data

**Estimated Setup Time**: 1-2 hours for complete setup, from start to live, deployed web app.

## Security Disclaimer

**IMPORTANT**: This application is designed for general business lead management and should NOT be used to store sensitive payment information such as credit card numbers, bank account details, or other financial credentials. Users are responsible for:

- Securing their deployment environment
- Implementing proper data protection measures
- Complying with applicable privacy regulations (GDPR, CCPA, etc.)
- NOT storing sensitive payment or financial data in the system
- Regular security updates and monitoring

**We are not responsible for any data breaches, security incidents, or unauthorized access to your deployment.** Use at your own risk and implement appropriate security measures for your specific use case.

## License

MIT License - See [LICENSE](./LICENSE) file for details

### What This Means
- **Free for commercial use**
- **Modify and distribute  
-<small> must give proper attribution to developer and link to original github repository</small>** 
- **Private use allowed**
- **No warranty or liability**

---

**Ready to get started?** → **[Begin with the Setup Guide](docs/SETUP-GUIDE.md)**