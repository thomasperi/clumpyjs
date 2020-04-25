var Clumpy = require('../dist/clumpy.min.js');

// Add up all the numbers from 1 to n.
function addup(n, callback) {
	var i,
		sum = 0,
		clumpy = new Clumpy();

	function now() {
		return new Date().getTime();
	}

	(clumpy
		.for_loop(
			()=> i = 1,
			()=> i <= n,
			()=> i++,
			()=> {
				var start = now();
				clumpy.sleep(500).then(()=> {
					sum += i;
					console.log((now() - start) + 'ms elapsed');
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
