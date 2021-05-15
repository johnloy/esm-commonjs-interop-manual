# EcmaScript-CommonJS Module Interop: The Missing Manual

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

![Let's all get along](assets/puppy-and-kitty.jpg)<br/>
<sub>Photo by [Krista Mangulsone](https://unsplash.com/photos/9gz3wfHr65U) on [Unsplash](https://unsplash.com/)<sub>

---

**Contents**

- [$#@&%*!](#intro)
- [Addendum: Why and How to Go ESM-first](#addendum)

---

<a name="intro">

## $#@&%*!

Interop between [EcmaScript modules](https://exploringjs.com/impatient-js/ch_modules.html#overview-syntax-of-ecmascript-modules), aka ES modules, aka ESM, aka [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), and [CommonJS](https://nodejs.org/api/modules.html), aka CJS, modules is a complicated and confusing matter most JavaScript developers no doubt don't want to have to think about. There are more mission critical things on which to spend time and brain cycles, namely application logic.

Still, it's consequential in the modern JS ecosystem for two reasons:

- Developers want to make use of the full treasury of NPM packages as dependencies, regardless of their module format, and regardless of the runtime environment their dependent code targets (Node, browsers, cloud functions etc.).

- Developers increasingly enjoy authoring JavaScript as ESM, but still need to publish for execution in older runtime environments that don't fully support it.

Put another way, developers want to pretend everything is ESM and that it "just works". Unfortunately, however, it doesn't always.

 While you certainly can use a tool that hides away and handles interop concerns for you through encapsulated configuration of dependency tools, as many [front-end](https://create-react-app.dev/docs/supported-browsers-features) and [full-stack](https://nextjs.org/docs/advanced-features/customizing-babel-config) app framework build tools do, understanding the issues and solutions regarding module interop illuminates what those tools do under the hood. Knowledge is power, should something not work as expected. It also informs you to be selective and intentional about your tools, choosing the most appropriate one for a given use case (for example, bundlers aren't best suited to enable interop when publishing a Node library).

This article attempts to tie together disparate useful bits of info about module interop, which you would otherwise need to forage from many different sources, into the big picture. It focuses primarily on understanding and properly using interop-related settings in common JavaScript  development tools.

For those JavaScript developers impatient to get beyond the mess of interop and live now in our bright ESM-first future, I've also included [an addendum about that](#addendum).

---

## Possible interop scenarios and factors

There's only one scenario where module interop doesn't come into play. That is when authoring ESM, with no dependencies, or only ESM dependencies, and targeting execution in browsers or versions of Node supporting ESM ([fully enabled in v13](https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663)).

All remaining scenarios are some variation of authoring ESM with dependencies on CJS or a mixture of ESM and CJS. What this means is that, at least until a good majority of NPM packages move away from CJS, module interop will remain an unavoidable fact of life. Module interop scenarios include:

1. running a real ESM module in Node importing a real CJS module;
2. running a real ESM module in Node importing a transpiled, or "faux", ESM module (really CJS, with interop code transformations);
3. running a faux CJS module in Node, with dependencies on CJS and/or ESM modules and/or packages;
4. running an IIFE bundle script in a browser, with dependencies on CJS and/or ESM modules and/or packages;
5. and running a real ESM bundle module in a browser with dependencies on CJS and/or ESM modules and/or packages.

Examples are provided in this repo to demonstrate what you can expect in each of these scenarios.

### Common factors

In every case, there's a factor affecting module interop of whether transitive dependencies (dependencies of dependencies, on down) are ESM, transpiled or "faux" ESM (CJS under the hood), or vanilla CJS (including UMD, which fully works as CJS), and if they are faux ESM, which tool and tool settings were used to transpile.

In the cases of 4, and 5, there's occassionally an additional factor of whether the transpilation entry file (e.g. `entry` config setting in Webpack) has a `.js` or `.mjs` extension. The Babel and Webpack tools vary how they transpile to CJS when the entry file ends in `.mjs`, to attempt to match Node's behavior when importing CJS into ESM.

These common factors are examined more in depth in below sections:
- Differences between ESM and CommonJS that cause interop trouble
- How code is transformed compiling between ESM and CommonJS
- Gotchas , practices to avoid, and best practices

### The non-JS module factor

In some rarer cases, there's yet one last factor of whether `.json` or `.wasm` dependencies are in the dependency graph.

CJS could always import JSON files, while support for this in ESM in Node is currently experimental, and simply non-existent in browsers (though a feature proposal has been drafted, and a shim exists).

Only ESM import semantics can directly support WebAssembly as a module, because WebAssembly instantiation is asynchronous (CommonJS is synchronous).

In CommonJS, the Node [WebAssembly global](https://nodejs.org/api/globals.html#globals_webassembly) currently needs to be used to instantiate `.wasm` ([example](https://www.dynamsoft.com/codepool/use-webassembly-node-js.html)). In ESM, by contrast, `.wasm` can be directly imported in Node ([experimental at the moment](https://nodejs.org/api/esm.html#esm_wasm_modules)), and treated more or less like any other dependency.

Browsers don't yet have this capability, though likely will soon, as well as the [ability to load `.wasm` using script tags](https://github.com/WebAssembly/esm-integration/tree/master/proposals/esm-integration), `<script type="module" src="./app.wasm">`. Until that time, if you wish to take advantage of the ESM `.wasm` import syntax, you'll need to involve a build step, as with Rollup in conjunction with [@rollup/plugin-wasm](https://github.com/rollup/plugins/tree/master/packages/wasm) or something like [wasm-pack](https://rustwasm.github.io/docs/wasm-pack/commands/build.html#target) to [wrap WASM instantiation](https://rustwasm.github.io/wasm-bindgen/examples/without-a-bundler.html).

---

<a name="addendum">

## Addendum: Why and How to Go ESM First
