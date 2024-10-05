"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// REST api endpoints using microservice design for assignment 3
var _require = require("express"),
    application = _require.application;

var app = require("../app");

var pool = require("../utils/db");

var _require2 = require("../utils/mailer"),
    mailer = _require2.mailer;

var bcrypt = require("bcryptjs");

var checkGroup = function checkGroup(username, groupname) {
  var _ref, _ref2, queryResults, fields;

  return regeneratorRuntime.async(function checkGroup$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(pool.execute("SELECT * FROM user u JOIN user_group ug ON u.user_name = ug.user_name JOIN group_list g ON ug.group_id = g.group_id WHERE u.user_name = ? AND g.group_name = ?", [username, groupname]));

        case 2:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 2);
          queryResults = _ref2[0];
          fields = _ref2[1];

          if (!(queryResults.length == 0)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", false);

        case 10:
          return _context.abrupt("return", true);

        case 11:
        case "end":
          return _context.stop();
      }
    }
  });
};

exports.createTask = function _callee(req, res) {
  var conn, _req$body, username, password, task_name, _req$body$task_descri, task_description, _req$body$task_notes, task_notes, _req$body$task_plan, task_plan, task_appAcronym, _ref3, _ref4, userDetails, pwMatch, _ref5, _ref6, appDetails, _ref7, _ref8, planList, planMVPList, _ref9, _ref10, permittedGrp, userPermitted, new_rnumber, task_id, currDate, currDateString;

  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(req.originalUrl !== "/api/v2/create-task")) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "U001"
          }));

        case 2:
          _context2.next = 4;
          return regeneratorRuntime.awrap(pool.getConnection());

        case 4:
          conn = _context2.sent;
          _context2.prev = 5;
          // Grab variables
          _req$body = req.body, username = _req$body.username, password = _req$body.password, task_name = _req$body.task_name, _req$body$task_descri = _req$body.task_description, task_description = _req$body$task_descri === void 0 ? null : _req$body$task_descri, _req$body$task_notes = _req$body.task_notes, task_notes = _req$body$task_notes === void 0 ? null : _req$body$task_notes, _req$body$task_plan = _req$body.task_plan, task_plan = _req$body$task_plan === void 0 ? null : _req$body$task_plan, task_appAcronym = _req$body.task_appAcronym; // Check that correct keys are sent

          if (!(username == undefined || password == undefined || task_name == undefined || task_appAcronym == undefined)) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P001"
          }));

        case 9:
          _context2.next = 11;
          return regeneratorRuntime.awrap(pool.execute("SELECT password, active from user WHERE user_name = ?", [username]));

        case 11:
          _ref3 = _context2.sent;
          _ref4 = _slicedToArray(_ref3, 1);
          userDetails = _ref4[0];

          if (!(userDetails.length == 0)) {
            _context2.next = 16;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            code: "A001"
          }));

        case 16:
          _context2.next = 18;
          return regeneratorRuntime.awrap(bcrypt.compare(password, userDetails[0].password));

        case 18:
          pwMatch = _context2.sent;

          if (pwMatch) {
            _context2.next = 21;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            code: "A001"
          }));

        case 21:
          if (!(userDetails[0].active != 1)) {
            _context2.next = 23;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            code: "A002"
          }));

        case 23:
          _context2.next = 25;
          return regeneratorRuntime.awrap(pool.execute("SELECT app_acronym, app_rnumber FROM application WHERE app_Acronym = ?", [task_appAcronym]));

        case 25:
          _ref5 = _context2.sent;
          _ref6 = _slicedToArray(_ref5, 1);
          appDetails = _ref6[0];

          if (!(appDetails.length == 0)) {
            _context2.next = 30;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P002"
          }));

        case 30:
          if (!task_plan) {
            _context2.next = 39;
            break;
          }

          _context2.next = 33;
          return regeneratorRuntime.awrap(pool.execute("SELECT plan_MVP_name FROM plan WHERE plan_MVP_name = ?", [task_plan]));

        case 33:
          _ref7 = _context2.sent;
          _ref8 = _slicedToArray(_ref7, 1);
          planList = _ref8[0];
          planMVPList = planList.map(function (plan) {
            return plan.plan_MVP_name;
          });

          if (!(planMVPList.length == 0)) {
            _context2.next = 39;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P002"
          }));

        case 39:
          _context2.next = 41;
          return regeneratorRuntime.awrap(pool.execute("SELECT app_permit_Create FROM application WHERE app_Acronym = ?", [task_appAcronym]));

        case 41:
          _ref9 = _context2.sent;
          _ref10 = _slicedToArray(_ref9, 1);
          permittedGrp = _ref10[0];

          if (!(permittedGrp.length == 0)) {
            _context2.next = 46;
            break;
          }

          return _context2.abrupt("return", res.status(403).json({
            code: "A003"
          }));

        case 46:
          _context2.next = 48;
          return regeneratorRuntime.awrap(checkGroup(username, permittedGrp[0].app_permit_Create));

        case 48:
          userPermitted = _context2.sent;

          if (userPermitted) {
            _context2.next = 51;
            break;
          }

          return _context2.abrupt("return", res.status(403).json({
            code: "A003"
          }));

        case 51:
          if (!(task_name.length > 64)) {
            _context2.next = 53;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P003"
          }));

        case 53:
          if (!(task_description.length > 255)) {
            _context2.next = 55;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P003"
          }));

        case 55:
          if (!(task_notes.length > 65535)) {
            _context2.next = 57;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P003"
          }));

        case 57:
          _context2.next = 59;
          return regeneratorRuntime.awrap(conn.beginTransaction());

        case 59:
          // Fetch and increment rnumber to generate task id
          // let [app_rnumber] = (
          //     await conn.execute(
          //         "SELECT app_rnumber FROM application WHERE app_acronym = ?",
          //         [task_appAcronym]
          //     )
          // )[0];
          // app_rnumber = app_rnumber.app_rnumber + 1;
          new_rnumber = appDetails.app_rnumber + 1;
          task_id = req.body.task_appAcronym + "_" + new_rnumber.toString(); // Generate date

          currDate = new Date();
          currDateString = currDate.getDate().toString().padStart(2, "0") + "-" + (currDate.getMonth() + 1).toString().padStart(2, "0") + "-" + currDate.getFullYear().toString(); // Create task entry

          _context2.next = 65;
          return regeneratorRuntime.awrap(conn.execute("INSERT INTO task \
            (task_id, task_name, task_description, task_notes, task_plan, task_app_Acronym, task_state, task_creator, task_owner, task_createDate)\
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [task_id, task_name, task_description, task_notes, task_plan, task_appAcronym, "open", username, username, currDateString]));

        case 65:
          _context2.next = 67;
          return regeneratorRuntime.awrap(conn.execute("UPDATE application SET app_rnumber = ? WHERE app_acronym = ?", [new_rnumber, task_appAcronym]));

        case 67:
          _context2.next = 69;
          return regeneratorRuntime.awrap(conn.commit());

        case 69:
          return _context2.abrupt("return", res.status(200).json({
            code: "S001"
          }));

        case 72:
          _context2.prev = 72;
          _context2.t0 = _context2["catch"](5);
          _context2.next = 76;
          return regeneratorRuntime.awrap(conn.rollback());

        case 76:
          console.log(_context2.t0);
          return _context2.abrupt("return", res.status(500).json({
            code: "E001"
          }));

        case 78:
          _context2.prev = 78;
          _context2.next = 81;
          return regeneratorRuntime.awrap(conn.release());

        case 81:
          return _context2.finish(78);

        case 82:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[5, 72, 78, 82]]);
};

