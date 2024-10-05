// REST routing table for controllers using microservice design for assignment 3
const express = require("express");
const { createTask, getTaskByState, promoteTask2Done } = require("../controller/rest-controllers");
const router = express.Router();

router.put("/create-task", createTask);
router.post("/get-task-by-state", getTaskByState);
router.post("/promote-task-to-done", promoteTask2Done);

module.exports = router;
