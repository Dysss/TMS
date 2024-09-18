const pool = require("../utils/db");
const bcrypt = require("bcryptjs");

const { generateJWT } = require("../middleware/auth");

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
        console.log("Generating cookie with");
        console.log("IP: ", req.ip);
        console.log("UA: ", req.headers["user-agent"]);
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
