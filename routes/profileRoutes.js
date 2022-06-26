const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Music = require("../models/musicModel");
const UserReject = require("../models/userRejectModel");
const musicUpload = require("../file/musicUpload");
const path = require("path");
const auth = require("../auth/auth");
const { default: mongoose } = require("mongoose");
const ReportUser = require("../models/reportUserModel");
const Playlist = require("../models/playlistModel");
const e = require("express");

// Get User Profile
router.get("/user/profile", auth.verifyUser, (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.userInfo._id)) {
    User.findById(req.userInfo._id)
      .select("-__v -joined_date -is_authenticated -password")
      .exec((err, user) => {
        if (err) {
          return res.status(400).json({
            msg: "Something went wrong",
            success: false,
          });
        } else {
          Music.count({
            uploadedBy: req.userInfo._id,
          }).exec((err, count) => {
            if (err) {
              return res.status(400).json({
                msg: "Something went wrong",
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
router.put(
  "/user/profile/update",
  auth.verifyUser,
  musicUpload.single("profile_image"),
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
          "social.instagram": instagram,
          "social.facebook": facebook,
          "social.twitter": twitter,
          profile_image: profile_image,
        },
        { new: true }
      )
        .then((user) => {
          return res.status(200).json({ data: user, success: true });
        })
        .catch((err) => {
          return res.status(400).json({ msg: err.message, success: false });
        });
    } else {
      User.findByIdAndUpdate(
        req.userInfo._id,
        {
          name: name,
          bio: bio,
          "social.instagram": instagram,
          "social.facebook": facebook,
          "social.twitter": twitter,
        },
        { new: true }
      )
        .then((user) => {
          return res.status(200).json({ data: user, success: true });
        })
        .catch((err) => {
          return res.status(400).json({ msg: err.message, success: false });
        });
    }
  }
);

// change user discoverable status
router.put("/user/profile/discoverable", auth.verifyUser, function (req, res) {
  const is_discoverable = req.body.is_discoverable;
  User.findByIdAndUpdate(
    req.userInfo._id,
    {
      is_discoverable: is_discoverable,
    },
    { new: true }
  )
    .then((user) => {
      return res.status(200).json({ data: user, success: true });
    })
    .catch((err) => {
      return res.status(400).json({ msg: err.message, success: false });
    });
});

// verification request
router.put("/user/profile/verification", auth.verifyUser, function (req, res) {
  UserReject.findOne({
    userId: req.userInfo._id,
  }).exec((err, userReject) => {
    if (err) {
      return res.status(400).json({
        msg: "Something went wrong",
        success: false,
      });
    } else if (userReject) {
      const rejectDate = userReject.createdAt;
      const currentDate = new Date();
      const differance = currentDate.getTime() - rejectDate.getTime();
      const days = Math.floor(differance / (1000 * 60 * 60 * 24));
      const remainingDays = 180 - days;
      return res.status(400).json({
        msg:
          "You previous request has been rejected. You can add new request after " +
          remainingDays +
          " days.",
        success: false,
      });
    } else {
      User.findByIdAndUpdate(
        req.userInfo._id,
        {
          verification_request: true,
        },
        { new: true }
      )
        .then((user) => {
          return res.status(200).json({ data: user, success: true });
        })
        .catch((err) => {
          return res.status(400).json({ msg: err.message, success: false });
        });
    }
  });
});

router.post("/user/delete", auth.verifyUser, (req, res) => {
  const userid = req.userInfo._id;
  console.log(userid);
  User.findOne({ _id: userid }, (err, result) => {
    if (!err) {
      console.log("here");
      console.log(result);
      ReportUser.updateMany(
        { reportedUser: userid },
        {
          isRejected: false,
          isResolved: true,
        }
      )
        .then((result) => {
          Playlist.deleteMany({
            createdBy: userid,
          })
            .then((result) => {
              User.findOneAndDelete({ _id: userid }, (err, result) => {
                if (!err) {
                  console.log(result);
                  return res.status(200).json({
                    msg: "User deleled sucessfully",
                    success: true,
                  });
                } else {
                  return res
                    .status(400)
                    .json({ msg: "Something went wrong. 1", success: false });
                }
              });
            })
            .catch((e) => {
              return res
                .status(400)
                .json({ msg: "Something went wrong. 2", success: false });
            });
        })
        .catch((e) => {
          console.log(e);
          return res
            .status(400)
            .json({ msg: "Something went wrong. 3", success: false });
        });
    } else {
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong. 4", success: false });
    }
  });
});

// router.post("/user/delete", auth.verifyUser, (req, res) => {
//   const userid = req.userInfo._id;

//   User.findOne({ _id: userid }, (err, result) => {
//     if (!err) {
//       ReportUser.updateMany(
//         { reportedUser: userid },
//         {
//           isRejected: false,
//           isResolved: true,
//         }
//       );
//     } else {
//       console.log(err);
//       return res
//         .status(400)
//         .json({ msg: "Something went wrong. 2", success: false });
//     }
//   }).then((result) => {
//     Playlist.deleteManny({
//       createdBy: userid,
//     })
//       .then(
//         User.findOneAndDelete({ _id: userid }, (err, result) => {
//           if (!err) {
//             return res.status(200).json({
//               msg: "User deleted sucessfully",
//               success: true,
//             });
//           } else {
//             return res
//               .status(400)
//               .json({ msg: "Something went wrong. 1", success: false });
//           }
//         })
//       )
//       .catch((e) => {
//         console.log(e);
//         return res
//           .status(400)
//           .json({ msg: "Something went wrong. 2", success: false });
//       });
//   });
// });

module.exports = router;
