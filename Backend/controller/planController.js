const pool = require("../utils/db");

exports.getAllPlans = async (req, res) => {
    try {
        const appAcronym = req.body.app_Acronym;
        let [queryResults, fields] = await pool.execute("SELECT plan_MVP_name, plan_color FROM plan WHERE plan_app_Acronym = ?", [appAcronym]);

        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
};

exports.getPlanDetails = async (req, res) => {
    try {
        const mvpName = req.body.plan_mvp_name;

        let [queryResults, fields] = await pool.execute("SELECT * FROM plan WHERE plan_mvp_name = ?", [mvpName]);

        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
};

exports.createPlan = async (req, res) => {
    try {
        const mvpName = req.body.plan_MVP_name;
        const startDate = req.body.plan_startDate.split("-").reverse().join("-");
        const endDate = req.body.plan_endDate.split("-").reverse().join("-");
        const acronym = req.body.plan_app_acronym;
        const color = req.body.plan_color;

        let [queryResults, fields] = await pool.execute("INSERT INTO plan (plan_mvp_name, plan_startdate, plan_enddate, plan_app_acronym, plan_color) VALUES (?, ?, ?, ?, ?)", [mvpName, startDate, endDate, acronym, color]);

        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const mvpName = req.body.plan_MVP_name;
        const startDate = req.body.plan_startDate.split("-").reverse().join("-");
        const endDate = req.body.plan_endDate.split("-").reverse().join("-");
        const acronym = req.body.plan_app_acronym;
        const color = req.body.plan_color;

        // console.log(mvpName)
        // console.log(startDate)
        // console.log(endDate)
        // console.log(acronym)
        // console.log(color)

        let [queryResults, fields] = await pool.execute("UPDATE plan SET plan_startdate = ?, plan_enddate = ?, plan_app_acronym = ?, plan_color = ? WHERE plan_mvp_name = ?", [startDate, endDate, acronym, color, mvpName]);

        return res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false });
    }
};
