// REST routing table for controllers using microservice design for assignment 3
const express = require("express");
const {
    createTask,
    getTaskByState,
    promoteTask2Done,
} = require("../controller/rest-controllers");
const router = express.Router();

router.post("/task/createTask", createTask);
router.post("/task/getTaskByState", getTaskByState);
router.patch("/task/promoteTask2Done", promoteTask2Done);

module.exports = router;
