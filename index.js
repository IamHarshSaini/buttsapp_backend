const db = require('./db');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const scoket = require('./socket');
const express = require('express');

const PORT = process.env.PORT || 8080;
const routes = require('./app/routes/index');
const { tryCatch } = require('./common/constant');
const Group = require('./app/models/Group');

// app
const app = express();
const server = http.createServer(app);

// socket
scoket(server);

// express and cors
app.use(cors());
app.use(express.json());

// morgan for logs
app.use(morgan('tiny'));

// handle routes
routes(app);

// server
server.listen(PORT,async (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});

// middleware
// app.use((req, res, next) => {
//   try {
//     const authHeader = req.headers["authorization"];
//     req.user = jwtDecode(authHeader);
//   } catch (error) {
//     console.error("Failed to decode token:", error.message);
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//   next();
// });

// url whiteList
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

// static file visible
// app.use(express.static(__dirname + "/public"));
// app.use(express.static("public"));
