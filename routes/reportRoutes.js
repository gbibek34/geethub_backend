const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Music = require("../models/musicModel");
const auth = require("../auth/auth");
const ReportMusic = require("../models/reportMusicModel");
const ReportUser = require("../models/reportUserModel");

// Report Music
router.post("/report/music", auth.verifyUser, async function (req, res) {
  const text = req.body.text;
  const reportedByUser = req.userInfo.name;
  const reportedMusic = req.body.reportedMusic;
  const reportedBy = req.userInfo._id;
  const reportedOn = new Date();

  ReportMusic.find({ reportedBy, reportedMusic }).then(function (
    reportMusicData
  ) {
    if (reportMusicData.length > 0) {
      if (reportMusicData[0].isRejected === true) {
        return res.status(400).json({
          msg: "Your previous request was rejected.",
          success: false,
        });
      } else if (reportMusicData[0].isResolved === false) {
        return res.status(400).json({
          msg: "Your previous request is still pending. Please wait patiently.",
          success: false,
        });
      } else if (reportMusicData[0].isResolved == true) {
        return res
          .status(400)
          .json({ msg: "Your request has already been resolved." });
      }
    } else {
      const reportMusicData = new ReportMusic({
        text,
        reportedBy,
        reportedMusic,
        reportedOn,
        reportedByUser,
      });

      reportMusicData
        .save()
        .then(function () {
          res.status(200).json({ data: reportMusicData, success: true });
        })
        .catch(function (e) {
          console.log(e);
          res.status(400).json({ msg: "An error occurred", success: false });
        });
    }
  });
});

// Report Artist
router.post("/report/artist", auth.verifyUser, async function (req, res) {
  const text = req.body.text;
  const reportedByUser = req.userInfo.name;
  const reportedUser = req.body.reportedUser;
  const reportedBy = req.userInfo._id;
  const reportedOn = new Date();

  console.log(reportedUser);

  ReportUser.find({ reportedBy, reportedUser }).then(function (reportUserData) {
    if (reportUserData.length > 0) {
      if (reportUserData[0].isRejected === true) {
        return res.status(400).json({
          msg: "Your previous request was rejected.",
          success: false,
        });
      } else if (reportUserData[0].isResolved === false) {
        return res.status(400).json({
          msg: "Your previous request is still pending. Please wait patiently.",
          success: false,
        });
      } else if (reportUserData[0].isResolved == true) {
        return res
          .status(400)
          .json({ msg: "Your request has already been resolved." });
      }
    } else {
      const reportUserData = new ReportUser({
        text,
        reportedBy,
        reportedUser,
        reportedOn,
        reportedByUser,
      });

      reportUserData
        .save()
        .then(function () {
          res.status(200).json({ data: reportUserData, success: true });
        })
        .catch(function (e) {
          console.log(e);
          res.status(400).json({ msg: "An error occurred", success: false });
        });
    }
  });
});

module.exports = router;
