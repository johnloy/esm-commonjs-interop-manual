import util from 'util';
import * as x from './imported/imported-cjs.js';

console.log(
  util.inspect(
    x.default,
    {
      showHidden: true,
      getters: true
    }
  )
);
