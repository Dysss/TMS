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
        const acronym = req.body.app_acronym;
        const description = req.body.app_description || null;
        const rnumber = req.body.app_rnumber;
        const startdate = req.body.app_startdate;
        const enddate = req.body.app_enddate;
        const permitCreate = req.body.app_permit_create || null;
        const permitOpen = req.body.app_permit_open || null;
        const permitTodoList = req.body.app_permit_todolist || null;
        const permitDoing = req.body.app_permit_doing || null;
        const permitDone = req.body.app_permit_done || null;

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
        const acronym = req.body.app_acronym;
        const description = req.body.app_description;
        const permitCreate = req.body.app_permit_create;
        const permitOpen = req.body.app_permit_open;
        const permitTodoList = req.body.app_permit_todolist;
        const permitDoing = req.body.app_permit_doing;
        const permitDone = req.body.app_permit_done;

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
