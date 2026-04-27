const config = require("config");
const winston = require("winston");
require("winston-mongodb");

module.exports = function() {
  const mongoConnString = config.get("db");
  if (!mongoConnString) {
    console.log("FATAL ERROR: mongoConnString is not defined");
    process.exit(1);
  } else console.log("mongoConnString: ", mongoConnString);

  process.on("uncaughtException", ex => {
    winston.error(ex.message, ex);
    process.exit(1);
  });

  process.on("unhandledRejection", ex => {
    winston.error(ex.message, ex);
    process.exit(1);
  });

  winston.add(new winston.transports.File({ filename: "logfile.log" }));

  winston.add(
    new winston.transports.MongoDB({
      db: config.get("db"), //"mongodb://localhost/customer_management",
      level: "error"
    })
  );
};
