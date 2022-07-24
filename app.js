require('dotenv').config();
const express = require('express');
var cors = require('cors');
const connection = require('./database/connection');

require('./models/userModel');
require('./models/userVerificationModel');

connection();

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);

  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,POST,PUT,DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization'
  );
  next();
});

const authRoute = require('./routes/authRoutes');
const musicRoute = require('./routes/musicRoutes');
const profileRoute = require('./routes/profileRoutes');
const playlistRoute = require('./routes/playlistRoutes');
const artistRoute = require('./routes/artistRoutes');
const reportRoute = require('./routes/reportRoutes');
const adminRoute = require('./routes/admin/adminRoutes');
const transactionRoute = require('./routes/transactionRoutes');

app.use(artistRoute);
app.use(profileRoute);
app.use(authRoute);
app.use(musicRoute);
app.use(playlistRoute);
app.use(transactionRoute);
app.use(adminRoute);
app.use(reportRoute);

//here
app.get('/', (req, res) => {
  res.send('hello world');
});

app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/music'));
app.use(cors());
app.options('*', cors());

app.listen(3000, () => console.log('listening to port 3000'));

module.exports = app;
