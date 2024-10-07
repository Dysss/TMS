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
  var conn, _req$body, username, password, task_name, _req$body$task_descri, task_description, _req$body$task_notes, task_notes, _req$body$task_plan, task_plan, task_appAcronym, _ref3, _ref4, userDetails, pwMatch, _ref5, _ref6, appDetails, _ref7, _ref8, planList, planMVPList, _ref9, _ref10, permittedGrp, userPermitted, new_rnumber, task_id, currDate, currDateString, timestamp, createMsg, auditMsg, new_task_notes;

  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(req.originalUrl !== "/api/task/createTask")) {
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
          if (!(password.length > 10)) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "A001"
          }));

        case 11:
          _context2.next = 13;
          return regeneratorRuntime.awrap(pool.execute("SELECT password, active from user WHERE user_name = ?", [username]));

        case 13:
          _ref3 = _context2.sent;
          _ref4 = _slicedToArray(_ref3, 1);
          userDetails = _ref4[0];

          if (!(userDetails.length == 0)) {
            _context2.next = 18;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "A001"
          }));

        case 18:
          _context2.next = 20;
          return regeneratorRuntime.awrap(bcrypt.compare(password, userDetails[0].password));

        case 20:
          pwMatch = _context2.sent;

          if (pwMatch) {
            _context2.next = 23;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "A001"
          }));

        case 23:
          if (!(userDetails[0].active != 1)) {
            _context2.next = 25;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "A002"
          }));

        case 25:
          _context2.next = 27;
          return regeneratorRuntime.awrap(pool.execute("SELECT app_acronym, app_rnumber FROM application WHERE app_Acronym = ?", [task_appAcronym]));

        case 27:
          _ref5 = _context2.sent;
          _ref6 = _slicedToArray(_ref5, 1);
          appDetails = _ref6[0];

          if (!(appDetails.length == 0)) {
            _context2.next = 32;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P002"
          }));

        case 32:
          if (!task_plan) {
            _context2.next = 41;
            break;
          }

          _context2.next = 35;
          return regeneratorRuntime.awrap(pool.execute("SELECT plan_MVP_name FROM plan WHERE plan_MVP_name = ?", [task_plan]));

        case 35:
          _ref7 = _context2.sent;
          _ref8 = _slicedToArray(_ref7, 1);
          planList = _ref8[0];
          planMVPList = planList.map(function (plan) {
            return plan.plan_MVP_name;
          });

          if (!(planMVPList.length == 0)) {
            _context2.next = 41;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P002"
          }));

        case 41:
          _context2.next = 43;
          return regeneratorRuntime.awrap(pool.execute("SELECT app_permit_Create FROM application WHERE app_Acronym = ?", [task_appAcronym]));

        case 43:
          _ref9 = _context2.sent;
          _ref10 = _slicedToArray(_ref9, 1);
          permittedGrp = _ref10[0];

          if (!(permittedGrp.length == 0)) {
            _context2.next = 48;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "A003"
          }));

        case 48:
          _context2.next = 50;
          return regeneratorRuntime.awrap(checkGroup(username, permittedGrp[0].app_permit_Create));

        case 50:
          userPermitted = _context2.sent;

          if (userPermitted) {
            _context2.next = 53;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "A003"
          }));

        case 53:
          if (!(task_name.length > 64)) {
            _context2.next = 55;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P003"
          }));

        case 55:
          if (!(task_description && task_description.length > 255)) {
            _context2.next = 57;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P003"
          }));

        case 57:
          if (!(task_notes && task_notes.length > 65536)) {
            _context2.next = 59;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "P003"
          }));

        case 59:
          _context2.next = 61;
          return regeneratorRuntime.awrap(conn.beginTransaction());

        case 61:
          // Fetch and increment rnumber to generate task id
          new_rnumber = appDetails[0].app_rnumber + 1;
          console.log(appDetails[0].app_rnumber);
          task_id = req.body.task_appAcronym + "_" + new_rnumber.toString(); // Generate date

          currDate = new Date();
          currDateString = currDate.getDate().toString().padStart(2, "0") + "-" + (currDate.getMonth() + 1).toString().padStart(2, "0") + "-" + currDate.getFullYear().toString(); // Handle audit log msg

          timestamp = new Date().toString();
          createMsg = "".concat(username, " created task ").concat(task_id);
          auditMsg = "".concat(username, " at ").concat(timestamp);

          if (task_notes) {
            new_task_notes = [auditMsg, task_notes, createMsg];
          } else {
            new_task_notes = [auditMsg, createMsg];
          }

          new_task_notes = new_task_notes.join("␟"); // Create task entry

          _context2.next = 73;
          return regeneratorRuntime.awrap(conn.execute("INSERT INTO task \
            (task_id, task_name, task_description, task_notes, task_plan, task_app_Acronym, task_state, task_creator, task_owner, task_createDate)\
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [task_id, task_name, task_description, new_task_notes, task_plan, task_appAcronym, "open", username, username, currDateString]));

        case 73:
          _context2.next = 75;
          return regeneratorRuntime.awrap(conn.execute("UPDATE application SET app_rnumber = ? WHERE app_acronym = ?", [new_rnumber, task_appAcronym]));

        case 75:
          _context2.next = 77;
          return regeneratorRuntime.awrap(conn.commit());

        case 77:
          return _context2.abrupt("return", res.status(200).json({
            code: "S001",
            task_id: task_id
          }));

        case 80:
          _context2.prev = 80;
          _context2.t0 = _context2["catch"](5);
          _context2.next = 84;
          return regeneratorRuntime.awrap(conn.rollback());

        case 84:
          if (!(_context2.t0.code == "ER_DUP_ENTRY")) {
            _context2.next = 86;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            code: "T001"
          }));

        case 86:
          console.log(_context2.t0);
          return _context2.abrupt("return", res.status(500).json({
            code: "E001"
          }));

        case 88:
          _context2.prev = 88;
          _context2.next = 91;
          return regeneratorRuntime.awrap(conn.release());

        case 91:
          return _context2.finish(88);

        case 92:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[5, 80, 88, 92]]);
};

