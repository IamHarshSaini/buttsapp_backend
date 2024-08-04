const http = require("http");
const cors = require("cors");
const scoket = require("./socket");
const express = require("express");

const PORT = process.env.PORT || 8080;
const routes = require("./app/routes/index");

// app
const app = express();
const server = http.createServer(app);

// socket
scoket(server);

// express
app.use(cors());
app.use(express.json());

// handle routes
routes(app);

// server
server.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});

// for urls whiteList
// let whiteList = ['https://sainiharsh.netlify.app/', 'http://localhost:5173'];
// app.use(cors({
//     origin: function (origin, callback) {
//         if (whiteList.indexOf(origin) === -1) {
//             var msg = 'The CORS policy for this site does not ' +
//                 'allow access from the specified Origin.';
//             return callback(new Error(msg), false);
//         }
//         return callback(null, true);
//     }, credentials: true
// }));

// app.use(express.static(__dirname + "/public"));
// app.use(express.static("public"));

// logs
// app.use(function (req, res, next) {
//   console.log(req.url);
//   next();
// });
