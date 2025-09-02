const Lead = require("../models/Lead");
const { sendLeadNotificationEmail, sendLeadConfirmationEmail } = require('../utils/emailNotification');

// get all leads
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// get lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createLead = async (req, res) => {
  try {
    // create a copy of the request body to modify
    const trimmedData = {};
    
    // trim whitespace from string fields
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        trimmedData[key] = value.trim();
      } else if (typeof value === 'object' && value !== null) {
        // handle nested objects like billingAddress
        if (key === 'billingAddress') {
          trimmedData[key] = {};
          for (const [addrKey, addrValue] of Object.entries(value)) {
            if (typeof addrValue === 'string') {
              trimmedData[key][addrKey] = addrValue.trim();
            } else {
              trimmedData[key][addrKey] = addrValue;
            }
          }
        } else {
          trimmedData[key] = value;
        }
      } else {
        trimmedData[key] = value;
      }
    }

    // create the lead in the database using the trimmed data
    const lead = new Lead(trimmedData);
    const createdLead = await lead.save();

    // check if this is from the public form submission
    const isFormSubmission = trimmedData.isFormSubmission === true || 
      (req.headers.referer && req.headers.referer.includes('/form.html'));
    
    // remove the flag from the response if it exists
    if (createdLead.isFormSubmission) {
      createdLead.isFormSubmission = undefined;
    }

    // attempt to send email notification only for form submissions
    if (isFormSubmission) {
      // Ssnd admin notification
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('Sending admin notification email');
        sendLeadNotificationEmail(createdLead)
          .catch(error => console.error('Background admin email notification failed:', error));
      }

      // send confirmation email to the lead (optional)
      if (createdLead.email) {
        console.log('Sending lead confirmation email');
        sendLeadConfirmationEmail(createdLead)
          .catch(error => console.error('Background lead confirmation email failed:', error));
      }
    }

    res.status(201).json(createdLead);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // if the status is changing to a closed status, set the closedAt date
    if ((req.body.status === "closed-won" || req.body.status === "closed-lost") && 
        lead.status !== "closed-won" && lead.status !== "closed-lost") {
      req.body.closedAt = Date.now();
    }

    // existing contacted status handling
    if (req.body.status === "contacted" && lead.status !== "contacted") {
      req.body.lastContactedAt = Date.now();
    }

    // rest of your existing update code...
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updatedLead);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};


// delete lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    await Lead.deleteOne({ _id: req.params.id });

    res.json({ message: "Lead removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// search leads
exports.searchLeads = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const leads = await Lead.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { businessName: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};