const mongoose = require('mongoose');

const hitlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  businesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  }]
});

// pre-save middleware to ensure lastModified is set on every save
hitlistSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// pre-update middleware to ensure lastModified is updated on findByIdAndUpdate
hitlistSchema.pre('findOneAndUpdate', function(next) {
  // if lastModified isn't explicitly set in the update, set it now
  if (!this._update.$set || !this._update.$set.lastModified) {
    if (!this._update.$set) {
      this._update.$set = {};
    }
    this._update.$set.lastModified = new Date();
  }
  next();
});

module.exports = mongoose.model('Hitlist', hitlistSchema);