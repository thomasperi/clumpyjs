{% include nav.html %}

# Introduction

Clumpy provides a way of modeling [incremental asynchronous processes](https://web.archive.org/web/20190323050823/http://www.julienlecomte.net/blog/2007/10/28/) after traditional loops, letting you focus on your program without having to manage the code that chops it up.

```javascript
// Asynchronously add up all the numbers from 1 to n.
function addup(n, callback) {
  var i,
      sum = 0,
      clumpy = new Clumpy({
        between: function () {
          console.log(Math.floor((i / n) * 100) + '% done: ' + sum);
        }
      });
      
  (clumpy
    .for_loop(
      function () { i = 1; },
      function () { return i <= n; },
      function () { i++; },
      function () {
        sum += i;
      }
    )
    .then(function () {
      callback(sum);
    })
  );
}

// Get a result and check it against the formula.
var n = 4567890;
addup(n, function (result) {
  var expected = n * (n + 1) / 2;
  console.log('expected: ' + expected);
  console.log('result: ' + result);
  console.log(
    result === expected ?
      'success!' :
      'something went wrong.'
  );
});
```