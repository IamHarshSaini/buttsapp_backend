const auth = require("./auth");
const message = require("./message")

module.exports = function (app) {
  app.use("/auth", auth);
  app.use("/message", message);

  app.get("/", (req, res)=> {
    res.send({
      message: `server is running on port ${process.env.PORT}`
    })
  })
};
