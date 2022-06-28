const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const UserVerification = require('../../models/userVerificationModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const auth = require('../../auth/auth');
const jwt = require('jsonwebtoken');
const ReportMusic = require('../../models/reportMusicModel');
const Music = require('../../models/musicModel');
const ReportUser = require('../../models/reportUserModel');

router.get('/admin/check', auth.verifyAdmin, (req, res) => {
  const result = req.userInfo;
  if (!err) {
    return res.status(200).json({ success: true, data: result });
  } else {
    console.log(err);
    return res
      .status(400)
      .json({ msg: 'Something went wrong', success: false });
  }
});

router.get('/admin/allusers', auth.verifyAdmin, (req, res) => {
  User.find({}, (err, result) => {
    if (!err) {
      return res.status(200).json({ success: true, data: result });
    } else {
      console.log(err);
      return res
        .status(400)
        .json({ msg: 'Something went wrong', success: false });
    }
  });
});

// get verification user requests
router.get(
  '/admin/user/verification/requests',
  auth.verifyAdmin,
  (req, res) => {
    User.find(
      { $and: [{ is_verified: false }, { verification_request: true }] },
      function (err, result) {
        if (err) {
          return res.status(400).json({
            msg: 'Something went wrong',
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
  }
);

// verifying verification request
router.put('/admin/user/verify/:id', auth.verifyAdmin, function (req, res) {
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
router.put('/admin/user/reject/:id', auth.verifyAdmin, function (req, res) {
  const id = req.params.id;
  User.findByIdAndUpdate(id, {
    is_verified: false,
    verification_request: false,
  }).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        msg: 'Something went wrong',
        success: false,
      });
    } else {
      const UserRejectData = new UserReject({
        userId: user._id,
      });
      UserRejectData.save((err, data) => {
        if (err) {
          return res.status(400).json({
            msg: 'Something went wrong',
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

///display all reported music
router.get(
  '/admin/musicreport/all',
  auth.verifyAdmin,
  async function (req, res) {
    ReportMusic.find({}, (err, result) => {
      if (!err) {
        return res.status(200).json({ success: true, data: result });
      } else {
        console.log(err);
        return res
          .status(400)
          .json({ msg: 'Something went wrong', success: false });
      }
    });
  }
);

router.get(
  '/admin/musicreport/pending',
  auth.verifyAdmin,
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
            .json({ msg: 'Something went wrong', success: false });
        }
      }
    );
  }
);

router.get(
  '/admin/musicreport/rejected',
  auth.verifyAdmin,
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
            .json({ msg: 'Something went wrong', success: false });
        }
      }
    );
  }
);

router.get(
  '/admin/musicreport/resolved',
  auth.verifyAdmin,
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
            .json({ msg: 'Something went wrong', success: false });
        }
      }
    );
  }
);

router.put(
  '/admin/musicreport/reject',
  auth.verifyAdmin,
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
  '/admin/musicreport/resolve',
  auth.verifyAdmin,
  async function (req, res) {
    // const musicid= req.body.reportid;
    const reportid = req.body.reportid;
    ReportMusic.findByIdAndUpdate(reportid, {
      isRejected: false,
      isResolved: true,
    })
      .then((report) => {
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
  '/admin/musicreport/musics',
  auth.verifyAdmin,
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
          .then((musicdata) => {
            // console.log(data);
            return res.status(200).json({ success: true, data: musicdata });
          })
          .catch((error) => {
            return res
              .status(400)
              .json({ msg: 'Something went wrong', success: false });
          });
      })
      .catch((error) => {
        console.log(error);
        return res
          .status(400)
          .json({ msg: 'Something went wrong', success: false });
      });
  }
);

router.get(
  '/admin/userreport/all',
  auth.verifyAdmin,
  async function (req, res) {
    ReportUser.find({}, (err, result) => {
      if (!err) {
        return res.status(200).json({ success: true, data: result });
      } else {
        console.log(err);
        return res
          .status(400)
          .json({ msg: 'Something went wrong', success: false });
      }
    });
  }
);

router.put(
  '/admin/userreport/reject',
  auth.verifyAdmin,
  async function (req, res) {
    const reportid = req.body.reportid;
    ReportUser.findByIdAndUpdate(reportid, {
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

//resolve the report of user
router.put(
  '/admin/userreport/resolve',
  auth.verifyAdmin,
  async function (req, res) {
    // const musicid= req.body.reportid;
    const reportid = req.body.reportid;
    ReportUser.findByIdAndUpdate(reportid, {
      isRejected: false,
      isResolved: true,
    })
      .then((report) => {
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
  '/admin/userreport/pending',
  auth.verifyAdmin,
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
            .json({ msg: 'Something went wrong', success: false });
        }
      }
    );
  }
);

router.get(
  '/admin/userreport/rejected',
  auth.verifyAdmin,
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
            .json({ msg: 'Something went wrong', success: false });
        }
      }
    );
  }
);

router.get(
  '/admin/userreport/resolved',
  auth.verifyAdmin,
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
            .json({ msg: 'Something went wrong', success: false });
        }
      }
    );
  }
);

router.get(
  '/admin/userreport/users',
  auth.verifyAdmin,
  async function (req, res) {
    var userid = [];
    ReportUser.find({
      isRejected: false,
      isResolved: false,
    })
      .then((data) => {
        console.log(data);
        data.map((d, k) => {
          userid.push(d.reportedUser);
        });
        console.log(userid);
        User.find({ _id: { $in: userid } })
          .then((userdata) => {
            console.log(userdata);
            return res.status(200).json({ success: true, data: userdata });
          })
          .catch((error) => {
            return res
              .status(400)
              .json({ msg: 'Something went wrong', success: false });
          });
      })
      .catch((error) => {
        console.log(error);
        return res
          .status(400)
          .json({ msg: 'Something went wrong', success: false });
      });
  }
);

module.exports = router;
