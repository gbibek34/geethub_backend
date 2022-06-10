const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Music = require('../models/musicModel');
const multer = require('multer');
const musicUpload = require('../file/musicUpload');
const coverArtUpload = require('../file/coverArtUpload');
const auth = require('../auth/auth');
const path = require('path');
const { route } = require('./authRoutes');
const mm = require('music-metadata');
const util = require('util');

// upload new music
router.post(
  "/music/new",
  musicUpload.fields([
    {
      name: "audio",
      maxCount: 1,
    },
    {
      name: "coverArt",
      maxCount: 1,
    },
  ]),
  auth.verifyUser,
  async function (req, res) {
    const audio = req.files.audio[0].path;
    const coverArt = req.files.coverArt[0].path;
    const name = req.body.name;

    async function musicDuration() {
      try {
        const metadata = await mm.parseFile(audio);
        // console.log(util.inspect(metadata, { showHidden: false, depth: null }));
        const length = metadata.format.duration;
        return length;
      } catch (error) {
        console.error(error.message);
      }
    };

    // Music.findOne({ name: name }).then((music) => {
    //   if (music) {
    //     return res
    //       .status(400)
    //       .json({ msg: 'Music with this name already exists', success: false });
    //   }
    // });
    const description = req.body.description;
    const genre = req.body.genre;
    const uploadedBy = req.userInfo._id;
    const uploadedOn = new Date();
    const isPublished = true;
    const length = await musicDuration();

    const musicData = new Music({
      name,
      description,
      genre,
      audio,
      length,
      uploadedBy,
      uploadedOn,
      isPublished,
      coverArt,
    });

    musicData
      .save()
      .then(function () {
        res.status(200).json({ data: musicData, success: true });
      })
      .catch(function (e) {
        console.log(e);
        res.status(400).json({ msg: "An error occurred", success: false });
      });
  }
);

// list My Music
router.get("/music/my", auth.verifyUser, function (req, res) {
  Music.find({
    uploadedBy: req.userInfo._id,
  }).populate({path:'uploadedBy', select:['name']}).exec(function (err, result) {
    if (err) {
      res.status(400).json({ msg: "Operation unsuccessful", success: false });
    } else {
      res.status(200).json({ data: result, success: true });
    }
  });
});

// Fetch image
router.get("/music/coverArt/:file(*)", (req, res) => {
  let file = req.params.file;
  let fileLocation = path.join("/music/", file);
  //res.send({image: fileLocation});
  res.sendFile(__dirname.slice(0, -7) + `${fileLocation}`);
});

// Get all Music
router.get('/music/all', auth.verifyUser, function (req, res) {
  Music.find({}).populate({path:'uploadedBy', select:['name']}).exec( function (err, result) {
    if (err) {
      res.status(400).json({ msg: "Operation Unsuccessful", success: false });
    } else {
      res.status(200).json({ data: result, success: true });
    }
  });
});

// Get music by id
router.get("/music/get/:id", auth.verifyUser, function (req, res) {
  const id = req.params.id;
  Music.findOne({ _id: id }).populate({path:'uploadedBy', select:['name']}).then(function (musicData) {
    if (musicData != null) {
      res.status(200).json({ data: musicData, success: true });
    } else {
      res.status(400).json({ msg: "Operation Unsuccessful", success: false });
    }
  });
});

//like a music
router.put("/music/like", auth.verifyUser, function (req, res) {
  const userid = req.userInfo._id;
  const musicid = req.body.musicid;
  Music.findOne({ _id: musicid }).then(function (musicData) {
    if (!musicData.likes.includes(userid)) {
      Music.findByIdAndUpdate(
        req.body.musicid,
        {
          $push: { likes: userid },
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
        msg: "You have already liked the music",
        success: false,
      });
    }
  });
});

//unlike a music
router.put("/music/unlike", auth.verifyUser, function (req, res) {
  const userid = req.userInfo._id;
  const musicid = req.body.musicid;
  Music.findOne({ _id: musicid }).then(function (musicData) {
    console.log(musicData.likes.includes(userid));
    if (musicData.likes.includes(userid)) {
      Music.findByIdAndUpdate(
        req.body.musicid,
        {
          $pull: { likes: userid },
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
        msg: "You have already unliked the music",
        success: false,
      });
    }
  });
});

//fetch all the music like by the user
router.get("/music/liked/all", auth.verifyUser, function (req, res) {
  const userid = req.userInfo._id;
  Music.find({ likes: { $in: [userid] } }, (err, result) => {
    if (!err) {
      return res.status(200).json({ success: true, data: result });
    } else {
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", success: false });
    }
  });
});

// Edit Music
router.put(
  '/music/edit/:id', auth.verifyUser, musicUpload.single('coverArt'), function (req, res) {
    const uploadedBy = req.userInfo._id;
    const id = req.params.id;
    Music.findOne({ _id: id }).then(function (musicData) {
      if (musicData.uploadedBy.toString() === uploadedBy.toString()) {
        const name = req.body.name;
        const description = req.body.description;
        const genre = req.body.genre;

        if (req.file) {
          coverArt = req.file.path;
          Music.findOneAndUpdate({ _id: id }, {
            name,
            description,
            genre,
            coverArt,
          }, function (err, result) {
            if (err) {
              res.status(400).json({ msg: 'Operation Unsuccessful', success: false });
            } else {
              res.status(200).json({ data: result, success: true });
            }
          });
        } else {
          Music.findOneAndUpdate({ _id: id }, {
            name,
            description,
            genre,
          }, function (err, result) {
            if (err) {
              res.status(400).json({ msg: 'Operation Unsuccessful', success: false });
            } else {
              res.status(200).json({ data: result, success: true });
            }
          });
        }
      } else {
        res.status(400).json({
          msg: 'You cannot edit this music',
          success: false,
        });
      }
    }).catch((err) => {
      res.status(400).json({ msg: 'Operation Unsuccessful', success: false });
    })
  }
);

module.exports = router;
