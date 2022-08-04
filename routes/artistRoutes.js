const express = require("express");
const router = express.Router();
const Playlist = require("../models/playlistModel");
const auth = require("../auth/auth");
const path = require("path");
const User = require("../models/userModel");
const Music = require("../models/musicModel");
const ReportUser = require("../models/reportUserModel");
const Transaction = require("../models/transactionHistoryModel");
const TransactionHistory = require("../models/transactionHistoryModel");

// Search for Artist
router.get("/artist/search/:searchkey", auth.verifyUser, (req, res) => {
  const searchkey = req.params.searchkey;
  User.find(
    {
      $and: [
        { name: { $regex: new RegExp(searchkey, "i") } },
        { is_discoverable: true },
      ],
    },
    (err, result) => {
      if (!err) {
        return res.status(200).json({ success: true, data: result });
      } else {
        return res
          .status(400)
          .json({ msg: "Something went wrong.", success: false });
      }
    }
  );
});

//get profile of the artist
router.get("/artist/profile/:id", auth.verifyUser, (req, res) => {
  const userid = req.params.id;
  User.find({ _id: userid }, (err, result) => {
    if (!err) {
      return res.send({ success: true, data: result[0] });
    } else {
      return res
        .status(400)
        .json({ msg: "Something went wrong.", success: false });
    }
  });
});

// get all the musics inside the playlist
router.get("/artist/musics/:id", auth.verifyUser, (req, res) => {
  const artistid = req.params.id;
  Music.find({ uploadedBy: artistid }, (err, result) => {
    if (!err) {
      return res.send({ success: true, data: result });
    } else {
      return res
        .status(400)
        .json({ msg: "Something went wrong.", success: false });
    }
  });
});

//follow an artist
router.put("/artist/follow", auth.verifyUser, function (req, res) {
  const userid = req.userInfo._id;
  const artistid = req.body.artistid;
  User.findOne({ _id: artistid }).then(function (artistData) {
    if (!artistData.followed_by.includes(userid)) {
      User.findByIdAndUpdate(
        artistid,
        {
          $push: { followed_by: userid },
        },
        (err, result) => {
          if (!err) {
            return res.status(200).json({ success: true, data: result });
          } else {
            console.log(err);
            return res
              .status(400)
              .json({ msg: "Something went wrong.", success: false });
          }
        }
      );
    } else {
      res.status(400).json({
        msg: "You have already followed the artist",
        success: false,
      });
    }
  });
});

//unfollow an artist
router.put("/artist/unfollow", auth.verifyUser, function (req, res) {
  const userid = req.userInfo._id;
  const artistid = req.body.artistid;
  User.findOne({ _id: artistid }).then(function (artistData) {
    if (artistData.followed_by.includes(userid)) {
      User.findByIdAndUpdate(
        artistid,
        {
          $pull: { followed_by: userid },
        },
        (err, result) => {
          if (!err) {
            return res.status(200).json({ success: true, data: result });
          } else {
            console.log(err);
            return res
              .status(400)
              .json({ msg: "Something went wrong.", success: false });
          }
        }
      );
    } else {
      res.status(400).json({
        msg: "You have already unfollowed the artist",
        success: false,
      });
    }
  });
});

//fetch all the artists followed by the user
router.get("/artist/followed/all", auth.verifyUser, function (req, res) {
  const userid = req.userInfo._id;
  User.find({ followed_by: { $in: [userid] } }, (err, result) => {
    if (!err) {
      return res.status(200).json({ success: true, data: result });
    } else {  ar
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", success: false });
    }
  });
});

//tip the artist
router.post("/artist/tip", auth.verifyUser, function (req, res) {
  const amount = req.body.amount;
  const artistid = req.body.artistid;
  const userid = req.userInfo._id;
  console.log(userid);
  const sender = req.userInfo.name;
  const remarks = req.body.remarks;
  const transaction_date = new Date();
  User.findOne({
    _id: artistid,
  }).then((receiver) => {
    console.log(receiver.name);
    User.findOne({
      _id: userid,
    })
      .then((result) => {
        console.log(result.coins);
        if (result.coins == amount || result.coins > amount) {
          console.log(amount);
          console.log(userid)
          const transaction_data = new TransactionHistory({
            type: "Tip",
            sentBy: userid,
            sentTo: receiver._id,
            amount: Number(amount),
            remarks: remarks,
            date: transaction_date,
          });
          transaction_data
            .save()
            .then(function (transaction) {
              let sendercoins = Number(result.coins - Number(amount));
              let receivercoins = Number(receiver.coins + Number(amount));
              User.findOneAndUpdate(
                {
                  _id: userid,
                },
                {
                  coins: sendercoins,
                }
              )
                .then((sender) => {
                  User.findOneAndUpdate(
                    {
                      _id: artistid,
                    },
                    {
                      coins: receivercoins,
                    }
                  )
                    .then((receiver) => {
                      return res
                        .status(200)
                        .json({ success: true, data: result });
                    })
                    .catch((e) => {
                      return res.status(400).json({
                        msg: "Something went wrong",
                        success: false,
                      });
                    });
                })
                .catch((e) => {
                  console.log(e);
                  return res
                    .status(400)
                    .json({ msg: "Something went wrong.", success: false });
                });
            })
            .catch((e) => {
              console.log(e);
              return res.status(400).json({
                msg: "Something went wrong while saving trasaction",
                success: false,
              });
            });
        } else {
          return res
            .status(400)
            .json({ msg: "Insufficent coins", success: false });
        }
      })
      .catch((e) => {
        return res
          .status(400)
          .json({ msg: "Something went wrong", success: false });
      });
  });
});


//display all the tips of the artist
router.get("/artist/alltips", auth.verifyUser, (req, res) => {
  TransactionHistory.find({
    sentTo: req.userInfo._id,
    type: "Tip",
  })
    .then((result) => {
      if (result.length > 0) {
        console.log(result);
        return res.status(200).json({ success: true, data: result });
      } else {
        return res
          .status(400)
          .json({ msg: "Nobody has tipped you yet!", success: false });
      }
    })
    .catch((e) => {
      return res
        .status(400)
        .json({ msg: "Something went wrong", success: false });
    });
});

module.exports = router;
