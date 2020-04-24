# Chains

Every method of a `Clumpy` instance returns a reference to the same instance. So to do several loops in sequence, just chain the method calls together like this:

```javascript
var clumpy = new Clumpy();
(clumpy
  .for_loop(
    // snip
  )
  .while_loop(
    // snip
  )
  .for_in_loop(
    // snip
  )
);
```

(I put the whole thing in parentheses so that each method call can end with a closing parenthesis without having to worry about moving the semicolon to the end if you rearrange the pieces.)

CAREFUL: If you wanted those three loops to happen in parallel instead of in series, you might think this would work:

```javascript
var clumpy = new Clumpy();
clumpy.for_loop(
  // snip
);
clumpy.while_loop(
  // snip
);
clumpy.for_in_loop(
  // snip
);
```

However, this is equivalent to the first example, with the loops executing in the order the methods were called.

To run the loops in parallel, you need to create two separate `Clumpy` instances. In the following example, the `while_loop` can start while the `for_loop` is still running.

```javascript
var c1 = new Clumpy();
var c2 = new Clumpy();
c1.for_loop(
  ...
);
c2.while_loop(
  ...
);
```

But back to the single instance. 

## `then` Method

We can chain one-off operations too, not just loops. If we want to perform some action between two loops, we can use the `then` method. It takes one function as its argument, and performs that function `then`, with no looping:

```javascript
var i = 0,
    key,
    clumpy = new Clumpy();

(clumpy
  .while_loop(
    function () { return i < 100000; },
    function () {
      // statements
    }
  )
  .then(function () {
    // statements
  })
  .for_in_loop(
    function () { return object; },
    function (k) {
      key = k;
      // statements
    }
  )
);
```

Whatever’s at the end of the chain is effectively the callback:

```javascript
function doSomething(input, callback) {
  var i = 0,
      result = [],
      clumpy = new Clumpy();
      
  (clumpy
    .while_loop(
      // use input to build result
    )
    .then(function () {
      callback(result);
    })
  );
}

// Then to use the doSomething function,
// pass it a callback that does something with the result.
countSand(some_data, function (result) {
  // do something with result
});
```
