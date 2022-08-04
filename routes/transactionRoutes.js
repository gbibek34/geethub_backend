const express = require("express");
const router = express.Router();
const auth = require("../auth/auth");
const User = require("../models/userModel");
const TransactionHistory = require("../models/transactionHistoryModel");

// route to load money
router.put("/transaction/load", auth.verifyUser, (req, res) => {
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
        type: "Load",
      });

      transactionHistory
        .save()
        .then(() => {
          return res.status(200).json({ data: amount, success: true });
        })
        .catch((e) => {
          return res.status(400).json({
            msg: "Could not save transaction history",
            success: false,
          });
        });
    })
    .catch((e) => {
      return res
        .status(400)
        .json({ msg: "Could not load amount", success: false });
    });
});

//route to display all the tips send by the user
router.get("/artist/alltips", auth.verifyUser, (req, res) => {
  TransactionHistory.find({
    sendBy: req.userInfo._id,
    type: "Tip",
  })
    .then((result) => {
      if (result.length > 0) {
        console.log(result);
        return res.status(200).json({ success: true, data: result });
      } else {
        return res
          .status(400)
          .json({ msg: "You haven't tipped anyone yet", success: false });
      }
    })
    .catch((e) => {
      return res
        .status(400)
        .json({ msg: "Something went wrong", success: false });
    });
});

module.exports = router;
