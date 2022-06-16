const mongoose = require('mongoose');

const User = mongoose.model('User', {
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  is_authenticated: {
    type: Boolean,
    default: false,
    required: true,
  },
  joined_date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  profile_image: {
    type: String,
  },
  followers: {
    type: Number,
    default: 0,
  },
  social: {
    type: Object,
    default: {
      instagram: '',
      facebook: '',
      twitter: '',
    },
  },
  bio: {
    type: String,
  },
  followed_by: [{ type: mongoose.Schema.Types.ObjectId }],
  is_discoverable: {
    type: Boolean,
    default: true,
    required: true,
  },
  verification_request: {
    type: Boolean,
    default: false,
  },
  is_admin: {
    type: Boolean,
    default: false,
    required: true,
  }
});

module.exports = User;
