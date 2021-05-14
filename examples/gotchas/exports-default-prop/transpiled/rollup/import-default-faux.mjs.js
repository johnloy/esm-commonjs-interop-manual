'use strict';

var util = require('util');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var util__default = /*#__PURE__*/_interopDefault(util);

var importedFaux = {};

Object.defineProperty(importedFaux, '__esModule', { value: true });
importedFaux.named = 'named';
var _default = importedFaux.default = 'default';

console.log(
  util__default['default'].inspect(
    _default,
    {
      showHidden: true,
      getters: true
    }
  )
);