exports.getTaskByState = function _callee2(req, res) {
  var _req$body2, username, password, task_state, task_appAcronym, _ref11, _ref12, userDetails, pwMatch, _ref13, _ref14, appDetails, _ref15, _ref16, tasks;

  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!(req.originalUrl !== "/api/task/getTaskByState")) {
            _context3.next = 2;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "U001"
          }));

        case 2:
          _context3.prev = 2;
          _req$body2 = req.body, username = _req$body2.username, password = _req$body2.password, task_state = _req$body2.task_state, task_appAcronym = _req$body2.task_appAcronym; // Check that correct keys are sent

          if (!(username == undefined || password == undefined || task_state == undefined || task_appAcronym == undefined)) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "P001"
          }));

        case 6:
          if (!(password.length > 10)) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "A001"
          }));

        case 8:
          if (!(task_state != "open" && task_state != "todo" && task_state != "doing" && task_state != "done" && task_state != "close")) {
            _context3.next = 10;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "P002"
          }));

        case 10:
          _context3.next = 12;
          return regeneratorRuntime.awrap(pool.execute("SELECT password, active from user WHERE user_name = ?", [username]));

        case 12:
          _ref11 = _context3.sent;
          _ref12 = _slicedToArray(_ref11, 1);
          userDetails = _ref12[0];

          if (!(userDetails.length == 0)) {
            _context3.next = 17;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "A001"
          }));

        case 17:
          _context3.next = 19;
          return regeneratorRuntime.awrap(bcrypt.compare(password, userDetails[0].password));

        case 19:
          pwMatch = _context3.sent;

          if (pwMatch) {
            _context3.next = 22;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "A001"
          }));

        case 22:
          if (!(userDetails[0].active != 1)) {
            _context3.next = 24;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "A002"
          }));

        case 24:
          _context3.next = 26;
          return regeneratorRuntime.awrap(pool.execute("SELECT app_acronym FROM application WHERE app_Acronym = ?", [task_appAcronym]));

        case 26:
          _ref13 = _context3.sent;
          _ref14 = _slicedToArray(_ref13, 1);
          appDetails = _ref14[0];

          if (!(appDetails.length == 0)) {
            _context3.next = 31;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            code: "P002"
          }));

        case 31:
          _context3.next = 33;
          return regeneratorRuntime.awrap(pool.execute("SELECT t.task_id, t.task_name, t.task_description, t.task_owner, p.plan_color\
            FROM task t LEFT JOIN plan p ON t.task_plan = p.plan_MVP_name AND t.task_app_acronym = p.plan_app_acronym\
            WHERE t.task_state = ?\
            AND t.task_app_Acronym = ?", [task_state, task_appAcronym]));

        case 33:
          _ref15 = _context3.sent;
          _ref16 = _slicedToArray(_ref15, 1);
          tasks = _ref16[0];
          return _context3.abrupt("return", res.status(200).json({
            code: "S001",
            data: tasks
          }));

        case 39:
          _context3.prev = 39;
          _context3.t0 = _context3["catch"](2);
          console.log(_context3.t0);
          return _context3.abrupt("return", res.status(500).json({
            code: "E001"
          }));

        case 43:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[2, 39]]);
};

