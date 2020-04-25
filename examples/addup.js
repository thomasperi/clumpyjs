var Clumpy = require('../dist/clumpy.min.js');

// Add up all the numbers from 1 to n.
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
