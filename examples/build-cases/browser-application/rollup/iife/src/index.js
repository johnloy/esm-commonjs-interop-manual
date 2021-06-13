import React from 'react';
import ReactDom from 'react-dom';
import { Ridiculous } from './assets/common';

ReactDom.render(
  React.createElement(Ridiculous, {}, null),
  document.getElementById('ridiculous')
);
