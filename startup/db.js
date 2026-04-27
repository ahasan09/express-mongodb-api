const config = require("config");
const mongoose = require("mongoose");

module.exports = function() {
  const mongoDb = config.get("db");
  
  if (!config.get("db")) {
    console.log("FATAL ERROR: db is not defined");
    process.exit(1);
  }

  //"mongodb://localhost/customer_management";
  mongoose.connect(mongoDb);
  //Get the default connection
  var db = mongoose.connection;
  db.on("connected", () =>
    console.log("Mongodb database connected successfully...")
  );
  db.on("disconnected", () => console.log("connection disconnected"));
  //db.on("error", console.error.bind(console, "MongoDB connection error:"));
};
