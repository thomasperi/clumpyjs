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

		it('control for between', multi[i++] = (done) => {
			var i,
				b = [],
				count = 0,
				bound = 10, // Low enough that there should only be one clump, and therefore no between calls
				clumpy = new Clumpy({
					between: ()=> {
						count++;
					}
				});
				
			(clumpy
				.for_loop(
					() => i = 0,
					() => i < bound,
					() => i++,
					() => {
						b.push(i);
					}
				)
				.then(() => {
					// Ensure that the first clump gets deferred too,
					// not done synchronously.
					expect(b[0]).to.equal('hello'); 
					expect(b[1]).to.equal(0);
					
					expect(count).to.equal(0);
					done();
				})
			);
			
			// Synchronously push hello.
			b.push('hello');
		});

		it('constructor between with interrupt', multi[i++] = (done) => {
			var i,
				b = [],
				count = 0,
				bound = 99, // A number greater than exactly 9 non-zero multiples of ten.
				clumpy = new Clumpy({
					between: ()=> {
						count++;
					}
				});
				
			(clumpy
				.for_loop(
					() => i = 1,
					() => i < bound,
					() => i++,
					() => {
						b.push(i);
						if (i % 10 === 0) {
							clumpy.interrupt();
						}
					}
				)
				.then(() => {
					// Ensure that the first clump gets deferred too,
					// not done synchronously.
					expect(b[0]).to.equal('hello'); 
					expect(b[1]).to.equal(1);
					
					expect(count).to.equal(9);
					done();
				})
			);
			
			// Synchronously push hello.
			b.push('hello');
		});

		it('set between with interrupt', multi[i++] = (done) => {
			var i,
				b = [],
				count = 0,
				bound = 99, // A number greater than exactly 9 non-zero multiples of ten.
				clumpy = new Clumpy();
			
			(clumpy
				.set({
					between: ()=> {
						count++;
					}
				})
				.for_loop(
					() => i = 1,
					() => i <= bound,
					() => i++,
					() => {
						b.push(i);
						if (i % 10 === 0) {
							clumpy.interrupt();
						}
					}
				)
				.then(() => {
					// Ensure that the first clump gets deferred too,
					// not done synchronously.
					expect(b[0]).to.equal('hello'); 
					expect(b[1]).to.equal(1);
				
					expect(count).to.equal(9);
					done();
				})
			);
		
			// Synchronously push hello.
			b.push('hello');
		});


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
