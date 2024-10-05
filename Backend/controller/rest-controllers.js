// REST api endpoints using microservice design for assignment 3
const { application } = require("express");
const app = require("../app");
const pool = require("../utils/db");
const { mailer } = require("../utils/mailer");
const bcrypt = require("bcryptjs");

const checkGroup = async (username, groupname) => {
    let [queryResults, fields] = await pool.execute(
        `SELECT * FROM user u JOIN user_group ug ON u.user_name = ug.user_name JOIN group_list g ON ug.group_id = g.group_id WHERE u.user_name = ? AND g.group_name = ?`,
        [username, groupname]
    );

    if (queryResults.length == 0) {
        return false;
    } else {
        return true;
    }
};

exports.createTask = async (req, res) => {
    // Check for correct URL
    if (req.originalUrl !== "/api/v2/create-task") {
        return res.status(400).json({ code: "U001" });
    }

    // Get connection
    const conn = await pool.getConnection();
    try {
        // Grab variables
        const {
            username,
            password,
            task_name,
            task_description = null,
            task_notes = null,
            task_plan = null,
            task_appAcronym,
        } = req.body;

        // Check that correct keys are sent
        if (
            username == undefined ||
            password == undefined ||
            task_name == undefined ||
            task_appAcronym == undefined
        ) {
            return res.status(400).json({ code: "P001" });
        }

        // Login/Verify credentials
        let [userDetails] = await pool.execute(
            "SELECT password, active from user WHERE user_name = ?",
            [username]
        );

        // Check if user exists
        if (userDetails.length == 0) {
            return res.status(401).json({ code: "A001" });
        }

        // Check for correct pw
        let pwMatch = await bcrypt.compare(password, userDetails[0].password);
        if (!pwMatch) {
            return res.status(401).json({ code: "A001" });
        }

        // Check if user is active
        if (userDetails[0].active != 1) {
            return res.status(401).json({ code: "A002" });
        }

        // Check if task_appAcronym is a valid app acronym
        const [appDetails] = await pool.execute(
            "SELECT app_acronym, app_rnumber FROM application WHERE app_Acronym = ?",
            [task_appAcronym]
        );
        if (appDetails.length == 0) {
            return res.status(400).json({ code: "P002" });
        }

        // Check if plan is valid
        if (task_plan) {
            const [planList] = await pool.execute(
                "SELECT plan_MVP_name FROM plan WHERE plan_MVP_name = ?",
                [task_plan]
            );
            const planMVPList = planList.map((plan) => plan.plan_MVP_name);
            if (planMVPList.length == 0) {
                return res.status(400).json({ code: "P002" });
            }
        }

        // Check for correct permissions
        let [permittedGrp] = await pool.execute(
            "SELECT app_permit_Create FROM application WHERE app_Acronym = ?",
            [task_appAcronym]
        );

        // Check if app_permit_Create is assigned to any group
        if (permittedGrp.length == 0) {
            return res.status(403).json({ code: "A003" });
        }

        // Check if user is assigned the permitted group
        const userPermitted = await checkGroup(
            username,
            permittedGrp[0].app_permit_Create
        );

        if (!userPermitted) {
            return res.status(403).json({ code: "A003" });
        }

        // Check if task_name is within acceptable length
        if (task_name.length > 64) {
            return res.status(400).json({ code: "P003" });
        }

        // Check if task_description is within acceptable length
        if (task_description.length > 255) {
            return res.status(400).json({ code: "P003" });
        }

        // Check if task_notes is within acceptable length
        if (task_notes.length > 65535) {
            return res.status(400).json({ code: "P003" });
        }

        // Begin transaction for task creation sequence
        await conn.beginTransaction();

        // Fetch and increment rnumber to generate task id
        // let [app_rnumber] = (
        //     await conn.execute(
        //         "SELECT app_rnumber FROM application WHERE app_acronym = ?",
        //         [task_appAcronym]
        //     )
        // )[0];
        // app_rnumber = app_rnumber.app_rnumber + 1;
        const new_rnumber = appDetails.app_rnumber + 1;
        const task_id = req.body.task_appAcronym + "_" + new_rnumber.toString();

        // Generate date
        let currDate = new Date();
        let currDateString =
            currDate.getDate().toString().padStart(2, "0") +
            "-" +
            (currDate.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            currDate.getFullYear().toString();

        // Create task entry
        await conn.execute(
            "INSERT INTO task \
            (task_id, task_name, task_description, task_notes, task_plan, task_app_Acronym, task_state, task_creator, task_owner, task_createDate)\
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                task_id,
                task_name,
                task_description,
                task_notes,
                task_plan,
                task_appAcronym,
                "open",
                username,
                username,
                currDateString,
            ]
        );

        // Update rnumber
        await conn.execute(
            "UPDATE application SET app_rnumber = ? WHERE app_acronym = ?",
            [new_rnumber, task_appAcronym]
        );

        // Commit transaction if successful
        await conn.commit();

        return res.status(200).json({ code: "S001" });
    } catch (err) {
        await conn.rollback();
        console.log(err);
        return res.status(500).json({ code: "E001" });
    } finally {
        await conn.release();
    }
};

exports.getTaskByState = async (req, res) => {
    // Check for correct URL
    if (req.originalUrl !== "/api/v2/create-task") {
        return res.status(400).json({ code: "U001" });
    }
    try {
        const { username, password, task_state, task_appAcronym } = req.body;

        if (
            username == undefined ||
            password == undefined ||
            task_state == undefined ||
            task_appAcronym == undefined
        ) {
            return res.status(400).json({ code: "P001" });
        }

        // Login/Verify credentials
        let [userDetails] = await pool.execute(
            "SELECT password, active from user WHERE user_name = ?",
            [username]
        );

        // Check if user exists
        if (userDetails.length == 0) {
            return res.status(401).json({ code: "A001" });
        }

        // Check for correct pw
        let pwMatch = await bcrypt.compare(password, userDetails[0].password);
        if (!pwMatch) {
            return res.status(401).json({ code: "A001" });
        }

        // Check if user is active
        if (userDetails[0].active != 1) {
            return res.status(401).json({ code: "A002" });
        }

        // Check if task_appAcronym is a valid app acronym
        const [appList] = await pool.execute(
            "SELECT app_acronym, app_rnumber FROM application"
        );
        const appAcronymList = appList.map((app) => app.app_acronym);
        if (!appAcronymList.includes(task_appAcronym)) {
            return res.status(400).json({ code: "P002" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: "E001" });
    }
};
