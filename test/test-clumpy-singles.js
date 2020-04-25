var chai = require('chai');  
var assert = chai.assert;    // Using Assert style
var expect = chai.expect;    // Using Expect style
var should = chai.should();  // Using Should style

require('./test-clumpy.js')((Clumpy) => {

	var i = 0,
		multi = [];
	
	describe('Test Clumpy Single-Actions', () => {
		
		it('sleep', multi[i++] = (done) => {
			var i,
				n = 15,
				ms = 100,
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
						clumpy.sleep(ms).then(()=> {
							sum += i;
							expect(now() - start).to.not.be.below(ms);
						});
					}
				)
				.then(()=> {
					expect(sum).to.equal(n * (n + 1) / 2);
					done();
				})
			);
		});
		
		it('wait', multi[i++] = (done) => {
			var i,
				n = 10,
				ms = 100,
				sum = 0,
				clumpy = new Clumpy();
			
			function asyncAddition(a, b, callback) {
				setTimeout(()=> {
					callback(a + b);
				}, 0);
			}
			
			(clumpy
				.for_loop(
					()=> i = 1,
					()=> i <= n,
					()=> i++,
					()=> {
						clumpy.wait((wait_done)=> {
							asyncAddition(sum, i, (result)=> {
								sum = result;
								wait_done();
							});
						});
					}
				)
				.then(()=> {
					expect(sum).to.equal(n * (n + 1) / 2);
					done();
				})
			);
		});

		
// 		it('template', multi[i++] = (done) => {
// 		
// 		});

// 		it('multiple simultaneous', (realDone) => {
// 			var started = 0,
// 				finished = 0;
// 			for (var i = 0; i < multi.length; i++) {
// 				started++;
// 				multi[i](fakeDone);
// 			}
// 			function fakeDone() {
// 				finished++;
// 				if (finished === started) {
// 					realDone();
// 				}
// 			}
// 		});
	});
});
