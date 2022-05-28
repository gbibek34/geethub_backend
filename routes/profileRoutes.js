const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Music = require('../models/musicModel');
const musicUpload = require('../file/musicUpload');
const path = require('path');
const auth = require('../auth/auth');
const { default: mongoose } = require('mongoose');

// Music.find({
//   uploadedBy: req.userInfo._id,
// })
//   .count()

// User.findById(req.userInfo._id)
// .select("-_id -__v -joined_date -is_authenticated -password")

router.get('/user/profile', auth.verifyUser, (req, res) => {
  console.log(req.userInfo._id);
  if (mongoose.Types.ObjectId.isValid(req.userInfo._id)) {
    User.findById(req.userInfo._id)
      .select('-__v -joined_date -is_authenticated -password')
      .exec((err, user) => {
        console.log(user);
        if (err) {
          return res.status(400).json({
            msg: 'Something went wrong',
            success: false,
          });
        } else {
          Music.count({
            uploadedBy: req.userInfo._id,
          }).exec((err, count) => {
            if (err) {
              return res.status(400).json({
                msg: 'Something went wrong',
                success: false,
              });
            } else {
              const clonedUser = JSON.parse(JSON.stringify(user));
              clonedUser.MusicCount = count;

              return res.status(200).json({
                data: clonedUser,
                success: true,
              });
            }
          });
        }
      });
  }
});

// update user profile
router.post(
  '/user/profile/update',
  auth.verifyUser,
  musicUpload.single('profile_image'),
  function (req, res) {
    const name = req.body.name;
    const bio = req.body.bio;
    const instagram = req.body.instagram;
    const facebook = req.body.facebook;
    const twitter = req.body.twitter;
    if (req.file) {
      const profile_image = req.file.path;
      User.findByIdAndUpdate(
        req.userInfo._id,
        {
          name: name,
          bio: bio,
          'social.instagram': instagram,
          'social.facebook': facebook,
          'social.twitter': twitter,
          profile_image: profile_image,
        },
        { new: true }
      )
        .then((user) => {
          res.status(200).json({ user, success: true });
        })
        .catch((err) => {
          res.status(400).json({ msg: err.message, success: false });
        });
    } else {
      User.findByIdAndUpdate(
        req.userInfo._id,
        {
          name: name,
          bio: bio,
          'social.instagram': instagram,
          'social.facebook': facebook,
          'social.twitter': twitter,
        },
        { new: true }
      )
        .then((user) => {
          res.status(200).json({ user, success: true });
        })
        .catch((err) => {
          res.status(400).json({ msg: err.message, success: false });
        });
    }
  }
);

module.exports = router;
