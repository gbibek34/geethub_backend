const express = require("express");
const router = express.Router();
const Playlist = require("../models/playlistModel");
const auth = require("../auth/auth");
const path = require("path");

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
      res.status(200).json({ data: playlistData, success: true });
    })
    .catch(function (e) {
      console.log(e);
      res.status(400).json({ mgs: "An error occured", success: false });
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
      console.log(docs.length);
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
router.get("playlist/details", auth.verifyUser, (req, res) => {
  const playlistId = req.body.playlistId;
  Playlist.find({ _id: orderid }, (err, result) => {
    if (!err) {
      return res.send({ success: true, data: result });
    } else {
      return res
        .status(400)
        .json({ msg: "Something went wrong.", success: false });
    }
  });
});

//--> TODO: get all the musics inside the playlist
// router.get("/playlist/musics", auth.verifyUser, (req, res) => {
//   const playlistId = req.body.playlistId;
//   let allMusics = [];
//   const result = Playlist.find(
//     { _id: playlistId },
//     { playlistMusic: 1 },
//     function (err, musics) {
//       if (err) {
//         return res
//           .status(400)
//           .json({ msg: "Something went wrong.", success: false });
//       } else {
//         for (i in musics) {
//           console.log("hello");
//           console.log(musics[i]);
//           allMusics.push(musics[i]);
//         }
//         console.log("hello 2");
//         console.log(allMusics);
//         return res.send({ success: true, data: musics });
//       }
//     }
//   );
// });

module.exports = router;
