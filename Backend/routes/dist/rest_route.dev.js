"use strict";

// REST routing table for controllers using microservice design for assignment 3
var express = require("express");

var _require = require("../controller/rest-controllers"),
    createTask = _require.createTask,
    getTaskByState = _require.getTaskByState,
    promoteTask2Done = _require.promoteTask2Done;

var router = express.Router();
router.post("/task/createTask", createTask);
router.post("/task/getTaskByState", getTaskByState);
router.patch("/task/promoteTask2Done", promoteTask2Done);
module.exports = router;