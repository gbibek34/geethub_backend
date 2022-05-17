const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Music = require('../models/musicModel');
const multer = require('multer');
const musicUpload = require('../file/musicUpload');

// upload new music
router.post('/music/new', musicUpload.single('audio'), function (req, res) {
  console.log(req.file);
  const audio = req.file.path;

  const name = req.body.name;
  const description = req.body.description;
  const genre = req.body.genre;
  const uploadedBy = req.body.uploadedBy;
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
  });

  musicData
    .save()
    .then(function () {
      res
        .status(200)
        .json({ msg: 'Music Uploaded Successfully', success: true });
    })
    .catch(function (e) {
      console.log(e);
      res.status(400).json({ msg: 'An error occurred', success: false });
    });
});

module.exports = router;
