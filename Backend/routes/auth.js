const express = require("express");
const router = express.Router();

const { login, logout, verify } = require("../controller/authController");
const { authenticateJWT } = require("../middleware/auth");

router.post("/login", login);
router.get("/logout", logout);
router.get("/verify", authenticateJWT, verify);

module.exports = router;
