const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv").config({ path: "./config/config.env" });
const pool = require("../utils/db");

exports.generateJWT = (username, ip, ua) => {
    // Attach username in payload
    const token = jwt.sign(
        {
            username: username,
            ip: ip,
            ua: ua,
        },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
    );
    return token;
};

exports.authenticateJWT = (req, res, next) => {
    // Grab jwt from cookies
    const token = req.cookies.jwt;

    // If no token
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "User not logged in",
        });
    }

    // Verify jwt
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            if (err.name == "TokenExpiredError") {
                res.clearCookie("jwt");

                return res.status(401).json({
                    success: false,
                    error: "JWT token expired. Please log in.",
                });
            } else if (err.name == "JsonWebTokenError") {
                return res.status(401).json({
                    success: false,
                    error: "JWT token invalid. Please log in",
                });
            } else {
                return res.status(401).json({
                    success: false,
                    error: err.message,
                });
            }
        }

        // Check if ip and ua are the same
        if (decoded.ip != req.ip || decoded.ua != req.headers["user-agent"]) {
            console.log("Received ");
            console.log(decoded);
            return res.status(401).json({
                success: false,
                error: "JWT token invalid.",
            });
        }

        // Check if user is active
        let [queryResults, fields] = await pool.execute(`SELECT active FROM user WHERE user_name = ?`, [decoded.username]);

        isActive = queryResults[0].active;
        console.log("Is active: ", isActive);
        if (!isActive) {
            return res.status(401).json({
                success: false,
                error: "User is disabled",
            });
        }

        // Attach username to req.user
        req.user = decoded;
        next();
    });
};

exports.checkGroup = async (username, groupname) => {
    let [queryResults, fields] = await pool.execute(`SELECT * FROM user u JOIN user_group ug ON u.user_name = ug.user_name JOIN group_list g ON ug.group_id = g.group_id WHERE u.user_name = ? AND g.group_name = ?`, [username, groupname]);

    if (queryResults.length == 0) {
        return false;
    } else {
        return true;
    }
};

exports.authorizeRoles = (...roles) => {
    // Return a dynamic middleware since we need to modify what groups are authorized depending on the params
    return async (req, res, next) => {
        for (const role of roles) {
            // Check if user has authorized role
            const isAuthorized = await exports.checkGroup(req.user.username, role);
            if (isAuthorized) {
                return next();
            }
        }

        return res.status(401).json({
            success: false,
            error: "User not permitted",
        });
    };
};
