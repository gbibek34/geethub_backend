const mongoose = require("mongoose");
const Music = require("./musicModel");

const Playlist = new mongoose.model("Playlist", {
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  playlistMusic: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Music,
    },
  ],
  createdAt: {
    type: Date,
  },
});

module.exports = Playlist;
