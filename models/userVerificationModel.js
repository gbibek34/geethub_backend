const mongoose = require('mongoose');

const UserVerification = mongoose.model('UserVerification', {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  uniqueString: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});

module.exports = UserVerification;
