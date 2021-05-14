import util from 'util';
import x from './imported/imported-faux.js';

console.log(
  util.inspect(
    x,
    {
      showHidden: true,
      getters: true
    }
  )
);
