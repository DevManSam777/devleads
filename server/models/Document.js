const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileData: {
    type: Buffer,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// delete documents when lead is deleted
documentSchema.statics.deleteByLeadId = async function(leadId) {
  return this.deleteMany({ leadId: leadId });
};

module.exports = mongoose.model('Document', documentSchema);