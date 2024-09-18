const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
const PORT = process.env.PORT || 3000;

const userRoute = require("./routes/user.js");
const authRoute = require("./routes/auth.js");
const groupRoute = require("./routes/group.js");

dotenv.config({ path: "./config/config.env" });

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,POST,PUT",
    allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/groups", groupRoute);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

module.exports = app;
