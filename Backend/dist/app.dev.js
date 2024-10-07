"use strict";

var express = require("express");

var path = require("path");

var cookieParser = require("cookie-parser");

var helmet = require("helmet");

var cors = require("cors");

var dotenv = require("dotenv");

var app = express();
var PORT = process.env.PORT || 3000;

var route = require("./routes/route.js");

var restRoute = require("./routes/rest_route.js");

dotenv.config({
  path: "./config/config.env"
});
var corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: "GET,POST,PUT",
  allowedHeaders: "Content-Type,Authorization"
};
app.use(cors(corsOptions));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use("/api", route);
app.use("/api", restRoute);
app.use(function (req, res) {
  res.status(404).json({
    code: "U001"
  });
});
app.listen(PORT, function () {
  console.log("Listening on port ".concat(PORT));
});
module.exports = app;