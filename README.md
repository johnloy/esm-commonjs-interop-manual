# EcmaScript-CommonJS Module Interop: The Missing Manual

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

![Let's all get along](assets/puppy-and-kitty.jpg)<br/>
<sub>Photo by [Krista Mangulsone](https://unsplash.com/photos/9gz3wfHr65U) on [Unsplash](https://unsplash.com/)<sub>

> "Human sacrifice! Dogs and cats living together! Mass hysteria!"
> — <cite><a href="https://www.imdb.com/title/tt0087332/">Bill Murray<a></cite>

---

**Contents**

- [$#@&%*!](#intro)
- [Possible interop scenarios and factors](#scenarios)
- :sparkles: [Addendum: Why and How to Go ESM-first](#addendum)

---

<a name="intro"></a>

## $#@&%*!

Interop between [EcmaScript modules](https://exploringjs.com/impatient-js/ch_modules.html#overview-syntax-of-ecmascript-modules), aka ES modules, aka ESM, aka [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), and [CommonJS](https://nodejs.org/api/modules.html), aka CJS, modules is a complicated and confusing matter most JavaScript developers no doubt don't want to have to think about. There are more mission critical things on which to spend time and brain cycles, namely application logic.

Still, it's consequential in the modern JS ecosystem for two reasons:

- Developers want to make use of the full treasury of NPM packages as dependencies, regardless of their module format, and regardless of the ultimate execution runtime environment (Node, browsers, cloud functions etc.).

- Developers increasingly enjoy authoring JavaScript as ESM, but still need to publish for execution in older runtime environments that don't fully support it.

Put another way, developers want to pretend everything is ESM and that it "just works". Unfortunately, however, it doesn't always.

While you certainly can use a tool that hides away and handles interop concerns for you through encapsulated configuration of transpilation tools, as many [front-end](https://create-react-app.dev/docs/supported-browsers-features) and [full-stack](https://nextjs.org/docs/advanced-features/customizing-babel-config) app framework build tools do, understanding the issues and solutions regarding module interop illuminates what those tools do under the hood. Knowledge is power, should something not work as expected. It also informs you to be selective and intentional about your tools, choosing the most appropriate one/s for a given use case (for example, bundlers aren't best suited when publishing a Node library).

This article attempts to tie together disparate useful bits of info about module interop, which you would otherwise need to forage from many different sources, into the big picture. It focuses primarily on understanding and properly using interop-related settings in common JavaScript  development tools.

For those JavaScript developers impatient to get beyond the mess of interop and live now in our bright ESM-first future, I've also included [an addendum about that](#addendum).

---

<a name="scenarios"></a>

## Possible interop scenarios and factors

There's only one scenario where module interop doesn't come into play. That is when authoring ESM, with no dependencies, or only ESM dependencies, and targeting execution in browsers or [versions of Node supporting ESM](https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663) ([Examples](./examples/scenarios/esm-only/README.md) :eyes:). As a developer you'll most likely encounter this scenario authoring libraries targeted at modern browsers, like [libraries](https://lit.dev/) and [web components](https://shoelace.style/). Check out the [addendum](#addendum) to this document for more on this promised land.

All remaining scenarios are some variation of authoring ESM with dependencies on CJS or a mixture of ESM and CJS. What this means is that, at least until a good majority of [NPM packages migrate away from CJS](https://blog.sindresorhus.com/get-ready-for-esm-aa53530b3f77), module interop will remain an unavoidable fact of life. Module interop scenarios include:

1. running a real ESM module in Node importing a real CJS module ([Examples](examples/scenarios/esm-importing-cjs/README.md) :eyes:);
2. running a real ESM module in Node importing a transpiled, or "faux", ESM module, which is really CJS with interop code transformations ([Examples](examples/scenarios/esm-importing-faux/README.md) :eyes:);
3. running a faux CJS module in Node, with dependencies on CJS and/or ESM modules and/or packages ([Examples](examples/scenarios/faux-in-node/README.md) :eyes:);
4. running an IIFE bundle script in a browser, with dependencies on CJS and/or ESM modules and/or packages ([Examples](examples/scenarios/iife-in-browser/README.md) :eyes:);
5. and running a real ESM bundle module in a browser with dependencies on CJS and/or ESM modules and/or packages ([Examples](examples/scenarios/esm-in-browser/README.md) :eyes:).

[Examples](./examples/scenarios/README.md) are provided in this repo to demonstrate what you can expect in each of these scenarios.

### Common factors

In scenarios 1-6 above, there's a factor affecting module interop of whether transitive imports (imports in imports, on down) in application code are ESM, transpiled or "[faux](https://github.com/rollup/plugins/issues/635#issuecomment-723177958)" ESM (CJS under the hood), or vanilla CJS (including UMD, which [fully works as CJS](https://github.com/umdjs/umd/blob/master/templates/commonjsAdapter.js)), and if they are faux ESM, which tool and tool settings were used to transpile.

In scenarios 4 and 5 above there's occassionally an additional factor of whether the transpilation entry file (e.g. `entry` config setting in Webpack) has a `.js` or `.mjs` extension. The Babel and Webpack tools vary how they transpile to CJS when the entry file ends in `.mjs`, to attempt to match Node's behavior when importing CJS into ESM.

These common factors are examined more in depth in below sections:

- [Differences between ESM and CJS that cause interop trouble](#differences)
- [How code is transformed transpiling between ESM and CJS](#transpilation)
- [Gotchas , practices to avoid, and best practices](#gotchas-and-practices)

### The non-JS module factor

In some rarer cases, there's yet one last factor of whether `.json` or `.wasm` dependencies are in the dependency graph.

CJS could always [import JSON files](https://nodejs.org/api/modules.html#modules_require_id) with `require('file.json')`, while support for this in ESM in Node is [currently experimental](https://nodejs.org/api/esm.html#esm_json_modules), and simply non-existent in browsers (though a [feature proposal](https://github.com/tc39/proposal-json-modules) has been put forward, and [a shim](https://github.com/guybedford/es-module-shims#fetch-hook) exists).

Only ESM import semantics can directly support WebAssembly as a module, because WebAssembly instantiation is asynchronous (CommonJS dependency resolution is synchronous).

In CommonJS, the Node [WebAssembly global](https://nodejs.org/api/globals.html#globals_webassembly) currently needs to be used to instantiate `.wasm` ([example](https://www.dynamsoft.com/codepool/use-webassembly-node-js.html)). In ESM, by contrast, `.wasm` can be directly imported in Node ([experimental at the moment](https://nodejs.org/api/esm.html#esm_wasm_modules)), and treated more or less like any other dependency.

Browsers don't yet have this capability, though likely will soon, as well as the [ability to load `.wasm` using script tags](https://github.com/WebAssembly/esm-integration/tree/master/proposals/esm-integration), `<script type="module" src="./app.wasm">`. Until that time, if you wish to take advantage of the ESM `.wasm` import syntax, you'll need to involve a build step, as with [Rollup](https://rollupjs.org/) in conjunction with [@rollup/plugin-wasm](https://github.com/rollup/plugins/tree/master/packages/wasm) or something like [wasm-pack](https://rustwasm.github.io/docs/wasm-pack/commands/build.html#target) to [wrap WASM instantiation](https://rustwasm.github.io/wasm-bindgen/examples/without-a-bundler.html).

---

<a name="package-json"></a>

## The role of package.json in interop

---

<a name="differences"></a>

## Differences between ESM and CJS that cause interop trouble

---

<a name="transpilation"></a>

## How code is transformed transpiling between ESM and CJS

---

<a name="gotchas-and-practices"></a>

## Gotchas , practices to avoid, and best practices

---

<a name="addendum"></a>

## :sparkles: Addendum: Why and how to go ESM-first

You no longer *need* bundling, or even any kind of of build step, any more during web development, thanks to [broad browser support](https://caniuse.com/?search=javascript%20modules) of ESM, and [modern tooling](https://modern-web.dev/) to help take advantage of that. Of course, for production, bundling is still probably [optimal for performance reasons](https://v8.dev/features/modules#performance), at least until [resource bundling](https://github.com/WICG/resource-bundles) is possible (part of an emerging suite of standards to support better [website packaging](https://github.com/WICG/webpackage)).

Likewise, since full ESM support [arrived in Node v13](https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663), you've not needed a build step if you wanted to mix and match ESM and CJS in Node. [Deno](https://deno.land/manual/examples/import_export), if you're living on the edge, has offered ESM support since its inception.

These days, it's *possible* to start and end JavaScript development using only ESM throughout.

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

## ESM-first with Node and NPM

ESM ostensibly provides less benefit for the Node ecosystem, which has gotten along well for years on CommonJS, than web. Still, ESM is the future of JavaScript modules, and Node developers will [come to rely on and publish](https://blog.sindresorhus.com/get-ready-for-esm-aa53530b3f77) ESM as a matter of convention in Node-only packages.

### Using ESM dependencies in Node

### Publishing dual-support packages

### Migrating Node libraries to ESM

https://github.com/sindresorhus/meta/discussions/15
https://github.com/getify/moduloze/
https://github.com/coderaiser/putout/tree/v15.1.1/packages/plugin-convert-esm-to-commonjs
https://github.com/coderaiser/putout/tree/v15.1.1/packages/plugin-convert-commonjs-to-esm
