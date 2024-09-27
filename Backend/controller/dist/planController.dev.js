"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var pool = require("../utils/db");

exports.getAllPlans = function _callee(req, res) {
  var appAcronym, _ref, _ref2, queryResults, fields;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          appAcronym = req.body.app_Acronym;
          _context.next = 4;
          return regeneratorRuntime.awrap(pool.execute("SELECT plan_MVP_name, plan_color FROM plan WHERE plan_app_Acronym = ?", [appAcronym]));

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
          return _context.abrupt("return", res.status(500));

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

exports.getPlanDetails = function _callee2(req, res) {
  var mvpName, _ref3, _ref4, queryResults, fields;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          mvpName = req.body.plan_mvp_name;
          _context2.next = 4;
          return regeneratorRuntime.awrap(pool.execute("SELECT * FROM plan WHERE plan_mvp_name = ?", [mvpName]));

        case 4:
          _ref3 = _context2.sent;
          _ref4 = _slicedToArray(_ref3, 2);
          queryResults = _ref4[0];
          fields = _ref4[1];
          return _context2.abrupt("return", res.status(200).json({
            success: true,
            data: queryResults
          }));

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);
          return _context2.abrupt("return", res.status(500));

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

exports.createPlan = function _callee3(req, res) {
  var mvpName, startDate, endDate, acronym, color, _ref5, _ref6, queryResults, fields;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          mvpName = req.body.plan_MVP_name;
          startDate = req.body.plan_startDate;
          endDate = req.body.plan_endDate;
          acronym = req.body.plan_app_acronym;
          color = req.body.plan_color;
          _context3.next = 8;
          return regeneratorRuntime.awrap(pool.execute("INSERT INTO plan (plan_mvp_name, plan_startdate, plan_enddate, plan_app_acronym, plan_color) VALUES (?, ?, ?, ?, ?)", [mvpName, startDate, endDate, acronym, color]));

        case 8:
          _ref5 = _context3.sent;
          _ref6 = _slicedToArray(_ref5, 2);
          queryResults = _ref6[0];
          fields = _ref6[1];
          return _context3.abrupt("return", res.status(200).json({
            success: true,
            data: queryResults
          }));

        case 15:
          _context3.prev = 15;
          _context3.t0 = _context3["catch"](0);
          console.log(_context3.t0);
          return _context3.abrupt("return", res.status(500).json({
            success: false
          }));

        case 19:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 15]]);
};

exports.updatePlan = function _callee4(req, res) {
  var mvpName, startDate, endDate, acronym, color, _ref7, _ref8, queryResults, fields;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          mvpName = req.body.plan_MVP_name;
          startDate = req.body.plan_startDate;
          endDate = req.body.plan_endDate;
          acronym = req.body.plan_app_acronym;
          color = req.body.plan_color;
          _context4.next = 8;
          return regeneratorRuntime.awrap(pool.execute("UPDATE plan SET plan_startdate = ?, plan_enddate = ?, plan_app_acronym = ?, plan_color = ? WHERE plan_mvp_name = ?", [startDate, endDate, acronym, color, mvpName]));

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
          _context4.t0 = _context4["catch"](0);
          console.log(_context4.t0);
          return _context4.abrupt("return", res.status(500).json({
            success: false
          }));

        case 19:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 15]]);
};