exports.promoteTask2Done = function _callee3(req, res) {
  var conn, _req$body3, username, password, task_id, _ref17, _ref18, userDetails, pwMatch, task_appAcronym, _ref19, _ref20, grpPermissions, userPermitted, _ref21, _ref22, taskDetails, _ref23, _ref24, results, timestamp, promoteMsg, auditMsg, _ref25, _ref26, task_notes, new_task_notes, _ref27, _ref28, userEmails, recipients;

  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (!(req.originalUrl !== "/api/task/promoteTask2Done")) {
            _context4.next = 2;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            code: "U001"
          }));

        case 2:
          _context4.next = 4;
          return regeneratorRuntime.awrap(pool.getConnection());

        case 4:
          conn = _context4.sent;
          _context4.prev = 5;
          // Grab variables
          _req$body3 = req.body, username = _req$body3.username, password = _req$body3.password, task_id = _req$body3.task_id; // Check that correct keys are sent

          if (!(username == undefined || password == undefined || task_id == undefined)) {
            _context4.next = 9;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            code: "P001"
          }));

        case 9:
          if (!(password.length > 10)) {
            _context4.next = 11;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            code: "A001"
          }));

        case 11:
          _context4.next = 13;
          return regeneratorRuntime.awrap(pool.execute("SELECT password, active from user WHERE user_name = ?", [username]));

        case 13:
          _ref17 = _context4.sent;
          _ref18 = _slicedToArray(_ref17, 1);
          userDetails = _ref18[0];

          if (!(userDetails.length == 0)) {
            _context4.next = 18;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            code: "A001"
          }));

        case 18:
          _context4.next = 20;
          return regeneratorRuntime.awrap(bcrypt.compare(password, userDetails[0].password));

        case 20:
          pwMatch = _context4.sent;

          if (pwMatch) {
            _context4.next = 23;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            code: "A001"
          }));

        case 23:
          if (!(userDetails[0].active != 1)) {
            _context4.next = 25;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            code: "A002"
          }));

        case 25:
          // Check if user has permissions to promote to done
          task_appAcronym = task_id.replace(/_[^_]*$/, "");
          _context4.next = 28;
          return regeneratorRuntime.awrap(pool.execute("SELECT app_permit_Doing, app_permit_Done FROM application WHERE app_Acronym = ?", [task_appAcronym]));

        case 28:
          _ref19 = _context4.sent;
          _ref20 = _slicedToArray(_ref19, 1);
          grpPermissions = _ref20[0];
          _context4.next = 33;
          return regeneratorRuntime.awrap(checkGroup(username, grpPermissions[0].app_permit_Doing));

        case 33:
          userPermitted = _context4.sent;

          if (userPermitted) {
            _context4.next = 36;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            code: "A003"
          }));

        case 36:
          _context4.next = 38;
          return regeneratorRuntime.awrap(pool.execute("SELECT task_state FROM task WHERE task_id = ?", [task_id]));

        case 38:
          _ref21 = _context4.sent;
          _ref22 = _slicedToArray(_ref21, 1);
          taskDetails = _ref22[0];

          if (!(taskDetails.length == 0)) {
            _context4.next = 43;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            code: "P002"
          }));

        case 43:
          if (!(taskDetails[0].task_state != "doing")) {
            _context4.next = 45;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            code: "P004"
          }));

        case 45:
          _context4.next = 47;
          return regeneratorRuntime.awrap(conn.beginTransaction());

        case 47:
          _context4.next = 49;
          return regeneratorRuntime.awrap(conn.execute("UPDATE task SET task_state = ? WHERE task_id = ?", ["done", task_id]));

        case 49:
          _ref23 = _context4.sent;
          _ref24 = _slicedToArray(_ref23, 1);
          results = _ref24[0];

          if (!(results.affectedRows === 0)) {
            _context4.next = 54;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            code: "T001"
          }));

        case 54:
          // Handle audit log msg
          timestamp = new Date().toString();
          promoteMsg = "Task state updated to Done";
          auditMsg = "".concat(username, " at ").concat(timestamp, " in Doing state");
          _context4.next = 59;
          return regeneratorRuntime.awrap(conn.execute("SELECT task_notes FROM task WHERE task_id = ?", [task_id]));

        case 59:
          _ref25 = _context4.sent;
          _ref26 = _slicedToArray(_ref25, 1);
          task_notes = _ref26[0];

          if (task_notes.length == 0) {
            task_notes = [];
          } else {
            task_notes = task_notes[0].task_notes.split("␟");
          }

          task_notes.unshift(promoteMsg);
          task_notes.unshift(auditMsg);
          new_task_notes = task_notes.join("␟");
          _context4.next = 68;
          return regeneratorRuntime.awrap(conn.execute("UPDATE task SET task_notes = ? WHERE task_id = ?", [new_task_notes, task_id]));

        case 68:
          _context4.next = 70;
          return regeneratorRuntime.awrap(conn.execute("SELECT email FROM user u \
            JOIN user_group ug ON u.user_name = ug.user_name\
            JOIN group_list g ON ug.group_id = g.group_id\
            WHERE g.group_name = ?", [grpPermissions[0].app_permit_Done]));

        case 70:
          _ref27 = _context4.sent;
          _ref28 = _slicedToArray(_ref27, 1);
          userEmails = _ref28[0];
          recipients = userEmails.length > 0 ? userEmails.map(function (obj) {
            return "<".concat(obj.email, ">");
          }).join(", ") : "pl@da.com";
          console.log(recipients);
          mailer.sendMail({
            from: "<tms@da.com>",
            to: "".concat(recipients),
            subject: "Task ".concat(task_id, " requires your review"),
            text: "Hi PL, ".concat(task_id, " has been promoted to the \"done\" state and requires your review.")
          }, function (info, err) {
            return err ? console.log(err) : console.log(info);
          });
          _context4.next = 78;
          return regeneratorRuntime.awrap(conn.commit());

        case 78:
          return _context4.abrupt("return", res.status(200).json({
            code: "S001"
          }));

        case 81:
          _context4.prev = 81;
          _context4.t0 = _context4["catch"](5);
          console.log(_context4.t0);
          _context4.next = 86;
          return regeneratorRuntime.awrap(conn.rollback());

        case 86:
          return _context4.abrupt("return", res.status(500).json({
            code: "E001"
          }));

        case 87:
          _context4.prev = 87;
          _context4.next = 90;
          return regeneratorRuntime.awrap(conn.release());

        case 90:
          return _context4.finish(87);

        case 91:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[5, 81, 87, 91]]);
};