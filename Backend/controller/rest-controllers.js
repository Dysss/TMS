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
        if (username == undefined ||
            password == undefined ||
            task_name == undefined ||
            task_appAcronym == undefined) {
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
    if (req.originalUrl !== "/api/v2/get-task-by-state") {
        return res.status(400).json({ code: "U001" });
    }
    try {
        const { username, password, task_state, task_appAcronym } = req.body;

        // Check tht correct keys are sent
        if (username == undefined ||
            password == undefined ||
            task_state == undefined ||
            task_appAcronym == undefined) {
                return res.status(400).json({ code: "P001" });
        }

        // Check that task state is a valid state
        if (task_state != 'open' && 
            task_state != 'todolist' && 
            task_state != 'doing' && 
            task_state != 'done' && 
            task_state != 'closed') {
                return res.status(400).json({ code: "P002" })
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
            "SELECT app_acronym FROM application WHERE app_Acronym = ?",
            [task_appAcronym]
        );
        if (appDetails.length == 0) {
            return res.status(400).json({ code: "P002" });
        }

        // Fetch tasks
        const [tasks] = await pool.execute(
            "SELECT t.task_id, t.task_name, t.task_description, t.task_owner, p.plan_color\
            FROM task t JOIN plan p ON t.task_plan = p.plan_MVP_name\
            WHERE t.task_state = ?",
            [task_state]
        )

        return res.status(200).json({
            code: "S001",
            data: tasks
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: "E001" });
    }
};

exports.promoteTask2Done = async (req, res) => {
    // Check for correct URL
    if (req.originalUrl !== "/api/v2/promote-task-to-done") {
        return res.status(400).json({ code: "U001" });
    }
    
    try {
        // Grab variables
        const {
            username,
            password,
            task_id,
        } = req.body;

        // Check that correct keys are sent
        if (username == undefined ||
            password == undefined ||
            task_id == undefined) {
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

        // Check if user has permissions to promote to done
        let task_appAcronym = task_id.replace(/_\d+$/, "");
        let [grpPermissions] = await pool.execute(
            "SELECT app_permit_Doing, app_permit_Done FROM application WHERE app_Acronym = ?",
            [task_appAcronym]
        )

        const userPermitted = await checkGroup(
            username,
            grpPermissions[0].app_permit_Doing
        );

        if (!userPermitted) {
            return res.status(403).json({ code: "A003" });
        }

        // Get task details if it exists
        let [taskDetails] = await pool.execute(
            "SELECT task_state FROM task WHERE task_id = ?", 
            [task_id]
        )

        // Check task exists
        if (taskDetails.length == 0) {
            return res.status(400).code({ code: "P002" });
        }

        // Check that task state is "doing"
        if (taskDetails[0].task_state != "doing") {
            return res.status(400).json({ code: "P004" })
        }

        // Update task state
        await pool.execute(
            "UPDATE task SET task_state = ? WHERE task_id = ?",
            ["done", task_id]
        )

        // Send email to all PLs (or group assigned to "done" state)
        const [userEmails] = await pool.execute(
            "SELECT email FROM user u \
            JOIN user_group ug ON u.user_name = ug.user_name\
            JOIN group_list g ON ug.group_id = g.group_id\
            WHERE g.group_name = ?",
            [grpPermissions[0].app_permit_Done]
        )

        let recipients = userEmails.length > 0 ? [userEmails].map((obj) => `<${obj.email}>`).join(", ") : "pl@da.com";

        console.log(recipients)

        // mailer.sendMail(
        //     {
        //         from: "<tms@da.com>",
        //         to: `${recipients}`,
        //         subject: `Task ${taskId} requires your review`,
        //         text: `Hi PL, ${taskId} has been promoted to the "done" state and requires your review.`,
        //     },
        //     (info, err) => err ? console.log(err) : console.log(info)
        // )

        return res.status(200).json({ code: "S001" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ code: "E001" })
    }
}