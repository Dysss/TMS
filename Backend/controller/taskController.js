const pool = require("../utils/db");

exports.getAllTasks = async (req, res) => {
    try {
        const app_acronym = req.body.task_app_acronym;

        let [queryResults, fields] = await pool.execute("SELECT * FROM task WHERE task_app_acronym = ?", [app_acronym]);

        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false });
    }
};

exports.getTaskDetails = async (req, res) => {
    try {
        const task_id = req.body.task_id;

        let [queryResults, fields] = await pool.execute("SELECT * FROM task WHERE task_id = ?", [task_id]);

        if (queryResults.length == 0) {
            return res.status(400).json({
                success: true,
                data: "Invalid task id",
            });
        }

        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false });
    }
};

exports.createTask = async (req, res) => {
    // Get connection
    const conn = await pool.getConnection();

    try {
        // Grab inputs except id (since we need to fetch rnumber)
        const task_name = req.body.task_name;
        const task_description = req.body.task_description || null;
        const task_notes = req.body.task_notes || null;
        const task_plan = req.body.task_plan || null;
        const task_app_acronym = req.body.task_app_Acronym;
        const task_state = "open";
        const task_creator = req.body.task_creator;
        const task_owner = req.body.task_owner;
        const task_createDate = req.body.task_createDate;

        // Begin transaction for task creation sequence
        await conn.beginTransaction();

        // Fetch and increment rnumber to form task id
        let [app_rnumber] = (await conn.execute("SELECT app_rnumber FROM application WHERE app_acronym = ?", [task_app_acronym]))[0];
        app_rnumber = app_rnumber.app_rnumber + 1;
        const task_id = req.body.task_app_Acronym + "_" + app_rnumber;
        // console.log(task_id)

        // Create task entry
        await conn.execute("INSERT INTO task (task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createDate]);

        // Update rnumber
        await conn.execute("UPDATE application SET app_rnumber = ? WHERE app_acronym = ?", [app_rnumber, task_app_acronym]);

        // Commit transaction if successful
        await conn.commit();

        return res.status(200).json({
            success: true,
            data: "Task created successfully",
        });
    } catch (err) {
        await conn.rollback();
        console.log(err);
        return res.status(500).json({ success: false });
    } finally {
        await conn.release();
    }
};

exports.updateTaskNotes = async (req, res) => {
    const conn = await pool.getConnection();

    try {
        const taskId = req.body.task_id;
        const newNotes = req.body.task_notes;

        conn.beginTransaction();

        let [queryResults, fields] = await pool.execute("UPDATE task SET task_notes = ? WHERE task_id = ?", [newNotes, taskId]);
        [queryResults, fields] = await pool.execute("UPDATE task SET task_owner = ? WHERE task_id = ?", [req.user.username, taskId]);

        conn.commit();

        return res.status(200).json({
            success: true,
            data: "Successfully updated task notes",
        });
    } catch (err) {
        conn.rollback();
        console.log(err);
        return res.status(500).json({ success: false });
    } finally {
        conn.release();
    }
};

exports.updateTaskPlan = async (req, res) => {
    if (req.body.task_state !== "open" && req.body.task_state !== "done") {
        console.log(req.body.task_state);
        return res.status(403).json({
            success: false,
            data: "Cannot modify plan in current state",
        });
    }

    try {
        const taskId = req.body.task_id;
        const newPlan = req.body.task_plan;
        const testAcronym = req.body.task_app_Acronym;

        let [queryResults, fields] = await pool.execute("UPDATE task SET task_plan = ?, task_app_acronym = ? WHERE task_id = ?", [newPlan, testAcronym, taskId]);

        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false });
    }
};

exports.updateTaskState = async (req, res) => {
    try {
        const taskId = req.body.task_id;
        const action = req.body.action;
        const taskState = req.body.task_state;
        const stateSeq = ["open", "todolist", "doing", "done", "closed"];

        // Handle demotion
        if (action == "demote") {
            // Only allow tasks in the doing or done state to be demoted
            if (taskState !== "doing" && taskState !== "done") {
                return res.status(403).json({
                    success: false,
                    data: "Task cannot be demoted in the current state",
                });
            }

            let currStateIndex = stateSeq.indexOf(taskState);
            let newState = stateSeq[currStateIndex - 1];

            let [queryResults, fields] = await pool.execute("UPDATE task SET task_state = ? WHERE task_state = ? AND task_id = ?", [newState, taskState, taskId]);

            return res.status(200).json({
                success: true,
                data: queryResults,
            });
        }
        // Handle promotion
        else if (action == "promote") {
            // Block promotion of closed tasks
            if (taskState == "closed") {
                return res.status(403).json({
                    success: false,
                    data: "Task cannot be promoted in the current state",
                });
            }
            let currStateIndex = stateSeq.indexOf(taskState);
            let newState = stateSeq[currStateIndex + 1];

            let [queryResults, fields] = await pool.execute("UPDATE task SET task_state = ? WHERE task_state = ? AND task_id = ?", [newState, taskState, taskId]);

            return res.status(200).json({
                success: true,
                data: queryResults,
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false });
    }
};
