const express = require("express");
const router = express.Router();

const { login, logout, verify, authorizeRoles, authorizeAppRoles } = require("../controller/authController");
const { getProfile, updateEmail, updatePassword, userList, updateActive, updateGroup, addUser, checkCurrUserGroup } = require("../controller/userController");
const { getAllGroups, addGroup } = require("../controller/groupController");
const { getAllApps, createApp, getAppDetails, updateApp } = require("../controller/appsController");
const { getAllPlans, getPlanDetails, createPlan, updatePlan } = require("../controller/planController");

// Auth roles
router.post("/auth/login", login);
router.get("/auth/logout", logout);
router.get("/auth/verify", authorizeRoles(), verify);

// User routes
router.get("/users/profile", authorizeRoles(), getProfile);
router.put("/users/update-email", authorizeRoles(), updateEmail);
router.put("/users/update-password", authorizeRoles(), updatePassword);
router.put("/users/update-active", authorizeRoles(), updateActive);
router.put("/users/update-groups", authorizeRoles("admin"), updateGroup);
router.get("/users/user-list", authorizeRoles("admin"), userList);
router.put("/users/add-user", authorizeRoles("admin"), addUser);
router.post("/users/check-group", authorizeRoles(), checkCurrUserGroup);

// Group routes
router.get("/groups/get-all-groups", authorizeRoles("admin"), getAllGroups);
router.put("/groups/add-group", authorizeRoles("admin"), addGroup);

// Application routes
router.get("/app/get-all-apps-overview", authorizeRoles(), getAllApps);
router.get("/app/get-app-details", authorizeRoles(), getAppDetails);
router.put("/app/create-app", authorizeRoles("pl"), createApp);
router.put("/app/update-app", authorizeRoles("pl"), updateApp);

// Plan routes
router.get("/plan/get-all-plans", authorizeRoles("pl", "pm"), getAllPlans);
router.post("/plan/get-plan-details", authorizeRoles("pl", "pm"), getPlanDetails);
router.put("/plan/create-plan", authorizeRoles("pm"), createPlan);
router.put("/plan/update-plan", authorizeRoles("pm"), updatePlan);

// Task routes

module.exports = router;
