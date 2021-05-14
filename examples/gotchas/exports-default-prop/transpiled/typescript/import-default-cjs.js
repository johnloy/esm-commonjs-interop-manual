"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const imported_cjs_js_1 = __importDefault(require("./imported/imported-cjs.js"));
console.log(util_1.default.inspect(imported_cjs_js_1.default, {
    showHidden: true,
    getters: true
}));
