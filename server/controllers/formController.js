const Form = require("../models/Form");

// format preferred contact values
function formatPreferredContactValue(value) {
  // if no value is provided, return a nice placeholder
  if (!value) {
    return "No contact preference specified";
  }

  // map of stored values to display values
  const contactMethods = {
    phone: "Personal Phone",
    businessPhone: "Business Phone",
    email: "Personal Email",
    text: "Text Message",
    businessEmail: "Business Email",
  };

  // return the mapped value or the original if no mapping exists
  return contactMethods[value] || value;
}

// format all variable values consistently
function formatVariableValue(variable, value) {
  // handle null, undefined, or empty string values
  if (value === null || value === undefined || value === "") {
    return `[No ${variable} provided]`;
  }

  // special case formatting for different variable types
  switch (variable) {
    case "preferredContact":
      return formatPreferredContactValue(value);

    case "serviceDesired":
      // format service types nicely
      const serviceTypes = {
        "Web Development": "Website Development",
        "App Development": "Application Development",
      };
      return serviceTypes[value] || value;

    case "hasWebsite":
      // convert yes/no to complete sentences
      return value === "yes"
        ? "Client has an existing website"
        : "Client does not have an existing website";

    case "budget":
    case "estimatedBudget":
      // format currency values
      if (!isNaN(parseFloat(value))) {
        return parseFloat(value).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
      }
      return value;

    default:
      // return the value as-is for other variables
      return value;
  }
}

exports.getForms = async (req, res) => {
  try {
    const category = req.query.category;
    const isTemplate = req.query.isTemplate;

    // build query object
    const query = {};

    // add category filter if provided
    if (category) {
      query.category = category;
    }

    // add template filter if provided
    if (isTemplate !== undefined) {
      // Convert string "true"/"false" to boolean
      query.isTemplate = isTemplate === "true";
    }

    // exclude forms that are associated with leads (customer forms) from the forms page
    // when viewing drafts, unless we're explicitly looking for them
    if (isTemplate === "false" && !req.query.includeCustomerForms) {
      // Find all leads to get their associated form IDs
      const Lead = require("../models/Lead");
      const leads = await Lead.find({}, "associatedForms");

      // extract all form IDs associated with leads
      const associatedFormIds = leads.reduce((ids, lead) => {
        if (lead.associatedForms && lead.associatedForms.length > 0) {
          return [...ids, ...lead.associatedForms];
        }
        return ids;
      }, []);

      // exclude these forms from results if they're not templates
      if (associatedFormIds.length > 0) {
        query._id = { $nin: associatedFormIds };
      }
    }

    // get forms sorted by creation date (newest first)
    const forms = await Form.find(query).sort({ lastModified: -1 });

    res.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// get form by ID
exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// in server/controllers/formController.js
exports.getFormsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    // find the lead
    const Lead = require("../models/Lead");
    const lead = await Lead.findById(leadId).populate("associatedForms");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead.associatedForms || []);
  } catch (error) {
    console.error("Error fetching forms for lead:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// create a new form
exports.createForm = async (req, res) => {
  try {
    // create new form instance
    const form = new Form(req.body);

    // extract variables before saving
    form.extractVariables();

    // save the form
    const savedForm = await form.save();
    res.status(201).json(savedForm);
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(400).json({ message: error.message });
  }
};

// update form
exports.updateForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // update form properties
    Object.keys(req.body).forEach((key) => {
      form[key] = req.body[key];
    });

    // reextract variables if content was updated
    if (req.body.content) {
      form.extractVariables();
    }

    // save updated form
    const updatedForm = await form.save();
    res.json(updatedForm);
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(400).json({ message: error.message });
  }
};

