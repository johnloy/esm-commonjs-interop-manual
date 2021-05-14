'use strict';

var util = require('util');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var util__default = /*#__PURE__*/_interopDefault(util);

var importedCjs = {};

importedCjs.named = 'named';
importedCjs.default = 'default';

console.log(
  util__default['default'].inspect(
    importedCjs,
    {
      showHidden: true,
      getters: true
    }
  )
);
