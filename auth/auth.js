const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports.verifyUser = function (req, res, next) {
  try {
    token = req.headers.authorization.split(' ')[1];
    const data = jwt.verify(token, 'mysecretkey');

    User.findOne({ _id: data._id })
      .then(function (result) {
        req.userInfo = result;
        next();
      })
      .catch(function (e) {
        res.status(400).json({ msg: 'Invalid token', error: e });
      });
  } catch (e) {
    res.status(400).json({ msg: 'Invalid token', error: e });
  }
};

module.exports.verifyAdmin = function (req, res, next) {
  try {
    token = req.headers.authorization.split(' ')[1];
    const data = jwt.verify(token, 'mysecretkey');

    User.findOne({ _id: data._id })
      .then(function (result, err) {
        if (result.isAdmin) {
          req.userInfo = result;
          next();
        } else {
          console.log(err);
          res.status(400).json({ msg: 'User is not an admin' });
        }
      })
      .catch(function (e) {
        res.status(400).json({ msg: 'Invalid token', error: e });
      });
  } catch (e) {
    res.status(400).json({ msg: 'Invalid token', error: e });
  }
};
