# Intro

In Clumpy, you can model an asynchronous loop like this:

```javascript
var i, clumpy = new Clumpy();
clumpy.for_loop(
  function () { i = 0; },
  function () { return i < 100000; },
  function () { i++; },
  function () {
    // statements
  }
);
```

It looks a little strange, being so heavy on the functions, but you can see the resemblance it bears to a real `for` loop. A notable difference, though, is that the second function returns the result of the condition, where there is no return statement in a real for loop.

If you use ES6 single-expression arrow functions, you can make it look a little more familiar:

```javascript
var i, clumpy = new Clumpy();
clumpy.for_loop(()=> i = 0, ()=> i < 100000, ()=> i++, ()=> {
  // statements
});
```

The rest of this documentation will use full function expressions, for backward compatibility.


## Reinventing the “While”

The methods that model `while` and `do...while` are similar to `for_loop()`:

```javascript
var i = 0;
clumpy.while_loop(
  function () { return i < 100000; },
  function () {
    // statements
  }
);
```

```javascript
var i = 0;
clumpy.do_while_loop(
  function () {
    // statements
  },
  function () { return i < 100000; }
);
```

`for...in` loops are almost as straightforward:

```javascript
var key, object = { ... };

// Real Loop
for (key in object) {
  // statements
}

// Loose Equivalent:
clumpy.for_in_loop(
  function () { return object; },
  function (key) {
    // statements
  }
);

// Strict Equivalent:
clumpy.for_in_loop(
  function () { return object; },
  function (k) {
    key = k;
    // statements
  }
);
```

The difference between the “loose” and “strict” equivalents is that the `key` parameter to the function is not the same `key` variable that’s declared outside the function. The strict example makes the value persist in the outer `key`.
