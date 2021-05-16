"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blerg = exports.default = void 0;

var _util = _interopRequireDefault(require("util"));

var _importedCjs = _interopRequireDefault(require("./imported/imported-cjs.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_util.default.inspect(_importedCjs.default, {
  showHidden: true,
  getters: true
}));
var _default = 'blah';
exports.default = _default;
const blerg = 'blerg';
exports.blerg = blerg;