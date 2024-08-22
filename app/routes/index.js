const auth = require("./auth");

module.exports = function (app) {
  app.use("/auth", auth);

  app.get("/", (req, res)=> {
    res.send({
      message: `server is running on port ${process.env.PORT}`
    })
  })
};
