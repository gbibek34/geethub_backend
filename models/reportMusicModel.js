const mongoose = require("mongoose");
const Music = require("./musicModel");
const User = require("./userModel");

const ReportMusic = mongoose.model("ReportMusic", {
  text: {
    type: String,
    required: true,
  },
  reportedMusic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Music,
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

module.exports = ReportMusic;
