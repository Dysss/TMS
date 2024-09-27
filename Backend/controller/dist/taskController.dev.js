"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var pool = require("../utils/db");

exports.getAllTasks = function _callee(req, res) {
  var app_acronym, _ref, _ref2, queryResults, fields;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          app_acronym = req.body.task_app_acronym;
          _context.next = 4;
          return regeneratorRuntime.awrap(pool.execute("SELECT * FROM task WHERE task_app_acronym = ?", [app_acronym]));

        case 4:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 2);
          queryResults = _ref2[0];
          fields = _ref2[1];
          return _context.abrupt("return", res.status(200).json({
            success: true,
            data: queryResults
          }));

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0);
          return _context.abrupt("return", res.status(500).json({
            success: false
          }));

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

exports.createTask = function _callee2(req, res) {
  var conn, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createDate, _, app_rnumber, task_id;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(pool.getConnection());

        case 2:
          conn = _context2.sent;
          _context2.prev = 3;
          // Grab inputs except id (since we need to fetch rnumber)
          task_name = req.body.task_name;
          task_description = req.body.task_description || null;
          task_notes = req.body.task_notes || null;
          task_plan = req.body.task_plan || null;
          task_app_acronym = req.body.task_app_acronym;
          task_state = "open";
          task_creator = req.body.task_creator;
          task_owner = req.body.task_owner;
          task_createDate = req.body.task_createDate; // Begin transaction for task creation sequence

          _context2.next = 15;
          return regeneratorRuntime.awrap(conn.beginTransaction());

        case 15:
          _context2.t0 = _slicedToArray;
          _context2.next = 18;
          return regeneratorRuntime.awrap(conn.execute("SELECT app_rnumber FROM application WHERE app_acronym = ?", [task_app_acronym]));

        case 18:
          _context2.t1 = _context2.sent[0];
          _ = (0, _context2.t0)(_context2.t1, 1);
          app_rnumber = _[0];
          app_rnumber = app_rnumber.app_rnumber + 1;
          task_id = req.body.task_app_acronym + "_" + app_rnumber; // console.log(task_id)
          // Create task entry

          _context2.next = 25;
          return regeneratorRuntime.awrap(conn.execute("INSERT INTO task (task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createDate]));

        case 25:
          _context2.next = 27;
          return regeneratorRuntime.awrap(conn.execute("UPDATE application SET app_rnumber = ? WHERE app_acronym = ?", [app_rnumber, task_app_acronym]));

        case 27:
          _context2.next = 29;
          return regeneratorRuntime.awrap(conn.commit());

        case 29:
          return _context2.abrupt("return", res.status(200).json({
            success: true,
            data: "Task created successfully"
          }));

        case 32:
          _context2.prev = 32;
          _context2.t2 = _context2["catch"](3);
          _context2.next = 36;
          return regeneratorRuntime.awrap(conn.rollback());

        case 36:
          console.log(_context2.t2);
          return _context2.abrupt("return", res.status(500).json({
            success: false
          }));

        case 38:
          _context2.prev = 38;
          _context2.next = 41;
          return regeneratorRuntime.awrap(conn.release());

        case 41:
          return _context2.finish(38);

        case 42:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[3, 32, 38, 42]]);
};

exports.updateTaskNotes = function _callee3(req, res) {
  var conn, taskId, newNotes, _ref3, _ref4, queryResults, fields, _ref5, _ref6;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(pool.getConnection());

        case 2:
          conn = _context3.sent;
          _context3.prev = 3;
          taskId = req.body.task_id;
          newNotes = req.body.task_notes;
          conn.beginTransaction();
          _context3.next = 9;
          return regeneratorRuntime.awrap(pool.execute("UPDATE task SET task_notes = ? WHERE task_id = ?", [newNotes, taskId]));

        case 9:
          _ref3 = _context3.sent;
          _ref4 = _slicedToArray(_ref3, 2);
          queryResults = _ref4[0];
          fields = _ref4[1];
          _context3.next = 15;
          return regeneratorRuntime.awrap(pool.execute("UPDATE task SET task_owner = ? WHERE task_id = ?", [req.user.username, taskId]));

        case 15:
          _ref5 = _context3.sent;
          _ref6 = _slicedToArray(_ref5, 2);
          queryResults = _ref6[0];
          fields = _ref6[1];
          conn.commit();
          return _context3.abrupt("return", res.status(200).json({
            success: true,
            data: "Successfully updated task notes"
          }));

        case 23:
          _context3.prev = 23;
          _context3.t0 = _context3["catch"](3);
          conn.rollback();
          console.log(_context3.t0);
          return _context3.abrupt("return", res.status(500).json({
            success: false
          }));

        case 28:
          _context3.prev = 28;
          conn.release();
          return _context3.finish(28);

        case 31:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[3, 23, 28, 31]]);
};

