const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlistModel');
const auth = require('../auth/auth');
const path = require('path');
const User = require('../models/userModel');
const Music = require('../models/musicModel');

// Search for Artist
router.get('/artist/search/:searchkey', auth.verifyUser, (req, res) => {
  const searchkey = req.params.searchkey;
  User.find({ name: { $regex: new RegExp(searchkey, 'i') } }, (err, result) => {
    if (!err) {
      return res.status(200).json({ success: true, data: result });
    } else {
      return res
        .status(400)
        .json({ msg: 'Something went wrong.', success: false });
    }
  });
});

//get profile of the artist
router.get('/artist/profile/:id', auth.verifyUser, (req, res) => {
  const userid = req.params.id;
  User.find({ _id: userid }, (err, result) => {
      return res
        .status(400)
<<<<<<< HEAD
        .json({ msg: "Something went wrong.", success: false });
    });
  },);
=======
        .json({ msg: 'Something went wrong.', success: false });
    }
  });
});
>>>>>>> 9fe128b9596bd649c8e1de45de7eb64035edaf9f

// get all the musics inside the playlist
router.get('/artist/musics/:id', auth.verifyUser, (req, res) => {
  const artistid = req.params.id;
  Music.find({ uploadedBy: artistid }, (err, result) => {
    if (!err) {
      return res.send({ success: true, data: result });
    } else {
      return res
        .status(400)
        .json({ msg: 'Something went wrong.', success: false });
    }
  });
});

module.exports = router;
