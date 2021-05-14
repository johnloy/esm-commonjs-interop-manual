'use strict';

var util = require('util');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var util__default = /*#__PURE__*/_interopDefault(util);

var importedFaux = {};

Object.defineProperty(importedFaux, '__esModule', { value: true });
var named = importedFaux.named = 'named';
var _default = importedFaux.default = 'default';

var x = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), importedFaux, {
  named: named,
  'default': _default
}));

console.log(
  util__default['default'].inspect(
    x,
    {
      showHidden: true,
      getters: true
    }
  )
);
