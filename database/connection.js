const mongoose = require('mongoose');

module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.connect(process.env.DB, connectionParams);
  } catch (error) {
    console.error(error);
  }
};
