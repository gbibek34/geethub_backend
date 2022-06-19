const mongoose = require('mongoose');

const UserReject = mongoose.model('UserReject', {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  createdAt: { type: Date, default: Date.now, expires: 15552000 }, // 6 months
});

module.exports = UserReject;
