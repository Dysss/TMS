const pool = require("../utils/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// const { generateJWT } = require("../middleware/auth");

const generateJWT = (username, ip, ua) => {
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

exports.checkGroup = async (username, groupname) => {
    let [queryResults, fields] = await pool.execute(`SELECT * FROM user u JOIN user_group ug ON u.user_name = ug.user_name JOIN group_list g ON ug.group_id = g.group_id WHERE u.user_name = ? AND g.group_name = ?`, [username, groupname]);

    if (queryResults.length == 0) {
        return false;
    } else {
        return true;
    }
};

// Required: task_state, task_app_acronym
exports.authorizeAppRoles = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const taskState = req.body.task_state || "create";
        const appAcronym = req.body.task_app_Acronym;

        // If no token
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "User not logged in",
            });
        }

        let decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if ip and ua are the same
        if (decoded.ip != req.ip || decoded.ua != req.headers["user-agent"]) {
            return res.status(401).json({
                success: false,
                error: "JWT token invalid.",
            });
        }

        // Check if user is active
        let [queryResults, fields] = await pool.execute(`SELECT active FROM user WHERE user_name = ?`, [decoded.username]);

        isActive = queryResults[0].active;
        if (!isActive) {
            return res.status(401).json({
                success: false,
                error: "User is disabled",
            });
        }

        // console.log("Preliminary checks cleared");

        if (taskState == "closed") {
            return res.status(401).json({
                success: false,
                error: "Unauthorized",
            });
        }

        // Construct sql query by concatenating task state
        const sqlQuery = "SELECT app_permit_" + taskState + " FROM application WHERE app_acronym = ?";

        // Get permitted group for current state
        [queryResults, fields] = await pool.execute(sqlQuery, [appAcronym]);

        permittedGrp = queryResults[0]["app_permit_" + taskState];
        // console.log("Found permitted groups: " + permittedGrp);

        [queryResults, fields] = await pool.execute(`SELECT * FROM user u JOIN user_group ug ON u.user_name = ug.user_name JOIN group_list g ON ug.group_id = g.group_id WHERE u.user_name = ? AND g.group_name = ?`, [decoded.username, permittedGrp]);

        if (queryResults.length == 0) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized",
            });
        } else {
            return next();
        }
    } catch (err) {
        if (err.name == "TokenExpiredError") {
            res.clearCookie("jwt");

            return res.status(401).json({
                success: false,
                error: "JWT token expired. Please log in.",
            });
        } else if (err.name == "JsonWebTokenError") {
            res.clearCookie("jwt");

            return res.status(401).json({
                success: false,
                error: "JWT token invalid. Please log in",
            });
        } else {
            console.log(err);
            return res.status(500).json({
                success: false,
            });
        }
    }
};

exports.authorizeRoles = (...roles) => {
    // Return a dynamic middleware since we need to modify what groups are authorized depending on the params
    return async (req, res, next) => {
        // Grab jwt from cookies
        const token = req.cookies.jwt;

        // If no token
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "User not logged in",
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
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
            return res.status(401).json({
                success: false,
                error: "JWT token invalid.",
            });
        }

        // Check if user is active
        let [queryResults, fields] = await pool.execute(`SELECT active FROM user WHERE user_name = ?`, [decoded.username]);

        isActive = queryResults[0].active;
        if (!isActive) {
            return res.status(401).json({
                success: false,
                error: "User is disabled",
            });
        }

        // Attach username to req.user
        req.user = decoded;

        if (roles.length == 0) {
            return next();
        }

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

// Required input: username, password
exports.login = async (req, res) => {
    // If jwt exist in cookies, deny login attempt
    if (req.cookies.jwt) {
        return res.status(400).json({
            success: false,
            error: "User already logged in.",
        });
    }

    try {
        // Grab username and password
        const { username, password } = req.body;

        // Query db
        let [queryResults, fields] = await pool.query("SELECT password from user WHERE user_name = ?", username);
        // If no matching username and pw is found, prevent login and show error message
        if (queryResults.length == 0) {
            return res.status(401).json({
                success: false,
                error: "Incorrect credentials.",
            });
        } else {
            // Compare hashed passwords
            let pwMatch = await bcrypt.compare(password, queryResults[0].password);
            if (!pwMatch) {
                return res.status(401).json({
                    success: false,
                    error: "Incorrect credentials.",
                });
            }
        }

        // Generate JWT token and store in cookies
        token = generateJWT(username, req.ip, req.headers["user-agent"]);
        // console.log("Generating cookie with");
        // console.log("IP: ", req.ip);
        // console.log("UA: ", req.headers["user-agent"]);
        res.cookie("jwt", token, {
            httpOnly: true,
        });
        res.status(200).json({
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err,
        });
    }
};

exports.logout = async (req, res) => {
    try {
        // Remove jwt cookie
        res.clearCookie("jwt");
        res.status(200).json({
            success: true,
            message: "Successfully logged out",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err,
        });
    }
};

exports.verify = async (req, res) => {
    res.status(200).json({
        success: true,
    });
};
