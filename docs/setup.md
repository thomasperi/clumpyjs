{% include nav.html %}

# Setup

## 1. Get it one of these ways:
* `npm i clumpyjs`
* `git clone git@github.com:thomasperi/clumpyjs.git`
* Download the latest release from [github](https://github.com/thomasperi/clumpyjs/releases).

## 2. Use it in your project:
The production file is `dist/clumpy.min.js`. You can use the same file with Node, AMD (RequireJS), or just a script tag on a web page.

If you're using Node or AMD, the rest of this documentation is written with the assumption that you've imported Clumpy.js as `Clumpy`:

*Node*
```javascript
var Clumpy = require("clumpyjs");
...
```

*AMD*
```javascript
define(['clumpyjs'] , function (Clumpy) {
  ...
});
```

*Web*
If you're loading the file in a web browser without a module loader, the Clumpy.js library will be assigned to the global variable `Clumpy` by default. If you want to use it globally under a different name, you can use the `noConflict` method to reassign it to a new variable. This also restores the original value of `Clumpy` if that variable was already in use.

```html
<script src="path-to-clumpyjs/dist/clumpy.min.js"></script>
<script>
  // Redefine the Clumpy.js library as `ClumpyJS` and restore the original `Clumpy`.
  var ClumpyJS = Clumpy.noConflict();
</script>
```

If you want to use it as `Clumpy` but don't want it in the global namespace, you can pass it into an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE).

```html
<script src="path-to-clumpyjs/dist/clumpy.min.js"></script>
<script>
  (function (Clumpy) {
    // Clumpy.js is defined as `Clumpy` inside this function but nowhere else.
  }( Clumpy.noConflict() ));
</script>
```

## 3. Create an instance
To use Clumpy.js, you need to first create an instance of the `Clumpy` constructor. All the examples in this guide use the variable `clumpy` (lower-case "c"), but you can use whatever you like.

```javascript
var clumpy = new Clumpy();
```
