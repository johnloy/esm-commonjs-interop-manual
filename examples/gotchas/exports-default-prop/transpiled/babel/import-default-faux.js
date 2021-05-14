"use strict";

var _util = _interopRequireDefault(require("util"));

var _importedFaux = _interopRequireDefault(require("./imported/imported-faux.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_util.default.inspect(_importedFaux.default, {
  showHidden: true,
  getters: true
}));