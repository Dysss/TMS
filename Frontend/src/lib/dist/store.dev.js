"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sharedAppAcronym = void 0;

var _store = require("svelte/store");

var sharedAppAcronym = (0, _store.writable)(null);
exports.sharedAppAcronym = sharedAppAcronym;