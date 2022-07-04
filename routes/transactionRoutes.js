const express = require('express');
const router = express.Router();
const auth = require('../auth/auth');
const path = require('path');
const User = require('../models/userModel');
const Music = require('../models/musicModel');
const TransactionHistory = require('../models/transactionHistoryModel');

// route to load money
router.put('/transaction/load', auth.verifyUser, (req, res) => {
  const amount = req.body.amount;
  const sentBy = req.userInfo._id;
  const date = new Date();

  User.findOneAndUpdate(sentBy, {
    $inc: { coins: amount },
  })
    .then((userData) => {
      const transactionHistory = new TransactionHistory({
        amount,
        sentBy,
        date,
        type: 'Load',
      });

      transactionHistory
        .save()
        .then(() => {
          return res.status(200).json({ data: amount, success: true });
        })
        .catch((e) => {
          return res.status(400).json({
            msg: 'Could not save transaction history',
            success: false,
          });
        });
    })
    .catch((e) => {
      return res
        .status(400)
        .json({ msg: 'Could not load amount', success: false });
    });
});

module.exports = router;
