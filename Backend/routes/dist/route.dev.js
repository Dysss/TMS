"use strict";

var express = require("express");

var router = express.Router();

var _require = require("../controller/authController"),
    login = _require.login,
    logout = _require.logout,
    verify = _require.verify,
    authorizeRoles = _require.authorizeRoles,
    authorizeAppRoles = _require.authorizeAppRoles;

var _require2 = require("../controller/userController"),
    getProfile = _require2.getProfile,
    updateEmail = _require2.updateEmail,
    updatePassword = _require2.updatePassword,
    userList = _require2.userList,
    updateActive = _require2.updateActive,
    updateGroup = _require2.updateGroup,
    addUser = _require2.addUser,
    checkCurrUserGroup = _require2.checkCurrUserGroup;

var _require3 = require("../controller/groupController"),
    getAllGroups = _require3.getAllGroups,
    addGroup = _require3.addGroup;

var _require4 = require("../controller/appsController"),
    getAllApps = _require4.getAllApps,
    createApp = _require4.createApp,
    getAppDetails = _require4.getAppDetails,
    updateApp = _require4.updateApp;

var _require5 = require("../controller/planController"),
    getAllPlans = _require5.getAllPlans,
    getPlanDetails = _require5.getPlanDetails,
    createPlan = _require5.createPlan,
    updatePlan = _require5.updatePlan;

var _require6 = require("../controller/taskController"),
    getAllTasks = _require6.getAllTasks,
    createTask = _require6.createTask,
    updateTaskNotes = _require6.updateTaskNotes,
    updateTaskPlan = _require6.updateTaskPlan,
    updateTaskState = _require6.updateTaskState; // Auth roles


router.post("/auth/login", login);
router.get("/auth/logout", logout);
router.get("/auth/verify", authorizeRoles(), verify); // User routes

router.get("/users/profile", authorizeRoles(), getProfile);
router.put("/users/update-email", authorizeRoles(), updateEmail);
router.put("/users/update-password", authorizeRoles(), updatePassword);
router.put("/users/update-active", authorizeRoles(), updateActive);
router.put("/users/update-groups", authorizeRoles("admin"), updateGroup);
router.get("/users/user-list", authorizeRoles("admin"), userList);
router.put("/users/add-user", authorizeRoles("admin"), addUser);
router.post("/users/check-group", authorizeRoles(), checkCurrUserGroup); // Group routes

router.get("/groups/get-all-groups", authorizeRoles("admin"), getAllGroups);
router.put("/groups/add-group", authorizeRoles("admin"), addGroup); // Application routes

router.get("/app/get-all-apps-overview", authorizeRoles(), getAllApps);
router.post("/app/get-app-details", authorizeRoles(), getAppDetails);
router.put("/app/create-app", authorizeRoles("pl"), createApp);
router.put("/app/update-app", authorizeRoles("pl"), updateApp); // Plan routes

router.post("/plan/get-all-plans", authorizeRoles("pl", "pm"), getAllPlans);
router.post("/plan/get-plan-details", authorizeRoles("pl", "pm"), getPlanDetails);
router.put("/plan/create-plan", authorizeRoles("pm"), createPlan);
router.put("/plan/update-plan", authorizeRoles("pm"), updatePlan); // Task routes

router.post("/task/get-app-tasks", authorizeRoles(), getAllTasks);
router.put("/task/create-task", authorizeAppRoles, createTask);
router.put("/task/update-task-notes", authorizeAppRoles, updateTaskNotes);
router.put("/task/update-task-plan", authorizeAppRoles, updateTaskPlan);
router.put("/task/update-task-state", authorizeAppRoles, updateTaskState);
module.exports = router;