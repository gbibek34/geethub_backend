const express = require("express");
const router = express.Router();
const Playlist = require("../models/playlistModel");
const auth = require("../auth/auth");
const path = require("path");

const Music = require("../models/musicModel");
//create new playlist
router.post("/playlist/create", auth.verifyUser, (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const createdBy = req.userInfo._id;
  var date_ob = new Date();
  var day = ("0" + date_ob.getDate()).slice(-2);
  var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  var year = date_ob.getFullYear();
  var date = year + "-" + month + "-" + day;
  const playlistData = new Playlist({
    createdBy,
    name,
    description,
    createdAt: date,
  });

  playlistData
    .save()
    .then(function () {
      res.status(200).json({ success: true, data: playlistData });
    })
    .catch(function (e) {
      console.log(e);
      res.status(400).json({ msg: "An error occured", success: false });
    });
});

//get the playlist of current user
router.get("/playlist/getuserplaylist", auth.verifyUser, (req, res) => {
  const createdBy = req.userInfo.id;
  Playlist.find({ createdBy: createdBy }, (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong", success: false });
    } else {
      return res.status(200).json({ success: true, data: result });
    }
  });
});

//get all the playlists
router.get("/playlist/all", auth.verifyUser, (req, res) => {
  Playlist.find({}, (err, result) => {
    if (!err) {
      return res.send({ success: true, count: docs.length, data: result });
    } else {
      return res
        .status(400)
        .json({ msg: "Something went wrong.", success: false });
    }
  });
});

//get the details of any playlist by id
router.get("/playlist/details/:id", auth.verifyUser, (req, res) => {
  const playlistId = req.params.id;
  Playlist.find({ _id: playlistId }, (err, result) => {
    if (!err) {
      return res.send({ success: true, data: result[0] });
    } else {
      return res
        .status(400)
        .json({ msg: "Something went wrong.", success: false });
    }
  });
});

// add new music to playlist
router.post("/playlist/addmusic", auth.verifyUser, (req, res) => {
  const musicId = req.body.musicId;

  Playlist.findOne({ _id: req.body.playlistId }).then(function (playlistData) {
    if (playlistData.createdBy.toString() === req.userInfo._id.toString()) {
      if (!playlistData.playlistMusic.includes(musicId)) {
        Playlist.findOneAndUpdate(
          { _id: req.body.playlistId },
          {
            $push: {
              playlistMusic: musicId,
            },
          },
          (err, result) => {
            if (!err) {
              return res.send({ success: true, data: result });
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
          msg: "Music already exists in this playlist",
          success: false,
        });
      }
    } else {
      res.status(400).json({
        msg: "You cannot edit this playlist",
        success: false,
      });
    }
  });
});

// get all the musics inside the playlist
router.get("/playlist/musics/:id", auth.verifyUser, (req, res) => {
  const playlistId = req.params.id;
  Playlist.find(
    { _id: playlistId },
    { playlistMusic: 1 },
    function (err, musics) {
      if (err) {
        return res
          .status(400)
          .json({ msg: "Something went wrong.", success: false });
      } else {
        let allMusics = [];

        for (i in musics[0].playlistMusic) {
          allMusics.push(musics[0].playlistMusic[i]);
        }

        Music.find({
          _id: {
            $in: allMusics,
          },
        })
          .populate({ path: "uploadedBy", select: ["name"] })
          .exec((err, musicData) => {
            if (musicData !== null) {
              return res.send({ success: true, data: musicData });
            }
          });
      }
    }
  );
});

module.exports = router;

router.post("/playlist/delete", auth.verifyUser, (req, res) => {

  const playlistid = req.body.playlistid;
  console.log(playlistid);
  Playlist.findOneAndDelete({ _id: playlistid }, (err, result) => {
    if (!err) {
      return res.status(200).json({
        msg: "Playlist deleted sucessfully",
        success: true,
      });
    } else {
      return res
        .status(400)
        .json({ msg: "Something went wrong.", success: false });
    }
  });
});
