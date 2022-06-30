const mongoose = require('mongoose');
const User = require('./userModel');

const TransactionHistory = mongoose.model('TransactionHistory', {
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  sentTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = TransactionHistory;