exports.getTaskByState = function _callee2(req, res) {
  var _req$body2, username, password, task_state, task_appAcronym, _ref11, _ref12, userDetails, pwMatch, _ref13, _ref14, appList, appAcronymList;

  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!(req.originalUrl !== "/api/v2/create-task")) {
            _context3.next = 2;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "U001"
          }));

        case 2:
          _context3.prev = 2;
          _req$body2 = req.body, username = _req$body2.username, password = _req$body2.password, task_state = _req$body2.task_state, task_appAcronym = _req$body2.task_appAcronym;

          if (!(username == undefined || password == undefined || task_state == undefined || task_appAcronym == undefined)) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "P001"
          }));

        case 6:
          _context3.next = 8;
          return regeneratorRuntime.awrap(pool.execute("SELECT password, active from user WHERE user_name = ?", [username]));

        case 8:
          _ref11 = _context3.sent;
          _ref12 = _slicedToArray(_ref11, 1);
          userDetails = _ref12[0];

          if (!(userDetails.length == 0)) {
            _context3.next = 13;
            break;
          }

          return _context3.abrupt("return", res.status(401).json({
            code: "A001"
          }));

        case 13:
          _context3.next = 15;
          return regeneratorRuntime.awrap(bcrypt.compare(password, userDetails[0].password));

        case 15:
          pwMatch = _context3.sent;

          if (pwMatch) {
            _context3.next = 18;
            break;
          }

          return _context3.abrupt("return", res.status(401).json({
            code: "A001"
          }));

        case 18:
          if (!(userDetails[0].active != 1)) {
            _context3.next = 20;
            break;
          }

          return _context3.abrupt("return", res.status(401).json({
            code: "A002"
          }));

        case 20:
          _context3.next = 22;
          return regeneratorRuntime.awrap(pool.execute("SELECT app_acronym, app_rnumber FROM application"));

        case 22:
          _ref13 = _context3.sent;
          _ref14 = _slicedToArray(_ref13, 1);
          appList = _ref14[0];
          appAcronymList = appList.map(function (app) {
            return app.app_acronym;
          });

          if (appAcronymList.includes(task_appAcronym)) {
            _context3.next = 28;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "P002"
          }));

        case 28:
          _context3.next = 34;
          break;

        case 30:
          _context3.prev = 30;
          _context3.t0 = _context3["catch"](2);
          console.log(_context3.t0);
          return _context3.abrupt("return", res.status(500).json({
            code: "E001"
          }));

        case 34:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[2, 30]]);
};