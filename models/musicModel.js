const mongoose = require("mongoose");
const User = require("./userModel");

const Music = mongoose.model("Music", {
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  audio: {
    type: String,
    required: true,
  },
  length: {
    type: Number,
    // required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  uploadedOn: {
    type: Date,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
  },
  coverArt: {
    type: String,
    required: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
});

module.exports = Music;
