# Nesting Clumpy.js Loops

To nest loops, just put a chain or a loop in the statements block of another loop. They can be nested indefinitely.

```javascript
var clumpy = new Clumpy();

var i, j;
(clumpy
  .for_loop(
    function () { i = 0; },
    function () { return i < 100000; },
    function () { i++; },
    function () {
      (clumpy
        .for_loop(
          function () { j = 0; },
          function () { return j < 5; },
          function () { j++; },
          function () {
            // statements
          }
        )
        .once(function () {
          // statements
        })
      );
    }
  )
);
```

Use the same instance in the outer and inner loops. Outer loops are automatically paused while inner loops run.