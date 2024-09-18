const pool = require("../utils/db");

exports.getAllGroups = async (req, res) => {
    try {
        let [queryResults, fields] = await pool.execute("SELECT group_name FROM group_list");

        res.status(200).json({
            success: true,
            result: queryResults,
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            error: err,
        });
    }
};

// Required input: groupName
exports.addGroup = async (req, res) => {
    try {
        let groupName = req.body.groupName;

        let [queryResults, fields] = await pool.execute("INSERT INTO group_list (group_name) VALUES (?)", [groupName]);

        res.status(200).json({
            success: true,
            result: queryResults,
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            error: err,
        });
    }
};
