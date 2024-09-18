const express = require("express");
const router = express.Router();

const { getProfile, updateEmail, updatePassword, userList, updateActive, updateGroup, addUser, checkCurrUserGroup } = require("../controller/userController");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");

router.get("/profile", authenticateJWT, getProfile);
router.put("/update-email", authenticateJWT, updateEmail);
router.put("/update-password", authenticateJWT, updatePassword);
router.put("/update-active", authenticateJWT, updateActive);
router.put("/update-groups", authenticateJWT, authorizeRoles("admin"), updateGroup);
router.get("/user-list", authenticateJWT, authorizeRoles("admin"), userList);
router.put("/add-user", authenticateJWT, authorizeRoles("admin"), addUser);
router.post("/check-group", authenticateJWT, checkCurrUserGroup);

module.exports = router;