exports.updateTaskPlan = function _callee4(req, res) {
  var taskId, newPlan, testAcronym, _ref7, _ref8, queryResults, fields;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (!(req.body.task_state !== "open")) {
            _context4.next = 2;
            break;
          }

          return _context4.abrupt("return", res.status(403).json({
            success: false,
            data: "Cannot modify plan in current state"
          }));

        case 2:
          _context4.prev = 2;
          taskId = req.body.task_id;
          newPlan = req.body.task_plan;
          testAcronym = req.body.task_app_acronym;
          _context4.next = 8;
          return regeneratorRuntime.awrap(pool.execute("UPDATE task SET task_plan = ?, task_app_acronym = ? WHERE task_id = ?", [newPlan, testAcronym, taskId]));

        case 8:
          _ref7 = _context4.sent;
          _ref8 = _slicedToArray(_ref7, 2);
          queryResults = _ref8[0];
          fields = _ref8[1];
          return _context4.abrupt("return", res.status(200).json({
            success: true,
            data: queryResults
          }));

        case 15:
          _context4.prev = 15;
          _context4.t0 = _context4["catch"](2);
          console.log(_context4.t0);
          return _context4.abrupt("return", res.status(500).json({
            success: false
          }));

        case 19:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[2, 15]]);
};

exports.updateTaskState = function _callee5(req, res) {
  var taskId, action, taskState, stateSeq, currStateIndex, newState, _ref9, _ref10, queryResults, fields, _currStateIndex, _newState, _ref11, _ref12, _queryResults, _fields;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          taskId = req.body.task_id;
          action = req.body.action;
          taskState = req.body.task_state;
          stateSeq = ["open", "todolist", "doing", "done", "closed"]; // Handle demotion

          if (!(action == "demote")) {
            _context5.next = 19;
            break;
          }

          if (!(taskState !== "doing" && taskState !== "done")) {
            _context5.next = 8;
            break;
          }

          return _context5.abrupt("return", res.status(403).json({
            success: false,
            data: "Task cannot be demoted in the current state"
          }));

        case 8:
          currStateIndex = stateSeq.indexOf(taskState);
          newState = stateSeq[currStateIndex - 1];
          _context5.next = 12;
          return regeneratorRuntime.awrap(pool.execute("UPDATE task SET task_state = ? WHERE task_state = ? AND task_id = ?", [newState, taskState, taskId]));

        case 12:
          _ref9 = _context5.sent;
          _ref10 = _slicedToArray(_ref9, 2);
          queryResults = _ref10[0];
          fields = _ref10[1];
          return _context5.abrupt("return", res.status(200).json({
            success: true,
            data: queryResults
          }));

        case 19:
          if (!(action == "promote")) {
            _context5.next = 31;
            break;
          }

          if (!(taskState == "closed")) {
            _context5.next = 22;
            break;
          }

          return _context5.abrupt("return", res.status(403).json({
            success: false,
            data: "Task cannot be promoted in the current state"
          }));

        case 22:
          _currStateIndex = stateSeq.indexOf(taskState);
          _newState = stateSeq[_currStateIndex + 1];
          _context5.next = 26;
          return regeneratorRuntime.awrap(pool.execute("UPDATE task SET task_state = ? WHERE task_state = ? AND task_id = ?", [_newState, taskState, taskId]));

        case 26:
          _ref11 = _context5.sent;
          _ref12 = _slicedToArray(_ref11, 2);
          _queryResults = _ref12[0];
          _fields = _ref12[1];
          return _context5.abrupt("return", res.status(200).json({
            success: true,
            data: _queryResults
          }));

        case 31:
          _context5.next = 37;
          break;

        case 33:
          _context5.prev = 33;
          _context5.t0 = _context5["catch"](0);
          console.log(_context5.t0);
          return _context5.abrupt("return", res.status(500).json({
            success: false
          }));

        case 37:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 33]]);
};