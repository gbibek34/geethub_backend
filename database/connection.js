const mongoose = require('mongoose');

// cloud db
// mongoose.connect('mongodb+srv://tenzin:softwarica@cluster0.tsby5.mongodb.net/?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }) 

// local db
mongoose.connect('mongodb://localhost:27017/GeethubLocal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}) 

mongoose.connection.on("connected", ()=>{
  console.log("Connected to mongoDB")
})
mongoose.connection.on("error", ()=>{
  console.log("Error connecting to database")
})