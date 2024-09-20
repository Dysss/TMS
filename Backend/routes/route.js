const express = require("express");
const router = express.Router();

const { login, logout, verify, authenticateJWT, authorizeRoles } = require("../controller/authController");
const { getProfile, updateEmail, updatePassword, userList, updateActive, updateGroup, addUser, checkCurrUserGroup } = require("../controller/userController");
const { getAllGroups, addGroup } = require("../controller/groupController");
// const { authenticateJWT, authorizeRoles } = require("../middleware/auth");

// Auth roles
router.post("/auth/login", login);
router.get("/auth/logout", logout);
router.get("/auth/verify", authorizeRoles(), verify);
// router.get("/verify", authenticateJWT, verify);

// User routes
router.get("/users/profile", authorizeRoles(), getProfile);
router.put("/users/update-email", authorizeRoles(), updateEmail);
router.put("/users/update-password", authorizeRoles(), updatePassword);
router.put("/users/update-active", authorizeRoles(), updateActive);
router.put("/users/update-groups", authorizeRoles("admin"), updateGroup);
router.get("/users/user-list", authorizeRoles("admin"), userList);
router.put("/users/add-user", authorizeRoles("admin"), addUser);
router.post("/users/check-group", authorizeRoles(), checkCurrUserGroup);
// router.get("/users/profile", authenticateJWT, getProfile);
// router.put("/users/update-email", authenticateJWT, updateEmail);
// router.put("/users/update-password", authenticateJWT, updatePassword);
// router.put("/users/update-active", authenticateJWT, updateActive);
// router.put("/users/update-groups", authenticateJWT, authorizeRoles("admin"), updateGroup);
// router.get("/users/user-list", authenticateJWT, authorizeRoles("admin"), userList);
// router.put("/users/add-user", authenticateJWT, authorizeRoles("admin"), addUser);
// router.post("/users/check-group", authenticateJWT, checkCurrUserGroup);

// Group routes
router.get("/groups/get-all-groups", authenticateJWT, authorizeRoles("admin"), getAllGroups);
router.put("/groups/add-group", authenticateJWT, authorizeRoles("admin"), addGroup);

module.exports = router;
