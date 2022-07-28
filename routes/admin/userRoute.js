const express = require("express");
const router = express.Router();
const auth = require("../../auth/auth");
const User = require("../../models/userModel");
const Music = require("../../models/musicModel");
const ReportUser = require("../../models/reportUserModel");
const Playlist = require("../../models/playlistModel");
const UserReject = require("../../models/userRejectModel");

router.get("/admin/user/numbers", auth.verifyAdmin, async (req, res) => {
  try {
    const total_user = await User.countDocuments({});
    const total_artist = (await Music.distinct("uploadedBy")).length;
    const verified_artist = await User.countDocuments({
      is_verified: true,
    });
    const unaunticated_user = await User.countDocuments({
      is_authenticated: false,
    });
    return res.status(200).send({
      total_user,
      total_artist,
      verified_artist,
      unaunticated_user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Internal Server Error", success: false });
  }
});

router.get("/admin/user/insight", auth.verifyAdmin, async (req, res) => {
  try {
    var dt = new Date();
    var mth = dt.getMonth() - 1;
    var yr = dt.getFullYear() - 1;
    const user_data = await User.aggregate([
      {
        $match: {
          joined_date: {
            $gte: new Date(yr, mth, 1),
            $lte: new Date(),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$joined_date" },
            year: { $year: "$joined_date" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).send({ user_data, success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Internal Server Error", success: false });
  }
});

// suspend user
router.put("/admin/user/suspend/:id", auth.verifyAdmin, function (req, res) {
  const userid = req.params.id;
  const is_suspended = req.body.is_suspended;
  User.findByIdAndUpdate(
    userid,
    {
      is_suspended: is_suspended,
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

// delete user
router.post("/admin/user/delete/:id", auth.verifyAdmin, async (req, res) => {
  try {
    const userid = req.params.id;
    const newUser = await User.findById(userid);
    if (newUser.is_authenticated === false) {
      await User.deleteOne({ _id: userid });
      return res.status(200).send({ msg: "one new user deleted successfully", success: true });
    } else {
      return res
        .status(400)
        .send({ msg: "can not delete authenticated user", success: false });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Internal Server Error", success: false });
  }
});

module.exports = router;
