const mongoose = require("mongoose");
var uri = process.env.MONGODB_URI;

const connect = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log("connected to mongodb");
  } catch (e) {
    console.log("err", e);
  }
};

module.exports = connect;
