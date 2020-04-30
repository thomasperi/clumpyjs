var Clumpy = require('../dist/clumpy.min.js');

// Use Clumpy to deliver on a Promise.
function addUpPromise(n) {
	return new Promise(function(resolve, reject) {
		// Create an instance for each Promise, so that multiples can run at once.
		var i,
			sum = 0,
			clumpy = new Clumpy();
			
		(clumpy
			.for_loop(
				function () { i = 1; },
				function () { return i <= n; },
				function () { i++; },
				function () {
					// Reject if i is 1300000 or greater.
					// (It's silly to check this here instead of before
					// the loop starts, but it's just an example.)
					if (i === 1300000) {
						// Reset the instance to keep it from running out of control.
						clumpy.clear();
						
						// Reject the Promise.
						reject(Error('You must have tried an unlucky number.'));
					}
					sum += i;
				}
			)
			.then(function () {
				var expected = n * (n + 1) / 2;
				if (sum === expected) {
					resolve(sum);
				} else {
					reject(Error('Expected ' + expected + ' but got ' + sum));
				}
			})
		);
	});
}

// Provide some output regarding addUpPromise calls.
function handleAddupResults(n) {
	console.log('Starting to add up numbers from 1 to ' + n + '...');
	addUpPromise(n).then(
		function (result) {
			console.log('Success adding up to ' + n + ': ' + result);
		},
		function (err) {
			console.log('Failure adding up to ' + n + ': ' + err);
		}
	);
}

// The results will arrive in the console in a different order from how they
// were started, because they're asynchronous and their execution takes 
// different amounts of time.

// Success
handleAddupResults(987654);
handleAddupResults(654321);

// Error because it exceeds 1300000
handleAddupResults(2000000);

// Error because it's a string and the expected value is mis-calculated.
handleAddupResults('123456');
