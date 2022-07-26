const express = require("express");
const router = express.Router();
const auth = require("../../auth/auth");
const TransactionHistory = require("../../models/transactionHistoryModel");

router.get("/monetization/total", auth.verifyAdmin, async (req, res) => {
  try {
    let load_amount = await TransactionHistory.aggregate([
      { $match: { type: "Load" } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]);
    if (load_amount[0]) {
      load_amount = load_amount[0].amount;
    } else {
      load_amount = 0;
    }
    let withdraw_amount = await TransactionHistory.aggregate([
      { $match: { type: "Withdraw" } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]);
    if (withdraw_amount[0]) {
      withdraw_amount = withdraw_amount[0].amount;
    } else {
      withdraw_amount = 0;
    }
    let amount = load_amount - withdraw_amount;

    const load_count = await TransactionHistory.countDocuments({
      type: "Load",
    });
    const withdraw_count = await TransactionHistory.countDocuments({
      type: "Withdraw",
    });
    const tip_count = await TransactionHistory.countDocuments({
      type: "Tip",
    });

    return res
      .status(200)
      .send({ amount, load_count, withdraw_count, tip_count, success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Internal Server Error", success: false });
  }
});

router.get(
  "/monetization/transaction-data",
  auth.verifyAdmin,
  async (req, res) => {
    try {
      var dt = new Date();
      var mth = dt.getMonth() - 1;
      var yr = dt.getFullYear() - 1;
      const load_data = await TransactionHistory.aggregate([
        {
          $match: {
            type: "Load",
            date: {
              $gte: new Date(yr, mth, 1),
              $lte: new Date(),
            },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$date" }, year: { $year: "$date" } },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);
      const withdraw_data = await TransactionHistory.aggregate([
        {
          $match: {
            type: "Withdraw",
            date: {
              $gte: new Date(yr, mth, 1),
              $lte: new Date(),
            },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$date" }, year: { $year: "$date" } },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);
      const tip_data = await TransactionHistory.aggregate([
        {
          $match: {
            type: "Tip",
            date: {
              $gte: new Date(yr, mth, 1),
              $lte: new Date(),
            },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$date" }, year: { $year: "$date" } },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);

      return res
        .status(200)
        .send({ load_data, withdraw_data, tip_data, success: true });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ msg: "Internal Server Error", success: false });
    }
  }
);

router.get(
  "/monetization/transaction-details",
  auth.verifyAdmin,
  async (req, res) => {
    try {
      let dt = new Date();
      let mth = dt.getMonth();
      if (mth === 0){
        mth = 12;
      }
      let yr = dt.getFullYear() - 1;
      const data = await TransactionHistory.find({
        date: {
          $gte: new Date(yr, mth, 1),
          $lte: new Date(),
        },
      })
        .populate({ path: "sentBy", select: ["name", "email"] })
        .populate({ path: "sentTo", select: ["name", "email"] });
      return res.status(200).send({ data, success: true });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ msg: "Internal Server Error", success: false });
    }
  }
);

module.exports = router;
