const mongoose = require('mongoose');

mongoose.connect('mongoosedatabaseurl', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}) // TODO: Change the link inside inverted commas to database link