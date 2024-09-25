const pool = require("../utils/db");

exports.getAllApps = async (req, res) => {
    try {
        let [queryResults, fields] = await pool.execute("SELECT app_acronym, app_description, app_rnumber FROM application");
        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
};

exports.getAppDetails = async (req, res) => {
    try {
        acronym = req.body.app_acronym;

        let [queryResults, fields] = await pool.execute("SELECT * FROM application WHERE app_acronym = ?", [acronym]);
        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
};

exports.createApp = async (req, res) => {
    try {
        const acronym = req.body.app_Acronym;
        const description = req.body.app_description || null;
        const rnumber = req.body.app_rnumber;
        const startdate = req.body.app_startDate.split("-").reverse().join("-"); // Input comes as yyyy-mm-dd so we reverse it
        const enddate = req.body.app_endDate.split("-").reverse().join("-");
        const permitCreate = req.body.app_permit_Create || null;
        const permitOpen = req.body.app_permit_Open || null;
        const permitTodoList = req.body.app_permit_toDoList || null;
        const permitDoing = req.body.app_permit_Doing || null;
        const permitDone = req.body.app_permit_Done || null;

        let [queryResults, fields] = await pool.execute("INSERT INTO application (app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [acronym, description, rnumber, startdate, enddate, permitCreate, permitOpen, permitTodoList, permitDoing, permitDone]);

        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
};

exports.updateApp = async (req, res) => {
    try {
        const acronym = req.body.app_Acronym;
        const description = req.body.app_description || null;
        const rnumber = req.body.app_rnumber;
        const startdate = req.body.app_startDate.split("-").reverse().join("-"); // Input comes as yyyy-mm-dd so we reverse it
        const enddate = req.body.app_endDate.split("-").reverse().join("-");
        const permitCreate = req.body.app_permit_Create || null;
        const permitOpen = req.body.app_permit_Open || null;
        const permitTodoList = req.body.app_permit_toDoList || null;
        const permitDoing = req.body.app_permit_Doing || null;
        const permitDone = req.body.app_permit_Done || null;

        let [queryResults, fields] = await pool.execute("UPDATE application SET app_description = ?, app_permit_create = ?, app_permit_open = ?, app_permit_todolist = ?, app_permit_doing = ?, app_permit_done = ? WHERE app_acronym = ?", [description, permitCreate, permitOpen, permitTodoList, permitDoing, permitDone, acronym]);

        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
};
