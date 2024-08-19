const express = require("express");
const router = express.Router();
const controller = require("../controllers/message");

router.get("", controller.get);

module.exports = router;
