const express = require("express");
const router = express.Router();
const Playlist = require("../models/playlistModel");
const auth = require("../auth/auth");
const path = require("path");
const User = require("../models/userModel");

router.get("/artist/search/:searchkey", auth.verifyUser, (req, res) => {
  const searchkey= req.params.searchkey;
  User.find({name:{ $regex: '.*' + searchkey + '.*' }}, (err, result) => {
    if (!err) {
      console.log(result);
      return res.status(200).json({ success: true, data: result });
    } else {
      return res
        .status(400)
        .json({ msg: "Something went wrong.", success: false });
    }
  });
});

module.exports = router;