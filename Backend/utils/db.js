const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config({ path: "../config/config.env" });

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "password",
    database: "assignment1",
});

module.exports = pool;
