# Break and Continue in Clumpy.js

Suppose we wanted to skip all the numbers that are divisible by ten, or if the number meets some special condition, exit the loop.

```javascript
var i;

// Real Loop:
for (i = 0; i < 100000; i++) {
  if (i % 10 === 0) {
    continue;
  }
  if (isSpecial(i)) {
    break;
  }
  // more statements
}

// Clumpy Equivalent:
clumpy.for_loop(
  function () { i = 0; },
  function () { return i < 100000; },
  function () { i++; },
  function () {
    if (i % 10 === 0) {
      return clumpy.continue_loop();
    }
    if (isSpecial(i)) {
      return clumpy.break_loop();
    }
    // more statements
  }
);
```

Notice the `return` before the `continue_loop` and `break_loop` calls. This is because if we don’t explicitly leave the function, JavaScript will continue to execute the rest of it. It's not a real loop or a real `continue` statement, after all.

The `return` statement doesn't have to return the result of calling the method though. This would work just as well:

```javascript
clumpy.continue_loop();
return;
```

## Labels

Use the `label` method to label the next loop. Pass the name of a label to `break_loop` or `continue_loop` to break or continue the loop with that label.

```javascript
var i, j;

// Real Loop:
myLabel:
for (i = 0; i < 100000; i++) {
  for (j = 0; j < 5; j++) {
    if (j % 10 === 0) {
      continue myLabel;
    }
    if (isSpecial(j)) {
      break myLabel;
    }
    // more statements
  }
}

// Clumpy Equivalent:
(clumpy
  .label('myLabel')
  .for_loop(
    function () { i = 0; },
    function () { return i < 100000; },
    function () { i++; },
    function () {
      clumpy.for_loop(
        function () { j = 0; },
        function () { return j < 5; },
        function () { j++; },
        function () {
          if (j % 10 === 0) {
            return clumpy.continue_loop('myLabel');
          }
          if (isSpecial(j)) {
            return clumpy.break_loop('myLabel');
          }
          // more statements
        }
      );
    }
  )
);
```