const pool = require("../utils/db");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const checkGrpFn = require("../middleware/auth").checkGroup;

// Required input: None
exports.getProfile = async (req, res) => {
    try {
        let [queryResults, fields] = await pool.execute("SELECT * from user WHERE user_name = ?", [req.user.username]);
        res.status(200).json({
            success: true,
            data: queryResults,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err,
        });
    }
};

// Required input: new email, target user
exports.updateEmail = async (req, res) => {
    try {
        let newEmail = req.body.newEmail;
        let targetUser = req.body.targetUser;
        let [queryResults, fields] = await pool.execute("UPDATE user SET email = ? WHERE user_name = ?", [newEmail, targetUser]);

        res.status(200).json({
            success: true,
            data: queryResults.info,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err,
        });
    }
};

// Required input: new password, target user
exports.updatePassword = async (req, res) => {
    try {
        let targetUser = req.body.targetUser;
        // Hash pw to store in db
        hashedPw = await bcrypt.hash(req.body.newPassword, 10);

        [queryResults, fields] = await pool.execute("UPDATE user SET password = ? WHERE user_name = ?", [hashedPw, targetUser]);

        res.status(200).json({
            success: true,
            message: queryResults.info,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err,
        });
    }
};

// Required input: new active, target user
exports.updateActive = async (req, res) => {
    try {
        let newActive = req.body.newActive;
        let targetUser = req.body.targetUser;

        let [queryResults, fields] = await pool.execute("UPDATE user SET active = ? WHERE user_name = ?", [newActive, targetUser]);

        res.status(200).json({
            success: true,
            message: queryResults,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err,
        });
    }
};

// Required input: targetUser | Optional input: addGroups, removeGroups
exports.updateGroup = async (req, res) => {
    let targetUser = req.body.targetUser;
    let addGroups = req.body.addGroups;
    let removeGroups = req.body.removeGroups;

    // console.log(addGroups);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        if (addGroups) {
            for (const group of addGroups) {
                let [queryResults, fields] = await connection.execute("INSERT INTO user_group (user_name, group_id) VALUES (?, (SELECT group_id FROM group_list WHERE group_name = ?))", [targetUser, group]);
            }
        }

        if (removeGroups) {
            for (const group of removeGroups) {
                let [queryResults, fields] = await connection.execute("DELETE FROM user_group WHERE user_name = ? AND group_id = (SELECT group_id FROM group_list WHERE group_name = ?)", [targetUser, group]);
            }
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Groups updated",
        });
    } catch (err) {
        await connection.rollback();

        console.log(err);

        res.status(500).json({
            success: false,
            error: err,
        });
    } finally {
        await connection.release();
    }
};

exports.userList = async (req, res) => {
    try {
        let [queryResults, fields] = await pool.execute("SELECT u.user_name, u.email, u.active, GROUP_CONCAT(g.group_name ORDER BY g.group_name  SEPARATOR ', ') AS 'groups' FROM user u LEFT JOIN user_group ug ON u.user_name = ug.user_name LEFT JOIN group_list g ON ug.group_id = g.group_id GROUP BY u.user_name");
        res.status(200).json({
            success: true,
            results: queryResults,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err,
        });
    }
};

// Required input: username, password, active | Optional input: email
exports.addUser = async (req, res) => {
    try {
        const username = req.body.user_name;
        const password = req.body.password;
        const active = req.body.active;
        const email = req.body.email ? req.body.email : null;

        // console.log("New user details:");
        // console.log(username);
        // console.log(password);
        // console.log(active);
        // console.log(email);

        hashedPw = await bcrypt.hash(password, 10);

        let [queryResults, fields] = await pool.execute("INSERT INTO user (user_name, password, email, active) VALUES (?, ?, ?, ?)", [username, hashedPw, email, active]);

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

// Required input: group
exports.checkCurrUserGroup = async (req, res) => {
    const username = req.user.username;
    const group = req.body.group;

    try {
        const inGroup = await checkGrpFn(username, group);

        if (inGroup) {
            res.status(200).json({
                success: true,
                result: true,
            });
        } else {
            res.status(200).json({
                success: true,
                result: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
        });
        console.log(err);
    }
};
