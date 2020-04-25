var Clumpy = require('../dist/clumpy.min.js');

// Each method of a Clumpy instance is tied to that instance
// regardless of whether the method is invoked as a method of
// the instance or a free-standing function, so we can detach
// them and they'll still behave as intended.
var clumpy = new Clumpy(),
	FOR = clumpy.for_loop,
	THEN = clumpy.then,
	SET = clumpy.set;

// Add up all the numbers from 1 to n.
function addup(n, callback) {
	var i = 0, sum = 0;
	
	SET({
		between: function () {
			console.log(Math.floor((i / n) * 100) + '% done: ' + sum);
		}
	});
	FOR(
		function () { i = 1; },
		function () { return i <= n; },
		function () { i++; },
		function () {
			sum += i;
		}
	);
	THEN(function () {
		callback(sum);
	});
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
