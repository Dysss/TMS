"use strict";

// REST routing table for controllers using microservice design for assignment 3
var express = require("express");

var _require = require("../controller/rest-controllers"),
    createTask = _require.createTask;

var router = express.Router();
router.put("/create-task", createTask);
module.exports = router;