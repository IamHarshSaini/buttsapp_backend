const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth");

router.get("/users", controller.get);
router.get("/login", controller.login);
router.post("/register", controller.register);
router.get("/social/:social", controller.social);
router.post("/social/:social", controller.socialVerify);

module.exports = router;
