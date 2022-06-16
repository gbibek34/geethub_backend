const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/userModel");
const UserVerification = require("../models/userVerificationModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const auth = require("../auth/auth");
const jwt = require("jsonwebtoken");

router.get("/admin/check", auth.VerifyAdmin, (req, res) => {
  const result = req.userInfo;
  if (!err) {
    return res.status(200).json({ success: true, data: result });
  } else {
    console.log(err);
    return res
      .status(400)
      .json({ msg: "Something went wrong", success: false });
  }
});

router.get("/admin/allusers", auth.VerifyAdmin, (req, res) => {
  User.find({}, (err, result) => {
    if (!err) {
      return res.status(200).json({ success: true, data: result });
    } else {
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong", success: false });
    }
  });
});

module.exports = router;
