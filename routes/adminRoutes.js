const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const auth = require("../auth/auth");
const UserReject = require("../models/userRejectModel");

// get verification user requests
router.get("/admin/user/verification/requests", auth.verifyAdmin, (req, res) => {
  User.find(
    { $and: [{ is_verified: false }, { verification_request: true }] },
    function (err, result) {
      if (err) {
        return res.status(400).json({
          msg: "Something went wrong",
          success: false,
        });
      } else {
        return res.status(200).json({
          data: result,
          success: true,
        });
      }
    }
  );
});

// verifying verification request
router.put("/admin/user/verify/:id", auth.verifyAdmin, function (req, res) {
  const id = req.params.id;
  User.findByIdAndUpdate(
    id,
    {
      is_verified: true,
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

// reject verification request
router.put("/admin/user/reject/:id", auth.verifyAdmin, function (req, res) {
  const id = req.params.id;
  User.findByIdAndUpdate(id, {
    is_verified: false,
    verification_request: false,
  }).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        msg: "Something went wrong",
        success: false,
      });
    } else {
      const UserRejectData = new UserReject({
        userId: user._id,
      });
      UserRejectData.save((err, data) => {
        if (err) {
          return res.status(400).json({
            msg: "Something went wrong",
            success: false,
          });
        } else {
          return res.status(200).json({
            data: data,
            success: true,
          });
        }
      });
    }
  });
});

module.exports = router;
