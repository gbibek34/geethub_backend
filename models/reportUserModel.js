const mongoose = require("mongoose");
const User = require("./userModel");

const ReportUser = mongoose.model("ReportUser", {
  text: {
    type: String,
    required: true,
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  reportedByUser: {
    type: String,
    required: true,
  },
  reportedOn: {
    type: Date,
    required: true,
  },
  isRejected: {
    type: Boolean,
    default: false,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
});

module.exports = ReportUser;