// delete form
exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    await Form.deleteOne({ _id: req.params.id });
    res.json({ message: "Form removed" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.searchForms = async (req, res) => {
  try {
    const { query } = req.query;
    const isTemplate = req.query.isTemplate;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // build the base query
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    };

    // add template filter if provided
    if (isTemplate !== undefined) {
      searchQuery.isTemplate = isTemplate === "true";
    }

    // exclude customer forms when searching drafts
    if (isTemplate === "false" && !req.query.includeCustomerForms) {
      // find all leads to get their associated form IDs
      const Lead = require("../models/Lead");
      const leads = await Lead.find({}, "associatedForms");

      // extract all form IDs associated with leads
      const associatedFormIds = leads.reduce((ids, lead) => {
        if (lead.associatedForms && lead.associatedForms.length > 0) {
          return [...ids, ...lead.associatedForms];
        }
        return ids;
      }, []);

      // exclude these forms from results if they're not templates
      if (associatedFormIds.length > 0) {
        searchQuery._id = { $nin: associatedFormIds };
      }
    }

    const forms = await Form.find(searchQuery).sort({ lastModified: -1 });

    res.json(forms);
  } catch (error) {
    console.error("Error searching forms:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// clone template to new form
exports.cloneTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;
    const template = await Form.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // create new form based on template
    const newForm = new Form({
      title: `${template.title} (Copy)`,
      description: template.description,
      content: template.content,
      category: template.category,
      isTemplate: false, // set to false as this is now a regular form
      variables: [...template.variables],
    });

    const savedForm = await newForm.save();
    res.status(201).json(savedForm);
  } catch (error) {
    console.error("Error cloning template:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.generateFormWithLeadData = async (req, res) => {
  try {
    const formId = req.params.id;
    const { leadId, timezone } = req.body;  

    // add basic request logging
    console.log(`Form generation request for lead ${leadId} from ${req.headers['user-agent']}`);

    if (!leadId) {
      return res.status(400).json({ message: "Lead ID is required" });
    }

    // get the form
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // get the lead
    const Lead = require("../models/Lead");
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    
    const fullName = `${lead.firstName} ${lead.lastName}`;
    
    // create a new form based on the template with lead data
    const newForm = new Form({
      title: `${form.title} - ${fullName}`,
      description: form.description,
      content: form.content,
      category: form.category,
      isTemplate: false,
      variables: [...form.variables],
    });

    // replace variables in content with lead data
    let populatedContent = form.content;

    // add minimal fallback to America/Los_Angeles if no timezone is provided
    let userTimezone = timezone;
    if (!userTimezone) {
      console.warn("No timezone provided by client, falling back to America/Los_Angeles");
      userTimezone = 'America/Los_Angeles';
    }
    
    // log the timezone being used
    console.log(`Using timezone: ${userTimezone} for form generation`);
    
    // get current date and format it in the user's timezone
    const now = new Date();
    const currentDateFormatted = formatDateInTimezone(now, userTimezone);
    populatedContent = populatedContent.replace(
      /\{\{currentDate\}\}/g,
      currentDateFormatted
    );

    // handle created date in user's timezone
    if (lead.createdAt) {
      const createdDate = new Date(lead.createdAt);
      const createdAtFormatted = formatDateInTimezone(createdDate, userTimezone);
      populatedContent = populatedContent.replace(
        /\{\{createdAt\}\}/g,
        createdAtFormatted
      );
    }

    // Handle last contacted date in user's timezone
    if (lead.lastContactedAt) {
      const lastContactedDate = new Date(lead.lastContactedAt);
      const lastContactedFormatted = formatDateInTimezone(lastContactedDate, userTimezone);
      populatedContent = populatedContent.replace(
        /\{\{lastContactedAt\}\}/g,
        lastContactedFormatted
      );
    }
    
    // Format date in the specified timezone
    function formatDateInTimezone(date, timezone) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: timezone
        });
        
        const parts = formatter.formatToParts(date);
        let formattedDate = '';
        
        parts.forEach(part => {
          if (part.type === 'month') formattedDate += part.value + ' ';
          if (part.type === 'day') formattedDate += part.value + ', ';
          if (part.type === 'year') formattedDate += part.value;
        });
        
        return formattedDate.trim();
      } catch (error) {
        console.error(`Error formatting date with timezone ${timezone}:`, error);
        return date.toDateString();
      }
    }

    // format the totalBudget with proper currency formatting
    if (lead.totalBudget !== undefined) {
      const totalBudget = lead.totalBudget || 0;
      populatedContent = populatedContent.replace(
        /\{\{totalBudget\}\}/g,
        totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      );
      populatedContent = populatedContent.replace(
        /\{\{billedAmount\}\}/g,
        totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      );
    }

    // format the paidAmount with proper currency formatting
    if (lead.paidAmount !== undefined) {
      const paidAmount = lead.paidAmount || 0;
      populatedContent = populatedContent.replace(
        /\{\{paidAmount\}\}/g,
        paidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      );
    }

    // format the remainingBalance with proper currency formatting
    if (lead.remainingBalance !== undefined) {
      const remainingBalance = lead.remainingBalance || 0;
      populatedContent = populatedContent.replace(
        /\{\{remainingBalance\}\}/g,
        remainingBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      );
    }

    // handle billing address with special formatting
    let fullAddress;
    if (!lead.billingAddress || 
        (!lead.billingAddress.street && 
         !lead.billingAddress.aptUnit && 
         !lead.billingAddress.city && 
         !lead.billingAddress.state && 
         !lead.billingAddress.zipCode && 
         !lead.billingAddress.country)) {
      fullAddress = "[No Address Provided]";
    } else { 
      fullAddress = 
`${lead.billingAddress.street || ""}${lead.billingAddress.aptUnit ? " #" + lead.billingAddress.aptUnit : ""}
${lead.billingAddress.city || ""}, ${lead.billingAddress.state || ""} ${lead.billingAddress.zipCode || ""}, ${lead.billingAddress.country || ""}`.trim();
    }

    populatedContent = populatedContent.replace(
      /\{\{billingAddress\}\}/g,
      fullAddress
    );

    // handle fullName
    populatedContent = populatedContent.replace(
      /\{\{fullName\}\}/g,
      fullName
    );

    // handle preferred contact method with special formatting
    const formattedPreferredContact = formatVariableValue("preferredContact", lead.preferredContact);
    populatedContent = populatedContent.replace(
      /\{\{preferredContact\}\}/g,
      formattedPreferredContact
    );

    // replace all other variables with lead data
    form.variables.forEach((variable) => {
      // skip already processed special variables
      if (variable === "currentDate" || 
          variable === "paidAmount" || 
          variable === "remainingBalance" ||
          variable === "billedAmount" ||
          variable === "totalBudget" ||
          variable === "billingAddress" ||
          variable === "fullName" ||
          variable === "preferredContact" ||
          variable === "createdAt" ||
          variable === "lastContactedAt") {
        return;
      }

      const variablePattern = new RegExp(`\\{\\{${variable}\\}\\}`, "g");
      let value = lead[variable];
      value = formatVariableValue(variable, value);
      populatedContent = populatedContent.replace(variablePattern, value);
    });

    // set the populated content
    newForm.content = populatedContent;

    // save the new form
    const savedForm = await newForm.save();

    // associate the form with the lead
    await Lead.findByIdAndUpdate(leadId, {
      $addToSet: { associatedForms: savedForm._id },
    });

    // log the successful form creation
    console.log(`Form generated successfully for lead ${leadId} using timezone ${userTimezone}`);

    res.json({
      _id: savedForm._id,
      title: savedForm.title,
      description: savedForm.description,
      content: populatedContent,
      leadId: leadId,
      usedTimezone: userTimezone
    });
  } catch (error) {
    console.error("Error generating form with lead data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// helper function to get nested properties
function getNestedProperty(obj, path) {
  // handle nested paths (e.g., "business.name")
  const properties = path.split(".");

  // start with the object
  let value = obj;

  // traverse the object path
  for (const prop of properties) {
    // if value is undefined or null, stop
    if (value === undefined || value === null) {
      return undefined;
    }

    // get the next level
    value = value[prop];
  }

  return value;
}