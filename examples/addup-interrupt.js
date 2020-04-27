var Clumpy = require('../dist/clumpy.min.js');

// Add up all the numbers from 1 to n.
function addup(n, callback) {
	var i,
		count = 0,
		sum = 0,
		clumpy = new Clumpy();
		
	(clumpy
		.set({
			between: ()=> {
				count++;
				console.log(
					'between: sum is ' + sum +
					', increased count to ' + count
				);
			}
		})
		.for_loop(
			() => i = 1,
			() => i <= n,
			() => i++,
			() => {
				sum += i;
				if (i % 10 === 0) {
					clumpy.interrupt();
				}
			}
		)
		.then(() => {
			var expected = n * (n + 1) / 2;
			console.log('expected: ' + expected);
			console.log('sum: ' + sum);
			callback();
		})
	);

}


addup(99, function () {
	console.log('done');
});

