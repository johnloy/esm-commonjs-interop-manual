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

Interop between [EcmaScript modules](https://exploringjs.com/impatient-js/ch_modules.html#overview-syntax-of-ecmascript-modules), aka ESM, aka [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), and [CommonJS](https://nodejs.org/api/modules.html), aka CJS, modules is a confusing matter most JavaScript developers no doubt don't want to have to think about. There are more mission critical things on which to spend time and brain cycles, namely application logic.

Still, it's consequential in the modern JS ecosystem for two reasons.

- Developers want to make use of the full treasury of NPM packages as dependencies, regardless of their module format, and regardless of the runtime environment their dependent code targets (Node, browsers, cloud functions etc.).

- Developers increasingly enjoy authoring JavaScript as ESM, but still need to publish for execution in older runtime environments that don't fully support it.

While you certainly can use a tool that hides away and handles interop concerns for you through encapsulated configuration of dependency tools, as many [front-end](https://create-react-app.dev/docs/supported-browsers-features) and [full-stack](https://nextjs.org/docs/advanced-features/customizing-babel-config) app framework build tools do, understanding the issues and solutions regarding module interop illuminates what those tools do under the hood. Knowledge is power, should something not work as expected. It also informs you so you can be more selective and intentional about your tools, choosing the most appropriate one for a given use case (for example, bundlers aren't best suited to enable interop when publishing a Node library).

This article attempts to tie together disparate useful bits of info about module interop, which you would otherwise need to forage from many different sources, into the big picture. It focuses primarily on understanding and properly using interop-related settings in common JavaScript  development tools.

For those JavaScript developers impatient to get beyond the mess of interop and live now in our bright ESM-first future, I've also included [an addendum about that](#addendum).

---

<a name="addendum">

## Addendum: Why and How to Go ESM First
