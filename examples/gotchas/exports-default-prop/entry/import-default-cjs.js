import util from 'util';
import x from './imported/imported-cjs.js';

console.log(
  util.inspect(
    x,
    {
      showHidden: true,
      getters: true
    }
  )
);
