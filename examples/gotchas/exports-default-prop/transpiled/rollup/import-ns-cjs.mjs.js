'use strict';

var util = require('util');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var util__default = /*#__PURE__*/_interopDefault(util);

var importedCjs = {};

var named = importedCjs.named = 'named';
importedCjs.default = 'default';

var x = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), importedCjs, {
  'default': importedCjs,
  named: named
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
