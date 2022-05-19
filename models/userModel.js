const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("User", UserSchema);
