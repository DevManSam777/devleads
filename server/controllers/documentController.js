const Document = require('../models/Document');
const Lead = require('../models/Lead');

// get all documents for a lead
exports.getDocumentsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    // find documents without loading the file data
    const documents = await Document.find({ leadId })
      .select('-fileData')
      .sort({ uploadedAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // encode the filename for use in the Content-Disposition header
    // this allows special characters to be included safely.
    const encodedFileName = encodeURIComponent(document.fileName);

    // set appropriate headers for PDF with security headers
    res.set({
      'Content-Type': document.fileType,
      'Content-Disposition': `inline; filename="${encodedFileName}"`,
      'Content-Length': document.fileData.length,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';"
    });

    // send the file data
    res.send(document.fileData);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// upload a new document
exports.uploadDocument = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { fileName, fileType, fileSize, fileData } = req.body;

    console.log(`Attempting to upload document ${fileName} for lead ${leadId}`);

    // verify lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      console.log(`Lead ${leadId} not found`);
      return res.status(404).json({ message: 'Lead not found' });
    }

    console.log(`Found lead: ${lead._id}, current documents: ${JSON.stringify(lead.documents || [])}`);

    // convert base64 string to buffer
    const buffer = Buffer.from(fileData.split(',')[1], 'base64');

    // create new document
    const document = new Document({
      leadId,
      fileName,
      fileType,
      fileSize,
      fileData: buffer
    });

    // save document
    const savedDocument = await document.save();
    console.log(`Document saved with ID: ${savedDocument._id}`);

    // update lead with document reference
    console.log(`Updating lead ${leadId} with document reference ${savedDocument._id}`);

    await Lead.findByIdAndUpdate(leadId, {
      $push: { documents: savedDocument._id }
    });

    // verify the update worked
    const updatedLead = await Lead.findById(leadId);
    console.log(`Updated lead documents: ${JSON.stringify(updatedLead.documents || [])}`);

    // return document info without file data
    const documentInfo = {
      _id: savedDocument._id,
      leadId: savedDocument.leadId,
      fileName: savedDocument.fileName,
      fileType: savedDocument.fileType,
      fileSize: savedDocument.fileSize,
      uploadedAt: savedDocument.uploadedAt
    };

    res.status(201).json(documentInfo);
  } catch (error) {
    console.error(`Error uploading document: ${error.message}`);
    console.error(error.stack);

    // handle size limit errors
    if (error.name === 'PayloadTooLargeError') {
      return res.status(413).json({ message: 'Document is too large' });
    }

    res.status(400).json({ message: error.message });
  }
};

// delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const leadId = document.leadId;

    // delete document from Document collection
    await Document.deleteOne({ _id: req.params.id });

    // also remove reference from Lead document
    await Lead.findByIdAndUpdate(leadId, {
      $pull: { documents: req.params.id }
    });

    res.json({ message: 'Document removed' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};