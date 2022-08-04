const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './music');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const filter = function (req, file, cb) {
  if (
    file.mimetype === 'audio/mp3' ||
    file.mimetype === 'audio/mpeg' ||
    file.mimetype == 'image/jpeg' ||
    file.mimetype == 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const musicUpload = multer({
  storage: storage,
  fileFilter: filter,
});

module.exports = musicUpload;
