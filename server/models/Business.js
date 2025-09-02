const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  typeOfBusiness: {
    type: String,
    trim: true,
  },
  contactName: {
    type: String,
    trim: true,
  },
  businessPhone: {
    type: String,
    trim: true,
  },
  businessPhoneExt: {
    type: String,
    trim: true,
  },
  businessEmail: {
    type: String,
    trim: true,
  },
  hasWebsite: {
    type: Boolean,
    default: false,
  },
  websiteUrl: {
    type: String,
    trim: true,
  },
  address: {
    street: {
      type: String,
      trim: true,
    },
    aptUnit: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
  },
  lastContactedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: [
      "not-contacted",
      "contacted",
      "follow-up",
      "not-interested",
      "converted",
    ],
    default: "not-contacted",
  },
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "low",
  },
  notes: {
    type: String,
    trim: true,
  },
  hitlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hitlist",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

// pre-save middleware to update lastModified date on business save
businessSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

// middleware to update hitlist's lastModified when business is updated
businessSchema.post("save", async function() {
  try {
    // update the lastModified field of the associated hitlist
    const Hitlist = mongoose.model('Hitlist');
    await Hitlist.findByIdAndUpdate(this.hitlistId, {
      $set: { lastModified: new Date() }
    });
  } catch (error) {
    console.error("Error updating hitlist lastModified date:", error);
  }
});

// middleware to update hitlist's lastModified when business is updated via findOneAndUpdate
businessSchema.post("findOneAndUpdate", async function() {
  try {
    // get the original document that was updated
    const businessId = this.getQuery()._id;
    const Business = mongoose.model('Business');
    const business = await Business.findById(businessId);
    
    if (business && business.hitlistId) {
      // update the lastModified field of the associated hitlist
      const Hitlist = mongoose.model('Hitlist');
      await Hitlist.findByIdAndUpdate(business.hitlistId, {
        $set: { lastModified: new Date() }
      });
    }
  } catch (error) {
    console.error("Error updating hitlist lastModified date after business update:", error);
  }
});

module.exports = mongoose.model("Business", businessSchema);