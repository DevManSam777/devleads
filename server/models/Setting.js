const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  scope: {
    type: String,
    default: 'global', // 'global', 'user', etc.
    enum: ['global', 'user']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // only required if scope is 'user'
    required: function() {
      return this.scope === 'user';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// middleware to update the 'updatedAt' field on save
settingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// create a compound index for scope and userId
settingSchema.index({ scope: 1, userId: 1 });

module.exports = mongoose.model('Setting', settingSchema);