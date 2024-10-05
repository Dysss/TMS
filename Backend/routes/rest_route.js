// REST routing table for controllers using microservice design for assignment 3
const express = require("express");
const { createTask } = require("../controller/rest-controllers");
const router = express.Router();

router.put("/create-task", createTask);

module.exports = router;
