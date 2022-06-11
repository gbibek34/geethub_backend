const express = require("express");
const router = express.Router();
const Playlist = require("../models/playlistModel");
const auth = require("../auth/auth");
const path = require("path");
const User = require("../models/userModel");
const Music = require("../models/musicModel");

// Search for Artist
router.get('/artist/search/:searchkey', auth.verifyUser, (req, res) => {
  const searchkey = req.params.searchkey;
  User.find(
    {
      $and: [
        { name: { $regex: new RegExp(searchkey, 'i') } },
        { is_discoverable: true },
      ],
    },
    (err, result) => {
      if (!err) {
        return res.status(200).json({ success: true, data: result });
      } else {
        return res
          .status(400)
          .json({ msg: 'Something went wrong.', success: false });
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
  console.log("follow");
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
  console.log("unfollow");
  console.log(artistid);
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
      return res.status(400).json({ success: true, data: result });
    } else {
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", success: false });
    }
  });
});

module.exports = router;
