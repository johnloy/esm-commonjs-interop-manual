# EcmaScript-CommonJS Module Interop: The Missing Manual

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

![Let's all get along](assets/puppy-and-kitty.jpg)<br/>
<sub>Photo by [Krista Mangulsone](https://unsplash.com/photos/9gz3wfHr65U) on [Unsplash](https://unsplash.com/)<sub>

> "Human sacrifice! Dogs and cats living together! Mass hysteria!"
> — <cite><a href="https://www.imdb.com/title/tt0087332/">Bill Murray<a></cite>

---

**Contents**

- [Why care?](#intro)
- [TL;DR](#tldr)
- [Use cases](#use-cases)
  - [Browser application](#browser-application)
  - [Node application](#node-application)
    - [With a transpilation step](#node-application-transpilation)
    - [Without a transpilation step](#node-application-no-transpilation)
  - [Universal application](#universal-application)
    - [With a transpilation step](#universal-application-transpilation)
    - [Without a transpilation step](#universal-application-no-transpilation)
  - [Browser library](#browser-library)
  - [Node library](#node-library)
    - [With a transpilation step](#node-library-transpilation)
    - [Without a transpilation step](#node-library-no-transpilation)
  - [Universal library](#universal-library)
    - [With a transpilation step](#universal-library-transpilation)
    - [Without a transpilation step](#universal-library-no-transpilation)
  - [Deno application or library](#deno)
  - [ESM with Node/CJS-oriented tooling](#tooling)
    - [ESM config files](#config-files)
    - [Linting](#linting)
    - [Testing](#testing)
    - [Minification](#minification)
    - [Documentation generation](#documentation-generation)
    - [Type definitions](#type-definitions)
    - [AST parsing and serializing](#ast)
- [Crucial context](#crucial-context)
  - [Differences between ESM and CJS that cause interop problems](#differences)
  - [How code is transformed transpiling between ESM and CJS](#transpilation)
  - [The role of package.json in interop](#package-json)
  - [The role of file extensions in interop (.js, .mjs, .cjs)](#file-extensions)
  - [Gotchas, dos, and don'ts](#gotchas-dos-and-donts)
- [General notes about transpilers and bundlers](#transpilers-and-bundlers)
  - [Bundlers _are_ transpilers too](#bundlers-are-transpilers)
  - [Babel](#babel)
  - [TypeScript](#typescript)
  - [Rollup](#rollup)
  - [Webpack](#webpack)
  - [Parcel](#parcel)
  - [esbuild](#esbuild)
- :sparkles: [Appendix: Why and How to Go ESM-first](#going-esm-first)

---

<a name="intro"></a>

## Why care?

Interop between [ECMAScript modules](https://exploringjs.com/impatient-js/ch_modules.html#overview-syntax-of-ecmascript-modules), aka ES modules, aka ESM, aka [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), and [CommonJS](https://nodejs.org/api/modules.html), aka CJS, modules is a complicated and confusing matter most JavaScript developers no doubt don't want to have to think about. There are more mission-critical things on which to spend time and brain cycles, namely application logic.

Still, it's consequential in the modern JS ecosystem for two reasons:

- Developers want to make use of the full treasury of NPM packages as dependencies, regardless of their module format, and regardless of the ultimate execution runtime environment (Node, browsers, workers).

- Developers increasingly enjoy authoring JavaScript as ESM, but still need to publish for execution in older runtime environments that don't fully support it.

Put another way, developers want to pretend everything is ESM and that it "just works". Unfortunately, however, [it doesn't always](https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1).

While you certainly can use a tool that hides away and mostly handles interop concerns for you through encapsulated configuration of transpilation tools (Babel, TypeScript, bundlers, etc.), as many [front-end](https://create-react-app.dev/docs/supported-browsers-features) and [full-stack](https://nextjs.org/docs/advanced-features/customizing-babel-config) web app framework build tools do, understanding the issues and solutions regarding module interop illuminates what those tools do under the hood. Knowledge is power, should something not "just work", which is bound to happen occassionally, given the [crazy number of possible scenarios](https://sokra.github.io/interop-test/). It also informs you to be selective and intentional about your tools, choosing the most appropriate one/s for a given use case (for example, bundlers probably aren't the best tool when publishing a Node library).

This reference attempts to tie together disparate useful bits of info about module interop, which you would otherwise need to forage from many different sources, into the big picture. It focuses primarily on understanding and properly using interop-related settings in common JavaScript development tools.


<a name="tldr"></a>
## TL;DR

For JavaScript developers impatient to get beyond the mess of interop and live now in our bright ESM-first future, check out the [appendix about that](#going-esm-first).

### To master this topic, read the official docs first.

- Node.js docs: ["Modules: CommonJS modules"](https://nodejs.org/api/modules.html)
- Node.js docs: ["Modules: ECMAScript modules"](https://nodejs.org/api/esm.html)
- Node.js docs: ["Modules: Packages"](https://nodejs.org/api/packages.html)
- MDN Web Docs: ["JavaScript modules"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

### :nerd_face: Extra credit reading.

- The excellent writings of Dr. Axel Rauschmeyer
  - [Exploring ES6: Modules](https://exploringjs.com/es6/ch_modules.html)
  - [JavaScript for impatient programmers: Modules](https://exploringjs.com/impatient-js/ch_modules.html)
  - [Setting up ES6](https://leanpub.com/setting-up-es6) (focused on transpilation using Babel and WebPack; a bit out of date)
  - [Blog posts about JavaScript modules](https://www.google.com/search?q=esm+modules+commonjs+site%3A2ality.com)
- Node.js docs: ["Modules: module API"](https://nodejs.org/api/module.html)
- Mozilla Hacks: ["ES modules: A cartoon deep dive"](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)
- ECMAScript specification: [Modules](https://tc39.es/ecma262/#sec-modules) (in case it helps… ["How to Read the ECMAScript Specification"](https://timothygu.me/es-howto/))

### :bangbang: Top things to know:

- **ESM is the future**, so strive to author in ESM for any new development.

  - For ESM-first web application development, transpile and bundle with [Rollup](https://rollupjs.org/) and explore [modern web dev](#esm-first-browser) techniques like [buildless dev servers](#buildless). The [rollup-starter-code-splitting]() demo shows a minimal example of how to use Rollup to bundle and code-split an app, but a more robust approach is presented at [Modern Web](https://modern-web.dev/guides/).

  - For ESM-first browser library development, transpile and bundle with [Rollup](https://rollupjs.org/), and follow best practices in [this guide by the Skypack CDN](https://docs.skypack.dev/package-authors/package-checks) and checked by the [@skypack/package-check](https://github.com/skypackjs/package-check) tool. The Github Elements `<time>` custom element is [a good example](https://github.com/github/time-elements).

  - For ESM-first universal development...

  - For ESM-first Node package development, use one TypeScript, Babel (Babel can transpile TypeScript, btw), [ascjs](https://github.com/WebReflection/ascjs), or putout to transpile ESM source to CJS while maintaining separate modules. There's really no strict need to bundle for Node (though there are [arguments in favor](https://hashnode.com/post/is-there-any-reason-to-bundle-server-side-code-with-webpack-cja6i7ygs05a5xpwuitg0fu7r/answer/cjbpolqln004jeqwt39ibvtv6)).Also be sure to signal ESM support to package consumers by declaring one or more ESM entrypoints using Node's conditional `"exports"` package.json field.

    Alternatively, though not ESM-first, you can avoid a transpilation step by authoring in CJS and using a thin ESM wrapper.

  - For migrating a CJS Node package to ESM, convert the code, ideally  and then follow this great guide by
    - (simplest option)

  - For ESM-first Node application development, use Node gte v13, add `"type": "module"` to your root package.json, use a `.js` extension for your application modules, author ESM without a build step, and take care to heed [ESM considerations described in Node's docs](https://nodejs.org/api/esm.html).


- **The future isn't quite here yet**, hence the need for interop, so fallback to pre-ESM support.

  If you prefer to not involve a build step, you can author using CJS

  - To support common browsers without ESM support, primarily IE 11 and non-Chromium Edge, transpile ESM source to IIFE or SystemJS.

  - To support Node before v13, transpile to CJS. One reasonable exception to this, however, is authoring a dual-support package for Node. In that case, it might be simplest to author in CJS and use a lightweight ESM wrapper that re-exports a CJS entry module.

- For the most seamless interop, use a build step involving a tool like Babel, TypeScript, esbuild, Rollup, Webpack, or Parcel that transforms code and adds helpers so imports from CJS and "faux" ESM modules (CJS module with an `exports.esModule` property) work nearly identically to ESM modules.

- CJS and ESM support for default exports *and* named exports in the same module is [fundamentally incompatible](#mixed-exports).

- When authoring a package in ESM targeting Node or universal consumption, [prefer only named exports](#prefer-named-exports).

- When authoring an app in ESM for Node, and importing a CJS module, [prefer only the default import](#prefer-default-import).

---

<a name="use-cases"></a>

## Use cases

For an appreciation of why module interop is so fraught, take a look at the [interop tests](https://sokra.github.io/interop-test/) maintained by [Tobias Koppers](https://twitter.com/wsokra), creator of Webpack. The number of factors involved, and resulting set of possibilities, is vast. And, these tests don't even cover all the transpilation and bundling tools in use right now, nor particular concerns related to the nature of the thing being built (application, library, etc).

Luckily, it's possible to roughly boil down what you need to know into a few uses cases relevant to the everyday experiences of most JavaScript developers.

### What you're building and where it runs

A section of this reference is devoted to each of the following.

- <img src="assets/browser.svg" width="16" height="16" /> [Building a **browser application**, using a **transpilation** build step](#browser-application)

- <img src="assets/node-icon.svg" width="16" height="16" /> [Building a **Node application**, using a **transpilation** build step](#node-application-transpilation)

- <img src="assets/node-icon.svg" width="16" height="16" /> [Building a **Node application**, using ***no* transpilation** build step](#node-application-no-transpilation)

- <img src="assets/browser.svg" width="16" height="16" />&thinsp;<img src="assets/node-icon.svg" width="16" height="16" /> [Building a **universal application**, using a **transpilation** build step](#universal-application-transpilation)

- <img src="assets/browser.svg" width="16" height="16" />&thinsp;<img src="assets/node-icon.svg" width="16" height="16" /> [Building a **universal application**, using ***no* transpilation** build step](#universal-application-no-transpilation)

- <img src="assets/browser.svg" width="16" height="16" /> [Building a **browser library**, using a **transpilation** build step](#browser-library)

- <img src="assets/node-icon.svg" width="16" height="16" /> [Building a **Node library**, using a **transpilation** build step](#node-library-transpilation)

- <img src="assets/node-icon.svg" width="16" height="16" /> [Building a **Node library**, using ***no* transpilation** build step](#node-library-no-transpilation)

- <img src="assets/browser.svg" width="16" height="16" />&thinsp;<img src="assets/node-icon.svg" width="16" height="16" /> [Building a **universal library**, using a **transpilation** build step](#universal-library-transpilation)

- <img src="assets/browser.svg" width="16" height="16" />&thinsp;<img src="assets/node-icon.svg" width="16" height="16" /> [Building a **universal library**, using ***no* transpilation** build step](#universal-library-no-transpilation)

- [Building a **Deno application or library**](#deno)

> Two notable cases are missing from this list because, well, they don't involve interop.
>
> - Building a browser application, *without* using a transpilation step
> - Build a browser library, *without* using a transpilation step
>
> These involve use of only ESM modules, and target modern browsers with full ESM support. For more about ESM-only web development, check out the [appendix, "Why and how to go ESM-first"](#going-esm-first)
>

### Transpilation approach

The above use cases break down further into variations involving the transpilation tool used and level of backwards compatibility with target runtime environments not supporting ESM.

Common transpilation tools covered in this reference include:

- [Babel](#babel) (module-to-module transpilation)
- [TypeScript](#typescript) (module-to-module transpilation)
- [Rollup](#rollup) (bundler)
- [Webpack](#webpack) (bundler)
- [Parcel](#parcel) (bundler)
- [esbuild](#esbuild) (bundler)

Interop details related to these are covered in the section [General notes about transpilers and bundlers](#transpilers-and-bundlers).

While these are the most common/popular in the JS ecosystem, other tools are also mentioned throughout this reference as well.

### Deno



### ESM with Node/CJS-oriented tooling

Most browser and Node development tools, at least the CLI-oriented ones, run in Node. This means they are most often written and executed as CJS. Yet, JavaScript developers are increasinlgy transitioning to ESM for code they author, so such tools will at some point, in their own ways, need to support ESM. Until they fully migrate to be internally ESM themselves, or the JavaScript ecosystem shifts entirely to ESM, their use will remain an important interop use case.

- [ESM config files](#config-files)
- [Linting](#linting)
- [Testing](#testing)
- [Minification](#minification)
- [Documentation generation](#documentation-generation)
- [Type definitions](#type-definitions)
- [AST parsing and serializing](#ast) ([what is this?](https://itnext.io/ast-for-javascript-developers-3e79aeb08343))

---

<a name="browser-application"></a>

## Use case: Browser application

Chances are, as a JavaScript developer you most often encounter module interop when developing web applications using ESM syntax, while depending on a mixture of CJS/UMD and ESM packages installed using NPM.

Browsers do not understand CJS, however, so a transpilation step is necessary to normalize modules into something browsers can run. This can take one of several forms:

- A single bundle file with an IIFE (Immediately Invoked Function Expression) wrapper (example)
- Multiple bundled and code-split files with IIFE wrappers, in tandem with a module loader "runtime" (example)
- A single ESM bundle file (example)
- Multiple bundled and code-split ESM files (example)


Using the popular Webpack and Parcel bundlers, all traces of both ESM and CJS get wiped out in the final bundle output. They are replaced with faux modules, implemented using function scoping and a custom module cache in a bundler "[runtime](https://gist.github.com/johnloy/c7faabf72b358f8bc96ef9699031643e#file-bundle-js-L34-L88)". So, at the time application code executes in browsers, ESM-CJS interop is no longer a concern.


With the advent of widespread browser support of ESM (that is [*now*](https://caniuse.com/?search=javascript%20modules), btw), faux module runtimes aren't necessary for every application. Simply publish as ESM, if you don't need to support older browsers, like IE 11. Of course, for performance reasons, it's still desirable to combine many modules into fewer for production, and CJS dependency packages somehow need to get converted to ESM in the process.

The [Rollup](https://rollupjs.org/) bundler was [conceived to do precisely this](https://survivejs.com/blog/rollup-interview/).

---

<a name="node-application"></a>

## Use case: Node application


<a name="node-application-transpilation"></a>
### With a transpilation build step

<a name="node-application-no-transpilation"></a>
### *Without* using a transpilation build step

Node's native ESM support since v13 makes it possible to not need a build step at all for interop, at least not when authoring Node applications. It's not too painful to run untranspiled ESM in Node and import a mixture of ESM and CJS dependencies ([avoid the reverse](#dont-run-cjs-with-esm-deps)).

---

<a name="universal-application"></a>
## Use case: Universal application

<a name="universal-application-transpilation"></a>
### With a transpilation build step

<a name="universal-application-no-transpilation"></a>
### *Without* using a transpilation build step

---

<a name="browser-library"></a>
## Use case: Browser library

### Related tools
- [packd](https://bundle.run/) — Rollup as a service (can be [self-hosted](https://github.com/Rich-Harris/packd))

### Related reading
- [Rollup wiki page about "module" fields of package.json](https://github.com/rollup/rollup/wiki/pkg.module)
- [How to Publish Web Components to NPM](https://justinfagnani.com/2019/11/01/how-to-publish-web-components-to-npm/)

---

<a name="node-library"></a>
## Use case: Node library

### Related reading
- [Get Ready for ESM](https://blog.sindresorhus.com/get-ready-for-esm-aa53530b3f77)
- [Sindre Sorhus' steps to migrate a CJS codebase to ESM](https://github.com/sindresorhus/meta/discussions/15)
- [The complete ES module upgrade guide](https://blog.craftlab.hu/the-complete-es-module-upgrade-guide-c7ffcf7fc59d)
- [Migrating from CommonJS to ESM](https://jldec.me/migrating-from-cjs-to-esm)
- [CommonJS to ESM in Node.js](https://ar.al/2021/01/27/commonjs-to-esm-in-node.js/)
- [A NodeJS Dual Module Deep Dive](https://webreflection.medium.com/a-nodejs-dual-module-deep-dive-8f94ff56210e)
- [Hybrid NPM packages (ESM and CommonJS)](https://2ality.com/2019/10/hybrid-npm-packages.html)
- [How to Create a Hybrid NPM Module for ESM and CommonJS](https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html) (involves TypeScript)

### Related tools
- [gen-esm-wrapper](https://www.npmjs.com/package/gen-esm-wrapper)
- [ascjs](https://github.com/WebReflection/ascjs)
- [Dual Publish](https://github.com/ai/dual-publish) — Publish JS project as dual ES modules and CommonJS package to npm
- [Moduloze](https://github.com/getify/moduloze/) — Convert CommonJS (CJS) modules to UMD and ESM formats
- [cjstoesm](https://github.com/wessberg/cjstoesm) — Converts CommonJS modules into tree-shakeable ES Modules
- https://github.com/coderaiser/putout/tree/v15.1.1/packages/plugin-convert-esm-to-commonjs
- https://github.com/coderaiser/putout/tree/v15.1.1/packages/plugin-convert-commonjs-to-esm

<a name="node-library-transpilation"></a>
### With a transpilation build step

Publishing dual-support packages

<a name="node-library-no-transpilation"></a>
### *Without* using a transpilation build step

Publishing dual-support packages

[NPM packages migrate away from CJS](https://blog.sindresorhus.com/get-ready-for-esm-aa53530b3f77)

---

<a name="universal-library"></a>
## Use case: Universal library

:writing_hand:

### Related tool

- [microbundle](https://www.npmjs.com/package/microbundle)
- [tsdx](https://www.npmjs.com/package/tsdx)

<a name="universal-library-transpilation"></a>
### With a transpilation build step

:writing_hand:

<a name="universal-library-no-transpilation"></a>
### *Without* using a transpilation build step

:writing_hand:

<a name="deno"></a>
## Use case: Deno application or library

### Related reading

- [Deno Node Compatibility: CommonJS Module Loading](https://deno.land/std@0.98.0/node#commonjs-module-loading)
- [Using Node modules in Deno](https://medium.com/samsung-internet-dev/using-node-modules-in-deno-2885600ed7a9)

### Related tools

- [Denoify](https://www.npmjs.com/package/denoify) — Support Deno and release on NPM with a single codebase.

<a name="tooling"></a>
## Use case: ESM with Node/CJS-oriented tooling

:writing_hand:

<a name="config-files"></a>
## ESM config files

:writing_hand:

### Related tools

- [ESM Config](https://www.npmjs.com/package/esm-config)

<a name="linting"></a>
## Linting

:writing_hand:

### Related reading
- [airbnb eslint issue: What is the benefit of prefer-default-export](https://github.com/airbnb/javascript/issues/1365)

### Related tools
- [eslint-plugin-import rule import/no-default-export](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-default-export.md)

<a name="testing"></a>
## Testing

:writing_hand:

<a name="minification"></a>
## Minification

:writing_hand:

### Related tools
- [Closure compiler](https://github.com/google/closure-compiler/wiki/ES6-modules-and-Closure-interop)

<a name="documentation-generation"></a>
## Documentation generation

:writing_hand:

<a name="type-definitions"></a>
## Type definitions

:writing_hand:

<a name="ast"></a>
## AST parsing and serializing

:writing_hand:

---

<a name="crucial-context"></a>
## Crucial context

<a name="differences"></a>
## Differences between ESM and CJS that cause interop problems

### Related reading
- [Node Modules at War: Why CommonJS and ES Modules Can’t Get Along](https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1)


<a name="transpilation"></a>
## How code is transformed transpiling between ESM and CJS

[Faux](https://github.com/rollup/plugins/issues/635#issuecomment-723177958) ESM modules are really CJS, but transpiled to include interop code transformations and possibly also interop helper functions. They are intended for use in toolchains involving transpilers, as those tools are equipped with smarts to treat faux modules as though they were real ESM modules. Node, however, does not have such smarts, and simply treats faux modules as CJS, resulting in awkward and unexpected import/require semantics (explained in more detail under the gotchas section). This case happens most often when consuming CJS Node libraries authored in TypeScript by developers unaware of the gotcha of having both default and named exports.

<a name="package-json"></a>
## The role of package.json in interop

<a name="file-extensions"></a>
## The role of file extensions in interop (.js, .mjs, .cjs)

Related reading
- [V8 Blog: JavaScript modules](https://v8.dev/features/modules#mjs)

<a name="gotchas-dos-and-donts"></a>
## Gotchas, dos, and don'ts

### :warning: Module resolution for ESM and CJS differs significantly

JavaScript developers have grown used to three behaviors when requiring modules into CJS modules that differ when importing modules into ESM.

- [module specifiers](https://nodejs.org/api/esm.html#esm_terminology) (paths) do not need an extension, e.g. `require('./my-module'); // my-module.js`
- requiring a directory resolves to `[directory]/index.js` file
- all required modules resolve to an actual file via [this algorithm](https://nodejs.org/api/modules.html#modules_all_together)

By default, the only cases in which Node allows omitting the module file extension within ESM are when importing a [core module](https://nodejs.org/api/modules.html#modules_core_modules) or package using a [bare specifier](https://nodejs.org/api/esm.html#esm_terminology). And, the package import case is only allowed when importing the package [main](https://nodejs.org/api/packages.html#packages_main) entrypoint or one of the entrypoints defined using [package `exports`](https://nodejs.org/api/packages.html#packages_exports). Read more about this in [the Node ESM docs](https://nodejs.org/api/esm.html#esm_mandatory_file_extensions).

```javascript
import foo from './foo.cjs'; // extension required, but foo.cjs is treated as CJS
import { bar } from './bar.mjs'; // extension required
import fs from 'fs'; // no extension required, because fs is a core module
import lodash from 'lodash'; // no extension required
import { isNumeric } from 'mathjs/number'; // no extension required, because of "exports" map
```

By default, Node also does not resolve a directory import specifier to its index file.

If you want the traditional CJS extension and index file resolution behaviors, there is an [experimental cli flag `--experimental-specifier-resolution=node`](https://nodejs.org/api/esm.html#esm_customizing_esm_specifier_resolution_algorithm). Theoretically, you could also emulate the behavior using [the `resolve()` module loader hook](https://nodejs.org/api/esm.html#esm_resolve_specifier_context_defaultresolve), though that's unnecessary now with the option of the cli flag.

Because ESM support in Node strives to be ECMAScript spec compliant, rather than using the traditional CJS resolution algorithm, modules are resolved as [URLs](https://url.spec.whatwg.org/) (just like in browsers). Read more about this in [the Node ESM docs](https://nodejs.org/api/esm.html#esm_resolution_algorithm).

Adding another wrinkle to resolution difference quirks, TypeScript and transpilers don't enforce the Node ESM resolution rules.

### :warning: TypeScript doesn't support files with .mjs or .cjs extensions

This most affects the case where you want to output .mjs, because CJS is assumed by Node and transpilers when consuming .js files.

For more details, see this [open TypeScript issue](https://github.com/microsoft/TypeScript/issues/18442).

This means you cannot simply do something like…

```shell
tsc index.ts imported.ts && node index.mjs
```

The output would be…

```javascript
// tsconfig: "module": "commonjs"
var x = require("./imported"); // Node treats imported as CJS

// tsconfig: "module": "esnext"
import x from "./imported.js" // Node treats imported as CJS
```

Your build script needs to have a step following tsc compilation that renames files, like:

```shell
$ npm install renamer -g
$ tsc
$ renamer -regex --find '\.js^' --replace '.mjs' './outDir/**/*.js'
```

Unfortunately, this doesn't play nicely with the `--watch` option for `tsc`.

### Related reading

- TypeScript Github issues:
  - [Support .mjs output #18442](https://github.com/microsoft/TypeScript/issues/18442)
  - [Support ".mjs" input files #27957](https://github.com/microsoft/TypeScript/issues/27957)
- [TypeScript, ES Modules & Micheal Jackson](https://medium.com/@iamstan/typescript-es-modules-micheal-jackson-2040216be793)
- [Demonstration of .mjs type checking issue](https://github.com/frank-dspeed/example-typechecking-mjs)

### :warning: Dual-support packages are at risk of both versions being used in the same application

https://nodejs.org/api/packages.html#packages_dual_package_hazard

<a name="mixed-exports"></a>
### :warning: CJS and ESM support for default exports *and* named exports in the same module is fundamentally incompatible.

How you expect it to work (ESM importing ESM)…
```javascript
// -- imported.mjs --------------------

// When ESM imports ESM, both named exports…
export const foo = 'foo';
export const bar = 'bar';

// …and default exports happily coexist.
export default 'baz'


// -- importer.mjs --------------------
import baz, { foo, bar } from './imported.mjs';
console.log(foo, bar, baz) // => 😃 foo bar baz
```

How it really works…
```javascript
// -- imported.cjs --------------------

// When ESM imports CJS, you can't have both named exports…
exports.foo = 'foo';
exports.bar = 'bar';

// …and a default export.
module.exports = 'baz';

// -- importer.mjs --------------------
import baz, { foo, bar } from './imported.cjs';
console.log(foo, bar, baz) // => 😭 undefined undefined baz
```

### :warning: Dynamic `import()` caches based on URL, not module

...

```javascript
import()
```

### :warning: Bundlers don't understand the Node-only workaround to `require()` in ESM

### :warning: Transpiling ESM to CJS changes `import()` behavior

The `import()` syntax is converted to a `require()` wrapped in a promise. That means, if the imported module isn't also transpiled, it can't be required, because `import()` always expects its specifier to refer to an ESM module. Also, ESM and CJS use differednt import/require caches and caching behaviors.

### :warning: YMMV importing JSON

CJS could always [import JSON files](https://nodejs.org/api/modules.html#modules_require_id) with `require('file.json')`, while support for this in ESM in Node is [currently experimental](https://nodejs.org/api/esm.html#esm_json_modules), and simply non-existent in browsers (though a [feature proposal](https://github.com/tc39/proposal-json-modules) has been put forward, and [a shim](https://github.com/guybedford/es-module-shims#fetch-hook) exists).

### :warning: YMMV importing WebAssembly

Only ESM import semantics can directly support WebAssembly as a module, because WebAssembly instantiation is asynchronous (CommonJS dependency resolution is synchronous).

In CommonJS, the Node [WebAssembly global](https://nodejs.org/api/globals.html#globals_webassembly) currently needs to be used to instantiate `.wasm` ([example](https://www.dynamsoft.com/codepool/use-webassembly-node-js.html)). In ESM, by contrast, `.wasm` can be directly imported in Node ([experimental at the moment](https://nodejs.org/api/esm.html#esm_wasm_modules)), and treated more or less like any other dependency.

Browsers don't yet have this capability, though likely will soon, as well as the [ability to load `.wasm` using script tags](https://github.com/WebAssembly/esm-integration/tree/master/proposals/esm-integration), `<script type="module" src="./app.wasm">`. Until that time, if you wish to take advantage of the ESM `.wasm` import syntax, you'll need to involve a build step, as with [Rollup](https://rollupjs.org/) in conjunction with [@rollup/plugin-wasm](https://github.com/rollup/plugins/tree/master/packages/wasm) or something like [wasm-pack](https://rustwasm.github.io/docs/wasm-pack/commands/build.html#target) to [wrap WASM instantiation](https://rustwasm.github.io/wasm-bindgen/examples/without-a-bundler.html).

<a name="prefer-named-exports"></a>
### :white_check_mark:  Do prefer named exports when authoring a package in ESM targeting Node or universal consumption

As a package author, you might write this (admittedly very contrived example)…
```javascript
// -- foobarbaz.js --------------------
export const foo = 'foo';
export const bar = 'bar';
export const baz = 'baz';
export default foo + bar + baz;
```

…and transpile it to a CJS "faux" module.
```javascript
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.baz = exports.bar = exports.foo = void 0;
const foo = 'foo';
exports.foo = foo;
const bar = 'bar';
exports.bar = bar;
const baz = 'baz';
exports.baz = baz;

var _default = foo + bar + baz;

exports.default = _default;
```

Consumers of your package will expect the default export to be string `foobarbaz`, but it won't be unless they use a build step involving a transpiler that understands faux ESM modules!
```javascript
// -- consumer.mjs --------------------
import foobarbaz from 'foobarbaz'

console.log(foobarbaz) // => { bar: 'bar', baz: 'baz', default: 'foobarbaz', foo: 'foo' }
console.log(foobarbaz.default) // => foobarbaz

// Wut! 😡


// -- consumer.cjs --------------------
const foobarbaz = require('foobarbaz')

// Same deal. Ugh.
console.log(foobarbaz) // => { bar: 'bar', baz: 'baz', default: 'foobarbaz', foo: 'foo' }
console.log(foobarbaz.default) // => foobarbaz
```

Avoid confusion by avoiding a default export
```javascript
// -- foobarbaz.js --------------------
export const foo = 'foo';
export const bar = 'bar';
export const baz = 'baz';
export const foobarbaz = foo + bar + baz;


// -- consumer.js --------------------
import { foobarbaz } from 'foobarbaz';
// Using `import foobarbaz from 'foobarbaz';` with a transpiler should error

console.log(foobarbaz) // => foobarbaz
```

Of course, if you aren't planning to publish your module as a package and you use a transpilation step, using default exports doesn't run the risk of this problem. A good example of such a scenario is writing custom React components when using create-react-app ([CRA recommends using default exports](https://create-react-app.dev/docs/importing-a-component#dangerbuttonjs)). Under the hood, CRA transpiles ESM using Webpack, and handles faux modules intuitively.

#### Related reading
- [Why I've stopped exporting defaults from my JavaScript modules](https://humanwhocodes.com/blog/2019/01/stop-using-default-exports-javascript-module/)
- [Default exports = bad](https://ilikekillnerds.com/2019/08/default-exports-bad/)
- [Why we have banned default exports and you should do the same](https://blog.neufund.org/why-we-have-banned-default-exports-and-you-should-do-the-same-d51fdc2cf2ad)
- ["Avoid Export Default"](https://basarat.gitbook.io/typescript/main-1/defaultisbad) (in [*TypeScript Deep Dive*](https://basarat.gitbook.io/typescript/))
- [Rich Harris (creator of Rollup and Svelte creator) musing in a Rollup Github issue about the problems caused by default exports.](https://github.com/rollup/rollup/issues/1078#issuecomment-268286496)
- [Default exports or named exports: Why not both?](https://bignerdranch.com/blog/default-exports-or-named-exports-why-not-both/)

### Related tools
- [eslint-plugin-import rule import/no-default-export](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-default-export.md)

<a name="prefer-default-import"></a>
### :white_check_mark: Do prefer the default import when authoring an app in ESM for Node, and importing a CJS module

The default import of a CJS module into an ESM module in Node is dependably the value of `exports` from the imported module. Accessing it will never throw and the value will never be `undefined`.<br>

A highly possible scenario.
```javascript
// -- imported.cjs ----------------

// It's tempting to think of this as a collection of named exports
module.exports = {
  foo: 'foo',
  bar: 'bar',
  baz: 'baz'
}


// importer.mjs
import { foo, bar, baz } from './imported.cjs';
console.log(foo, bar, baz); // => 💥 SyntaxError: Named export 'bar' not found.
```

### :white_check_mark: Do use the `main` and `module` package.json fields when publishing a hybrid package intended for web bundling

...

### :white_check_mark: Do use package.json conditional `exports` mappings when publishing a hybrid package intended for Node

...

### :white_check_mark: Do use an .mjs extension for entry files when transpiling for Node

In scenarios 4 and 5 above there's occassionally an additional factor of whether the transpilation entry file (e.g. `entry` config setting in Webpack) has a `.js` or `.mjs` extension. The Babel and Webpack tools vary how they transpile to CJS when the entry file ends in `.mjs`, to attempt to match Node's behavior when importing CJS into ESM.

### :white_check_mark: Do use a .js extension for entry files when transpiling for browsers

...

### :white_check_mark: Do publish a migration to ESM (or dual module support) as a semver major change

...


### :no_entry_sign: Don't treat properties of `module.exports` in a CJS module imported into ESM as named exports

...

### :no_entry_sign: Don't use both default and named exports for a package when transpiling ESM to CJS

This scenario occurs when Node library authors using a `default` export transpile from ESM before publishing as CJS, using TypeScript for example, but consumers of the library are expecting vanilla CJS.

https://remarkablemark.org/blog/2020/05/05/typescript-export-commonjs-es6-modules/

### :no_entry_sign: Don't use `"type": "module"` in the project root package.json for hybrid packages

...

<a name="dont-run-cjs-with-esm-deps"></a>

### :no_entry_sign: Don't run a CJS application in Node with ESM dependencies

Because imports of ESM into CJS are always async, accessed by way of promises returned from dynamic `import()`, ESM imports can never function like top-level declarative dependencies (e.g. `require() calls at the top of a CJS module). Save yourself interop headaches, as well as the coordination necessary when introducing async into your logic, and just use CJS throughout.

---

<a name="transpilers-and-bundlers"></a>
## General notes about transpilers and bundlers

Module transpilation occurs when a transpiler or bundler traverses a codebase, starting at entrypoint files, to read it into a data structure representing the graph of dependencies.  While doing this, the code of source files is parsed into an [AST (Abstract Syntax Tree)](https://astexplorer.net/#/gist/3aa601cf2aa498ab692d6d680fc26962/0fc5dc8feff3c4628687d0080f5931848be763f3) held in memory, and from this representation transformed and combined into the final faux modules output. Both Webpack and Rollup use Acorn.

<a name="bundlers-are-transpilers"></a>
## Bundlers _are_ transpilers too

<a name="babel"></a>
## Babel

https://krasimirtsonev.com/blog/article/transpile-to-esm-with-babel

### Related tools
- [swc](https://swc.rs/) — https://blog.logrocket.com/why-you-should-use-swc/

<a name="typescript"></a>
## TypeScript

### Related reading
- [Typescript Handbook: Modules](https://www.typescriptlang.org/docs/handbook/modules.html)

<a name="rollup"></a>
## Rollup

### Related tools
- [@rollup/plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve) plugin

<a name="webpack"></a>
## Webpack

### Related reading
- [Webpack Github issues containing keywords "module" and "interop"](https://github.com/webpack/webpack/issues?q=is%3Aissue+module+interop+)
- [Webpack roadmap for ESM library target support](https://github.com/webpack/webpack/issues/2933#issuecomment-774253975)
-

<a name="parcel"></a>
## Parcel

<a name="esbuild"></a>
## esbuild

### Related tools
- [Hammer](https://github.com/sinclairzx81/hammer) — Build Tool for Browser and Node Applications

---

<a name="going-esm-first"></a>

## :sparkles: Appendix: Why and how to go ESM-first

You no longer *need* bundling, or even any kind of of build step, any more during web development, thanks to [broad browser support](https://caniuse.com/?search=javascript%20modules) of ESM, and [modern tooling](https://modern-web.dev/) to help take advantage of that. Of course, for production, bundling is still probably [optimal for performance reasons](https://v8.dev/features/modules#performance), at least until [resource bundling](https://github.com/WICG/resource-bundles) is possible (part of an emerging suite of standards to support better [website packaging](https://github.com/WICG/webpackage)).

Likewise, since full ESM support [arrived in Node v13](https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663), you've not needed a build step if you wanted to mix and match ESM and CJS in Node. [Deno](https://deno.land/manual/examples/import_export), if you're living on the edge, has offered ESM support since its inception.

These days, it's *possible* to start and end JavaScript development using only ESM throughout.

There's only one run case where module interop doesn't come into play. That is when running ESM, with no imports, or only ESM imports, in browsers or [versions of Node supporting ESM](https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663). As a developer you'll most likely encounter this case when producing or consuming a library targeting modern browsers, like [Lit](https://lit.dev/), or [web components](https://shoelace.style/).

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.40/dist/components/dialog/dialog.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.40/dist/components/button/button.js"></script>

<sl-dialog label="Dialog" class="dialog-width" style="--width: 50vw;">
  Web components are the future!
  <sl-button slot="footer" type="primary">OK</sl-button>
</sl-dialog>
```

Because not all CJS packages on NPM have been migrated to ESM, you're unlikely to encounter this case when only developing for Node (someday, though…).

<a name="esm-first-browser"></a>
## ESM-first with browsers

ESM support in browsers opens up new possibilities around improving DX through the practice of so-called "[buildless development](https://buildless.site/)", as well as some [interesting production performance benefits](https://jspm.org/import-map-cdn).

Unfortunately, in spite of great browser support, one still can't often blithely author entire web applications using ESM. If you want to use NPM packages as dependencies, there remains the pesky problem of consuming CommonJS in your ESM code. Web developers have also grown accustomed to the ergonomics of using ESM in some ways not directly supported by browsers ([yet](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/css-modules-v1-explainer.md)), like importing non-JS assets into JS modules (Webpack spoiled us) and HMR.

Several kinds of tools are emerging to overcome the interop obstacle, as well as to layer back on DX ergonomics missing from the vanilla ESM web development experience:

- [Buildless dev servers](#buildess)
- [ESM-friendly CDNs](#cdns)
- [Dependency pre-building](#pre-building)

<a name="buildless"></a>

### Buildess dev servers

Buildless dev servers in essence leave separate modules as such during development, because browsers can now load them natively and quickly without bundling. Noteworthy current choices for buildless dev servers include:

- [Web Dev Server](https://modern-web.dev/docs/dev-server/overview/)
- [Snowpack](https://www.snowpack.dev/concepts/how-snowpack-works)
- [Vite](https://vitejs.dev/)

To varying degrees these each also support on-demand code transformations making import-anything, HMR, environment variable injection, and cross-browser support possible. These transformations occur only when files are requested by the browser from the dev server, which when combined with caching makes rebuilds extremely fast after code changes.

<a name="cdns"></a>

### ESM friendly CDNs

ESM-friendly CDNs provide urls for loading ESM versions of packages directly into a browser using `<script type="module" src="...">` and `<script type="module"> import from "..." </script>`. Noteworthy current choices for these include:
- [Skypack.dev](https://www.skypack.dev/)
- [esm.run](https://www.jsdelivr.com/esm) by [jsdelivr](https://www.jsdelivr.com/)
- [esm.sh](https://esm.sh/)
- [JSPM](https://jspm.org/docs/cdn)
- [Unpkg](https://unpkg.com/)

>  ℹ️ You might notice the popular [cdnjs](https://cdnjs.com/) missing from this list. At the moment, it doesn't appear to directly support ESM, only IIFE and UMD.

Using these CDNs makes it possible to avoid installing and bundling dependency packages altogether, if that's acceptable for your application hosting needs. At a minimum these support the ability of a loaded module to subsequently load its full dependency graph. Most of them, however, also provide automatic conversion of CJS to ESM,  as well as production-oriented performance optimizations like:
- minification
- compression
- HTTP caching
- ES waterfall optimization (mod1 loads mod2 loads mod3…)

One very intriguing optimization, only supported by JSPM right now, is utilizing the capability of ES module import maps (currently only supported by Chrome) to enable [perfect individual caching of both dependent and dependency modules](https://jspm.org/import-map-cdn#module-cdns).

<a name="pre-building"></a>

### Dependency pre-building

If the quantum leap to loading all dependencies from CDNs is too drastic, but you'd still enjoy the comfort of treating any NPM package as ESM without having to care about CJS interop, use pre-built dependency packages. This option normalizes everthing to ESM while installing packages locally. It comes in two flavors: pre-built by somebody else, and pre-built by you.

The first option basically amounts to only using packages that ship an ESM variant, or using a fork of an original CJS package. Forks obviously aren't ideal because they can fall out of date. Still, you might locate a needed pre-built fork at https://github.com/esm-bundle/ or https://github.com/bundled-es-modules, or get lucky hunting for forks in the NPM registry (tip: [search using jDelivr](https://www.jsdelivr.com/?query=*%20type%3A%20esm)). This variety of pre-built ESM package will install locally into node_modules, because they are normal NPM packages.

The second option can be acheived by using [esinstall](https://www.npmjs.com/package/esinstall), a tool that powers the Snowpack buildless dev server. It uses Rollup under the hood to resolve package entrypoints under `node_modules`—these can be either CJS or ESM—and output an optimally bundled *and* split set of new modules. Exactly how they are bundled and split depends on your application's unique set of dependencies and their transitive dependencies, but suffice it to say there'll be no duplication of transitive dependencies in the output. A good explanation of the rationale for this approach can be found [in the Vite docs](https://vitejs.dev/guide/dep-pre-bundling.html#the-why). When pre-building packages this way, rather than consuming packages directly from `node_modules`, you will typically install them under your web application's source directoy into a sub-directory like `web-modules` (that's [what Snowpack does](https://www.snowpack.dev/concepts/how-snowpack-works#using-npm-dependencies)).

## ESM-first with Node
