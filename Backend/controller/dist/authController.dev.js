"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var pool = require("../utils/db");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken"); // const { generateJWT } = require("../middleware/auth");


var generateJWT = function generateJWT(username, ip, ua) {
  // Attach username in payload
  var token = jwt.sign({
    username: username,
    ip: ip,
    ua: ua
  }, process.env.JWT_SECRET, {
    expiresIn: "3h"
  });
  return token;
};

exports.checkGroup = function _callee(username, groupname) {
  var _ref, _ref2, queryResults, fields;

  return regeneratorRuntime.async(function _callee$(_context) {
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
}; // Required: task_state, task_app_acronym


exports.authorizeAppRoles = function _callee2(req, res, next) {
  var _token, taskState, appAcronym, decoded, _ref3, _ref4, queryResults, fields, sqlQuery, _ref5, _ref6, _ref7, _ref8;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _token = req.cookies.jwt;
          taskState = req.body.task_state || "create";
          appAcronym = req.body.task_app_Acronym; // If no token

          if (_token) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            success: false,
            error: "User not logged in"
          }));

        case 6:
          decoded = jwt.verify(_token, process.env.JWT_SECRET); // Check if ip and ua are the same

          if (!(decoded.ip != req.ip || decoded.ua != req.headers["user-agent"])) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            success: false,
            error: "JWT token invalid."
          }));

        case 9:
          _context2.next = 11;
          return regeneratorRuntime.awrap(pool.execute("SELECT active FROM user WHERE user_name = ?", [decoded.username]));

        case 11:
          _ref3 = _context2.sent;
          _ref4 = _slicedToArray(_ref3, 2);
          queryResults = _ref4[0];
          fields = _ref4[1];
          isActive = queryResults[0].active;

          if (isActive) {
            _context2.next = 18;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            success: false,
            error: "User is disabled"
          }));

        case 18:
          if (!(taskState == "closed")) {
            _context2.next = 20;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            success: false,
            error: "Unauthorized"
          }));

        case 20:
          // Construct sql query by concatenating task state
          sqlQuery = "SELECT app_permit_" + taskState + " FROM application WHERE app_acronym = ?"; // Get permitted group for current state

          _context2.next = 23;
          return regeneratorRuntime.awrap(pool.execute(sqlQuery, [appAcronym]));

        case 23:
          _ref5 = _context2.sent;
          _ref6 = _slicedToArray(_ref5, 2);
          queryResults = _ref6[0];
          fields = _ref6[1];
          permittedGrp = queryResults[0]["app_permit_" + taskState]; // console.log("Found permitted groups: " + permittedGrp);

          _context2.next = 30;
          return regeneratorRuntime.awrap(pool.execute("SELECT * FROM user u JOIN user_group ug ON u.user_name = ug.user_name JOIN group_list g ON ug.group_id = g.group_id WHERE u.user_name = ? AND g.group_name = ?", [decoded.username, permittedGrp]));

        case 30:
          _ref7 = _context2.sent;
          _ref8 = _slicedToArray(_ref7, 2);
          queryResults = _ref8[0];
          fields = _ref8[1];

          if (!(queryResults.length == 0)) {
            _context2.next = 38;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            success: false,
            error: "Unauthorized"
          }));

        case 38:
          req.user = decoded;
          return _context2.abrupt("return", next());

        case 40:
          _context2.next = 56;
          break;

        case 42:
          _context2.prev = 42;
          _context2.t0 = _context2["catch"](0);

          if (!(_context2.t0.name == "TokenExpiredError")) {
            _context2.next = 49;
            break;
          }

          res.clearCookie("jwt");
          return _context2.abrupt("return", res.status(401).json({
            success: false,
            error: "JWT token expired. Please log in."
          }));

        case 49:
          if (!(_context2.t0.name == "JsonWebTokenError")) {
            _context2.next = 54;
            break;
          }

          res.clearCookie("jwt");
          return _context2.abrupt("return", res.status(401).json({
            success: false,
            error: "JWT token invalid. Please log in"
          }));

        case 54:
          console.log(_context2.t0);
          return _context2.abrupt("return", res.status(500).json({
            success: false
          }));

        case 56:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 42]]);
};

