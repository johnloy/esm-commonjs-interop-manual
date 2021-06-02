(self["webpackChunk"] = self["webpackChunk"] || []).push([["commons"],{

/***/ 207:
/*!**************************!*\
  !*** ./assets/common.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Ridiculous": () => (/* binding */ Ridiculous)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 378);
/* harmony import */ var react_use_lib_useWindowSize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-use/lib/useWindowSize */ 905);
/* harmony import */ var react_confetti__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-confetti */ 652);
/* harmony import */ var react_confetti__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_confetti__WEBPACK_IMPORTED_MODULE_1__);




const Ridiculous = () => {
  const { width, height } = (0,react_use_lib_useWindowSize__WEBPACK_IMPORTED_MODULE_2__.default)();
  return react__WEBPACK_IMPORTED_MODULE_0__.createElement(
    (react_confetti__WEBPACK_IMPORTED_MODULE_1___default()),
    {
      width,
      height,
    },
    null
  );
};


/***/ })

}]);