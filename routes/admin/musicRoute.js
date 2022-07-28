const express = require("express");
const router = express.Router();
const auth = require("../../auth/auth");
const Music = require("../../models/musicModel");

router.get("/admin/music/numbers", auth.verifyAdmin, async (req, res) => {
  try {
    const total_music = await Music.countDocuments({});
    let verified_artist_music = await Music.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "uploadedBy",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.is_verified": true,
        },
      },
      {
        $count: "musics",
      },
    ]);
    if (verified_artist_music.length > 0) {
      verified_artist_music = verified_artist_music[0].musics;
    } else {
      verified_artist_music = 0;
    }
    let views_count = await Music.aggregate([
      { $group: { _id: null, views_count: { $sum: "$views" } } },
    ]);
    views_count = views_count[0].views_count;
    let music_length = await Music.aggregate([
      { $group: { _id: null, music_length: { $sum: "$length" } } },
    ]);
    music_length = music_length[0].music_length;
    return res
      .status(200)
      .send({ total_music, verified_artist_music, views_count, music_length, success:true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Internal Server Error", success: false });
  }
});

router.get("/admin/music/insight", auth.verifyAdmin, async (req, res) => {
  try {
    var dt = new Date();
    var mth = dt.getMonth() - 1;
    var yr = dt.getFullYear() - 1;
    const music_data = await Music.aggregate([
      {
        $match: {
          uploadedOn: {
            $gte: new Date(yr, mth, 1),
            $lte: new Date(),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$uploadedOn" },
            year: { $year: "$uploadedOn" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).send({ music_data, success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Internal Server Error", success: false });
  }
});

module.exports = router;
