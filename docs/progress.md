# Indicating Progress

When a long-running operation is something the user cares about, it’s nice to provide the user with some indication of how close the operation is to completion. To this end, Clumpy lets you specify a function to be called between clumps of execution.

To specify this function, assign it as the `between` property of an object, and pass that object to the `Clumpy` constructor.

```javascript
var clumpy = new Clumpy({
    between: function () {
        console.log('Progress: ' + i);
    }
});

var i;
clumpy.for_loop(
	function () { i = 0; },
	function () { return i < 100000; },
	function () { i += 1; },
	function () {
		// statements
	}
);
```

You can also change the `between` function during the sequence between other chained methods, using the `set` method. Here's an example with consecutive loops using different progress indicators:

```javascript
var clumpy = new Clumpy();

var i;
(clumpy
	.set({
		between: function () {
			console.log('First Loop: ' + i);
		}
	})
	.for_loop(
		function () { i = 0; },
		function () { return i < 100000; },
		function () { i += 1; },
		function () {
			// statements
		}
	)
	.then(function () {
		console.log('First Loop is Finished');
	})
	.set({
		between: function () {
			console.log('Second Loop: ' + i);
		}
	})
	.for_loop(
		function () { i = 0; },
		function () { return i < 100000; },
		function () { i += 1; },
		function () {
			// statements
		}
	)
	.then(function () {
		console.log('Second Loop is Finished');
	})
);
```

It produces something like this:

```
First Loop: 11664
First Loop: 23337
First Loop: 35012
First Loop: 46749
First Loop: 58401
First Loop: 70103
First Loop: 77520
First Loop: 89151
First Loop is Finished
Second Loop: 663
Second Loop: 11528
Second Loop: 22448
Second Loop: 33603
Second Loop: 44707
Second Loop: 55606
Second Loop: 66725
Second Loop: 77791
Second Loop: 88744
Second Loop: 99765
Second Loop is Finished
```

The `set` method behaves like `then`, enqueuing the act of setting `between` until everything before it is complete. It can also accept other options, which are described in the reference.
