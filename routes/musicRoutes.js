const express = require('express');
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

// upload new music
router.post(
  '/music/new',
  musicUpload.fields([
    {
      name: 'audio',
      maxCount: 1,
    },
    {
      name: 'coverArt',
      maxCount: 1,
    },
  ]),
  auth.verifyUser,
  function (req, res) {
    const audio = req.files.audio[0].path;
    const coverArt = req.files.coverArt[0].path;
    const name = req.body.name;

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

    const musicData = new Music({
      name,
      description,
      genre,
      audio,
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
        res.status(400).json({ msg: 'An error occurred', success: false });
      });
  }
);

// list My Music
router.get('/music/my', auth.verifyUser, function (req, res) {
  Music.find({
    uploadedBy: req.userInfo._id, // change id to dynamic value
  }).exec(function (err, result) {
    if (err) {
      res.status(400).json({ msg: 'Operation unsuccessful', success: false });
    } else {
      res.status(200).json({ data: result, success: true });
    }
  });
});

// Fetch image
router.get('/music/coverArt/:file(*)', (req, res) => {
  let file = req.params.file;
  let fileLocation = path.join('/music/', file);
  //res.send({image: fileLocation});
  res.sendFile(__dirname.slice(0, -7) + `${fileLocation}`);
});

// Get all Music
router.get('/music/all', auth.verifyUser, function (req, res) {
  Music.find({}, function (err, result) {
    if (err) {
      res.status(400).json({ msg: 'Operation Unsuccessful', success: false });
    } else {
      res.status(200).json({ data: result, success: true });
    }
  });
});

// Get music by id
router.get('/music/get/:id', auth.verifyUser, function (req, res) {
  const id = req.params.id;
  const music = Music.findOne({ _id: id }).then(function (musicData) {
    if (musicData != null) {
      res.status(200).json({ data: musicData, success: true });
    } else {
      res.status(400).json({ msg: 'Operation Unsuccessful', success: false });
    }
  });
});

// Search for Music
router.get('/music/search/:searchkey', auth.verifyUser, (req, res) => {
  const searchkey = req.params.searchkey;
  Music.find(
    { name: { $regex: new RegExp(searchkey, 'i') } },
    (err, result) => {
      if (!err) {
        console.log(result);
        return res.status(200).json({ success: true, data: result });
      } else {
        return res
          .status(400)
          .json({ msg: 'Something went wrong.', success: false });
      }
    }
  );
});

module.exports = router;
