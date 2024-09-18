const express = require("express");
const router = express.Router();

const { getAllGroups, addGroup } = require("../controller/groupController");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");

router.get("/get-all-groups", authenticateJWT, authorizeRoles("admin"), getAllGroups);
router.put("/add-group", authenticateJWT, authorizeRoles("admin"), addGroup);

module.exports = router;
