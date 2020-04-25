var Clumpy = require('../dist/clumpy.min.js');

// Add up all the numbers from 1 to n.
function addup(n, callback) {
	var i,
		ms = 100,
		sum = 0,
		clumpy = new Clumpy();

	function now() {
		return new Date().getTime();
	}

	function asyncAddition(a, b, callback) {
		setTimeout(()=> {
			callback(a + b);
		}, ms);
	}

	(clumpy
		.for_loop(
			()=> i = 1,
			()=> i <= n,
			()=> i++,
			()=> {
				clumpy.wait((done)=> {
					asyncAddition(sum, i, (result)=> {
						sum = result;
						console.log('sum so far: ' + sum);
						done();
					});
				});
			}
		)
		.then(()=> {
			var expected = n * (n + 1) / 2;
			console.log('expected: ' + expected);
			console.log('sum: ' + sum);
			callback();
		})
	);
}


addup(10, function () {
	console.log('done');
});

