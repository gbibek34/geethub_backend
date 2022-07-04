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
  sentBy: {
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
  remarks: {
    type: String,
    default: "self",
  },
});

module.exports = TransactionHistory;
