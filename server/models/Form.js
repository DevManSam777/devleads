const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['contract', 'proposal', 'invoice', 'agreement', 'other'],
    default: 'other'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  currentDate: {
    type: Date,
    default: Date.now
  },
  variables: {
    type: [String],
    default: []
  }
});

// pre-save middleware to update lastModified date
formSchema.pre('save', function(next) {
  // simply use the current date without timezone adjustment
  // store the date exactly as provided without any manipulation
  this.lastModified = new Date();
  next();
});

formSchema.methods.extractVariables = function() {
  // extract variables with pattern {{variableName}}
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches = [...this.content.matchAll(variableRegex)];
  
  // extract just the variable names
  const variableSet = new Set(matches.map(match => match[1].trim()));
  
  // add financial variables to make sure they're recognized even if not in content
  variableSet.add('paidAmount');
  variableSet.add('remainingBalance');
  
  // convert Set to Array to eliminate duplicates
  this.variables = Array.from(variableSet);
  return this.variables;
};

module.exports = mongoose.model('Form', formSchema);