const app = require("./app");

console.log("App Started");

require("./startup/logging")();
require("./startup/db")();
require("./startup/config")();
require("./startup/prod")(app);

const port = process.env.PORT || 3000;
// app.listen(port, () => winston.info(`Listening on port ${port}...`));
if (require.main === module) {
  app.listen(port, () => console.log(`Listening on port ${port}...`));
}

module.exports = app;
