var chai = require('chai');  
var assert = chai.assert;    // Using Assert style
var expect = chai.expect;    // Using Expect style
var should = chai.should();  // Using Should style

require('./test-clumpy.js')((Clumpy) => {

	var i = 0,
		multi = [];

	describe('Test Clumpy Loops', () => {
		
		it('should be asynchronous', multi[i++] = (done) => {
			var i,
				b = [],
				bound = 100000,
				clumpy = new Clumpy();
				
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
					done();
				})
			);
			
			// Synchronously push hello.
			b.push('hello');
		});
		
		it('for_loop', multi[i++] = (done) => {

			var a = [],
				b = [],
				bound = 100000;
	
			// Build a big array synchronously.
			{
				let i;
				for (i = 0; i < bound; i++) {
					a.push(i);
				}
			}
			
			// Build an identical array asynchronously, and compare.
			{
				let i, clumpy = new Clumpy();
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
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}

		});

		it('for_loop with arrow functions', multi[i++] = (done) => {

			var a = [],
				b = [],
				bound = 100000;
	
			// Build a big array synchronously.
			{
				let i;
				for (i = 0; i < bound; i++) {
					a.push(i);
				}
			}
			
			// Build an identical array asynchronously, and compare.
			{
				let i, clumpy = new Clumpy();
				(clumpy
					.for_loop(()=> i = 0, ()=> i < bound, ()=> i++, () => {
						b.push(i);
					})
					.then(() => {
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}

		});

		it('for_in_loop', multi[i++] = (done) => {
			var i,
				bound = 100000,
				
				src = {},
				dest = {},
				clumpy = new Clumpy();
			
			// Build an object with a lot of properties.
			for (i = 0; i < bound; i++) {
				src['p' + i] = i;
			}
			
			// Copy the object asynchronously and compare.
			(clumpy
				.for_in_loop(
					() => { return src; },
					(key) => {
						if (src.hasOwnProperty(key)) {
							dest[key] = src[key];
						}
					}
				)
				.then(() => {
					// Test a few individually
					expect(dest.p0).to.equal(0);
					expect(dest.p112).to.equal(112);
					expect(dest.p35813).to.equal(35813);
					
					// Compare the two objects
					expect(dest).not.to.equal(src); // different objects
					expect(dest).to.eql(src); // same properties
					
					done();
				})
			);

		});

		it('while_loop', multi[i++] = (done) => {

			var a = [],
				b = [],
				bound = 100000;
	
			// Build a big array synchronously.
			{
				let i = 0;
				while (i < bound) {
					a.push(i);
					i++;
				}
			}
			
			// Build an identical array asynchronously, and compare.
			{
				let i, clumpy = new Clumpy();
				(clumpy
					.then(() => {
						i = 0;
					})
					.while_loop(
						() => i < bound,
						() => {
							b.push(i);
							i++;
						}
					)
					.then(() => {
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}

		});

		it('do_while_loop', multi[i++] = (done) => {
			var a = [],
				b = [],
				bound = 100000;
	
			// Build a big array synchronously.
			{
				let i = 0;
				do {
					a.push(i);
					i++;
				} while (i < bound);
			}
			
			// Build an identical array asynchronously, and compare.
			{
				let i, clumpy = new Clumpy();
				(clumpy
					.then(() => {
						i = 0;
					})
					.do_while_loop(
						() => {
							b.push(i);
							i++;
						},
						() => i < bound
					)
					.then(() => {
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}

		});

		it('multiple simultaneous', (realDone) => {
			var started = 0,
				finished = 0;
			for (var i = 0; i < multi.length; i++) {
				started++;
				multi[i](fakeDone);
			}
			function fakeDone() {
				finished++;
				if (finished === started) {
					realDone();
				}
			}
		});
	});
});