exports.authorizeRoles = function () {
  for (var _len = arguments.length, roles = new Array(_len), _key = 0; _key < _len; _key++) {
    roles[_key] = arguments[_key];
  }

  // Return a dynamic middleware since we need to modify what groups are authorized depending on the params
  return function _callee3(req, res, next) {
    var token, decoded, _ref9, _ref10, queryResults, fields, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, role, isAuthorized;

    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // Grab jwt from cookies
            token = req.cookies.jwt; // If no token

            if (token) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return", res.status(401).json({
              success: false,
              error: "User not logged in"
            }));

          case 3:
            _context3.prev = 3;
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            _context3.next = 19;
            break;

          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3["catch"](3);

            if (!(_context3.t0.name == "TokenExpiredError")) {
              _context3.next = 14;
              break;
            }

            res.clearCookie("jwt");
            return _context3.abrupt("return", res.status(401).json({
              success: false,
              error: "JWT token expired. Please log in."
            }));

          case 14:
            if (!(_context3.t0.name == "JsonWebTokenError")) {
              _context3.next = 18;
              break;
            }

            return _context3.abrupt("return", res.status(401).json({
              success: false,
              error: "JWT token invalid. Please log in"
            }));

          case 18:
            return _context3.abrupt("return", res.status(401).json({
              success: false,
              error: _context3.t0.message
            }));

          case 19:
            if (!(decoded.ip != req.ip || decoded.ua != req.headers["user-agent"])) {
              _context3.next = 21;
              break;
            }

            return _context3.abrupt("return", res.status(401).json({
              success: false,
              error: "JWT token invalid."
            }));

          case 21:
            _context3.next = 23;
            return regeneratorRuntime.awrap(pool.execute("SELECT active FROM user WHERE user_name = ?", [decoded.username]));

          case 23:
            _ref9 = _context3.sent;
            _ref10 = _slicedToArray(_ref9, 2);
            queryResults = _ref10[0];
            fields = _ref10[1];
            isActive = queryResults[0].active;

            if (isActive) {
              _context3.next = 30;
              break;
            }

            return _context3.abrupt("return", res.status(401).json({
              success: false,
              error: "User is disabled"
            }));

          case 30:
            // Attach username to req.user
            req.user = decoded;

            if (!(roles.length == 0)) {
              _context3.next = 33;
              break;
            }

            return _context3.abrupt("return", next());

          case 33:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context3.prev = 36;
            _iterator = roles[Symbol.iterator]();

          case 38:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context3.next = 48;
              break;
            }

            role = _step.value;
            _context3.next = 42;
            return regeneratorRuntime.awrap(exports.checkGroup(req.user.username, role));

          case 42:
            isAuthorized = _context3.sent;

            if (!isAuthorized) {
              _context3.next = 45;
              break;
            }

            return _context3.abrupt("return", next());

          case 45:
            _iteratorNormalCompletion = true;
            _context3.next = 38;
            break;

          case 48:
            _context3.next = 54;
            break;

          case 50:
            _context3.prev = 50;
            _context3.t1 = _context3["catch"](36);
            _didIteratorError = true;
            _iteratorError = _context3.t1;

          case 54:
            _context3.prev = 54;
            _context3.prev = 55;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 57:
            _context3.prev = 57;

            if (!_didIteratorError) {
              _context3.next = 60;
              break;
            }

            throw _iteratorError;

          case 60:
            return _context3.finish(57);

          case 61:
            return _context3.finish(54);

          case 62:
            return _context3.abrupt("return", res.status(401).json({
              success: false,
              error: "User not permitted"
            }));

          case 63:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[3, 7], [36, 50, 54, 62], [55,, 57, 61]]);
  };
}; // Required input: username, password


exports.login = function _callee4(req, res) {
  var _req$body, username, password, _ref11, _ref12, queryResults, fields, pwMatch;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (!req.cookies.jwt) {
            _context4.next = 2;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            success: false,
            error: "User already logged in."
          }));

        case 2:
          _context4.prev = 2;
          // Grab username and password
          _req$body = req.body, username = _req$body.username, password = _req$body.password; // Query db

          _context4.next = 6;
          return regeneratorRuntime.awrap(pool.query("SELECT password from user WHERE user_name = ?", username));

        case 6:
          _ref11 = _context4.sent;
          _ref12 = _slicedToArray(_ref11, 2);
          queryResults = _ref12[0];
          fields = _ref12[1];

          if (!(queryResults.length == 0)) {
            _context4.next = 14;
            break;
          }

          return _context4.abrupt("return", res.status(401).json({
            success: false,
            error: "Incorrect credentials."
          }));

        case 14:
          _context4.next = 16;
          return regeneratorRuntime.awrap(bcrypt.compare(password, queryResults[0].password));

        case 16:
          pwMatch = _context4.sent;

          if (pwMatch) {
            _context4.next = 19;
            break;
          }

          return _context4.abrupt("return", res.status(401).json({
            success: false,
            error: "Incorrect credentials."
          }));

        case 19:
          // Generate JWT token and store in cookies
          token = generateJWT(username, req.ip, req.headers["user-agent"]); // console.log("Generating cookie with");
          // console.log("IP: ", req.ip);
          // console.log("UA: ", req.headers["user-agent"]);

          res.cookie("jwt", token, {
            httpOnly: true
          });
          res.status(200).json({
            success: true
          });
          _context4.next = 27;
          break;

        case 24:
          _context4.prev = 24;
          _context4.t0 = _context4["catch"](2);
          res.status(500).json({
            success: false,
            error: _context4.t0
          });

        case 27:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[2, 24]]);
};

exports.logout = function _callee5(req, res) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          try {
            // Remove jwt cookie
            res.clearCookie("jwt");
            res.status(200).json({
              success: true,
              message: "Successfully logged out"
            });
          } catch (err) {
            res.status(500).json({
              success: false,
              error: err
            });
          }

        case 1:
        case "end":
          return _context5.stop();
      }
    }
  });
};

exports.verify = function _callee6(req, res) {
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          res.status(200).json({
            success: true
          });

        case 1:
        case "end":
          return _context6.stop();
      }
    }
  });
};