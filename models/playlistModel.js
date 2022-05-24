const mongoose = require("mongoose");

const Playlist = mongoose.model("Playlist", {
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
      musicID: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
  createdAt: {
    type: Date,
  },
});

module.exports = Playlist;
