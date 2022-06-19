const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/userModel");
const UserVerification = require("../models/userVerificationModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const auth = require("../auth/auth");
const jwt = require("jsonwebtoken");
const ReportMusic = require("../models/reportMusicModel");
const Music = require("../models/musicModel");
const ReportUser = require("../models/reportUserModel");

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

router.get(
  "/admin/musicreport/all",
  auth.VerifyAdmin,
  async function (req, res) {
    ReportMusic.find({}, (err, result) => {
      if (!err) {
        return res.status(200).json({ success: true, data: result });
      } else {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Something went wrong", success: false });
      }
    });
  }
);

router.get(
  "/admin/musicreport/pending",
  auth.VerifyAdmin,
  async function (req, res) {
    ReportMusic.find(
      {
        isRejected: false,
        isResolved: false,
      },
      (err, result) => {
        if (!err) {
          return res.status(200).json({ success: true, data: result });
        } else {
          console.log(err);
          return res
            .status(400)
            .json({ msg: "Something went wrong", success: false });
        }
      }
    );
  }
);

router.get(
  "/admin/musicreport/rejected",
  auth.VerifyAdmin,
  async function (req, res) {
    ReportMusic.find(
      {
        isRejected: true,
        isResolved: false,
      },
      (err, result) => {
        if (!err) {
          return res.status(200).json({ success: true, data: result });
        } else {
          console.log(err);
          return res
            .status(400)
            .json({ msg: "Something went wrong", success: false });
        }
      }
    );
  }
);

router.get(
  "/admin/musicreport/resolved",
  auth.VerifyAdmin,
  async function (req, res) {
    ReportMusic.find(
      {
        isRejected: false,
        isResolved: true,
      },
      (err, result) => {
        if (!err) {
          return res.status(200).json({ success: true, data: result });
        } else {
          console.log(err);
          return res
            .status(400)
            .json({ msg: "Something went wrong", success: false });
        }
      }
    );
  }
);

router.put(
  "/admin/musicreport/reject",
  auth.VerifyAdmin,
  async function (req, res) {
    const reportid = req.body.reportid;
    ReportMusic.findByIdAndUpdate(reportid, {
      isRejected: true,
      isResolved: false,
    })
      .then((result) => {
        return res.status(200).json({ data: result, success: true });
      })
      .catch((err) => {
        return res.status(400).json({ msg: err.message, success: false });
      });
  }
);

router.put(
  "/admin/musicreport/resolve",
  auth.VerifyAdmin,
  async function (req, res) {
    // const musicid= req.body.reportid;
    const reportid = req.body.reportid;
    ReportMusic.findByIdAndUpdate(reportid, {
      isRejected: false,
      isResolved: true,
    })
      .then((report) => {
        console.log(report.reportedMusic);
        ReportMusic.updateMany(
          {
            reportedMusic: report.reportedMusic,
          },
          {
            isRejected: false,
            isResolved: true,
          },
          { multi: true },
          (err, result) => {
            if (!err) {
              Music.findByIdAndDelete(report.reportedMusic, (err, result) => {
                if (!err) {
                  return res.status(200).json({ data: report, success: true });
                } else {
                  return res
                    .status(400)
                    .json({ msg: err.message, success: false });
                }
              });
            } else {
              return res.status(400).json({ msg: err.message, success: false });
            }
          }
        );
      })
      .catch((err) => {
        return res.status(400).json({ msg: err.message, success: false });
      });
  }
);

router.get(
  "/admin/musicreport/musics",
  auth.VerifyAdmin,
  async function (req, res) {
    var musicid = [];
    ReportMusic.find({
      isRejected: false,
      isResolved: false,
    })
      .then((data) => {
        data.map((d, k) => {
          musicid.push(d.reportedMusic);
        });
        Music.find({ _id: { $in: musicid } })
          .then((data) => {
            // console.log(data);
            return res.status(200).json({ success: true, data: data });
          })
          .catch((error) => {
            return res
              .status(400)
              .json({ msg: "Something went wrong", success: false });
          });
      })
      .catch((error) => {
        console.log(error);
        return res
          .status(400)
          .json({ msg: "Something went wrong", success: false });
      });
  }
);

router.get(
  "/admin/userreport/all",
  auth.VerifyAdmin,
  async function (req, res) {
    ReportUser.find({}, (err, result) => {
      if (!err) {
        return res.status(200).json({ success: true, data: result });
      } else {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Something went wrong", success: false });
      }
    });
  }
);

router.put(
  "/admin/userreport/reject",
  auth.VerifyAdmin,
  async function (req, res) {
    const reportid = req.body.reportid;
    ReportUser.findByIdAndUpdate(
      reportid,
      {
        isRejected: true,
        isResolved: false,
      }
        .then((result) => {
          return res.status(200).json({ data: result, success: true });
        })
        .catch((err) => {
          return res.status(400).json({ msg: err.message, success: false });
        })
    );
  }
);

router.put(
  "/admin/userreport/resolve",
  auth.VerifyAdmin,
  async function (req, res) {
    // const musicid= req.body.reportid;
    const reportid = req.body.reportid;
    ReportUser.findByIdAndUpdate(reportid, {
      isRejected: false,
      isResolved: true,
    })
      .then((report) => {
        console.log(report.reportedMusic);
        ReportUser.updateMany(
          {
            reportedMusic: report.reportedUser,
          },
          {
            isRejected: false,
            isResolved: true,
          },
          { multi: true },
          (err, result) => {
            if (!err) {
              User.findByIdAndDelete(report.reportedUser, (err, result) => {
                if (!err) {
                  return res.status(200).json({ data: report, success: true });
                } else {
                  return res
                    .status(400)
                    .json({ msg: err.message, success: false });
                }
              });
            } else {
              return res.status(400).json({ msg: err.message, success: false });
            }
          }
        );
      })
      .catch((err) => {
        return res.status(400).json({ msg: err.message, success: false });
      });
  }
);

router.get(
  "/admin/userreport/pending",
  auth.VerifyAdmin,
  async function (req, res) {
    ReportUser.find(
      {
        isRejected: false,
        isResolved: false,
      },
      (err, result) => {
        if (!err) {
          return res.status(200).json({ success: true, data: result });
        } else {
          console.log(err);
          return res
            .status(400)
            .json({ msg: "Something went wrong", success: false });
        }
      }
    );
  }
);

router.get(
  "/admin/userreport/rejected",
  auth.VerifyAdmin,
  async function (req, res) {
    ReportUser.find(
      {
        isRejected: true,
        isResolved: false,
      },
      (err, result) => {
        if (!err) {
          return res.status(200).json({ success: true, data: result });
        } else {
          console.log(err);
          return res
            .status(400)
            .json({ msg: "Something went wrong", success: false });
        }
      }
    );
  }
);

router.get(
  "/admin/userreport/resolved",
  auth.VerifyAdmin,
  async function (req, res) {
    ReportUser.find(
      {
        isRejected: false,
        isResolved: true,
      },
      (err, result) => {
        if (!err) {
          return res.status(200).json({ success: true, data: result });
        } else {
          console.log(err);
          return res
            .status(400)
            .json({ msg: "Something went wrong", success: false });
        }
      }
    );
  }
);


router.get(
  "/admin/userreport/users",
  auth.VerifyAdmin,
  async function (req, res) {
    var userid = [];
    ReportUser.find({
      isRejected: false,
      isResolved: false,
    })
      .then((data) => {
        data.map((d, k) => {
          userid.push(d.reportedUser);
        });
        User.find({ _id: { $in: userid } })
          .then((data) => {
            // console.log(data);
            return res.status(200).json({ success: true, data: data });
          })
          .catch((error) => {
            return res
              .status(400)
              .json({ msg: "Something went wrong", success: false });
          });
      })
      .catch((error) => {
        console.log(error);
        return res
          .status(400)
          .json({ msg: "Something went wrong", success: false });
      });
  }
);


module.exports = router;
