var chai = require('chai');  
var assert = chai.assert;    // Using Assert style
var expect = chai.expect;    // Using Expect style
var should = chai.should();  // Using Should style

require('./test-clumpy.js')((Clumpy) => {

	var i = 0,
		multi = [];

	describe('Test Break and Continue', () => {

		it('continue_loop (shallow)', multi[i++] = (done) => {

			var a = [],
				b = [],
				bound = 100000;

			// Build a big array synchronously.
			{
				let i;
				for (i = 0; i < bound; i++) {
					if (10 < i && i < 100) {
						continue;
					}
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
							if (10 < i && i < 100) {
								return (clumpy
									.continue_loop()
								);
							}
							b.push(i);
						}
					).
					once(() => {
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}

		});

		it('break_loop (shallow)', multi[i++] = (done) => {
			var a = [],
				b = [],
				bound = 100000;

			// Build a big array synchronously.
			{
				let i;
				for (i = 0; i < bound; i++) {
					if (i >= bound / 2) {
						break;
					}
					a.push(i);
				}
			}
	
			// Make sure the synchronous loop actually did what we want.
			expect(a.length).to.equal(bound / 2);

			// Build an identical array asynchronously, and compare.
			{
				let i, clumpy = new Clumpy();
				(clumpy
					.for_loop(
						() => i = 0,
						() => i < bound,
						() => i++,
						() => {
							if (i >= bound / 2) {
								return (clumpy
									.break_loop()
								);
							}
							b.push(i);
						}
					).
					once(() => {
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}

		});

		it('continue_loop (nested)', multi[i++] = (done) => {
			var a = [],
				b = [],
				iBound = 300,
				jBound = 300;
		
			// control
			{
				let i, j;
				for (i = 0; i < iBound; i++) {
					a[i] = [];
					if (i === 3) {
						continue;
					}
					for (j = 0; j < jBound; j++) {
						a[i][j] = null;
						if (j === 2) {
							continue;
						}
						a[i][j] = [i, j];
					}
				}
			}
			
			// Ensure this actually built the data structure we want...
			expect(a[0][0]).to.eql([0, 0]);
			expect(a[2][9]).to.eql([2, 9]);
			expect(a[3]).to.eql([]); // i === 3
			expect(a[8][20]).to.eql([8, 20]);
			expect(a[16][2]).to.eql(null); // j === 2
			
			// test
			{
				let i, j, clumpy = new Clumpy();
				(clumpy
					.for_loop(
						() => i = 0,
						() => i < iBound,
						() => i++,
						() => {(clumpy
							.once(() => {
								b[i] = [];
								if (i === 3) {
									return (clumpy
										.continue_loop()
									);
								}
							})
							.for_loop(
								() => j = 0,
								() => j < jBound,
								() => j++,
								() => {
									b[i][j] = null;
									if (j === 2) {
										return (clumpy
											.continue_loop()
										);
									}
									b[i][j] = [i, j];
								}
							)
						);}
					)
					.once(() => {
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}

		});

		it('break_loop (nested)', multi[i++] = (done) => {
			var a = [],
				b = [],
				iBound = 400,
				jBound = 300;
		
			// control
			{
				let i, j;
				for (i = 0; i < iBound; i++) {
					if (i >= iBound / 2) {
						break;
					}
					a.push([]);
					for (j = 0; j < jBound; j++) {
						if (j >= jBound / 2) {
							break;
						}
						a[i].push([i,j]);
					}
				}
			}
			
			// Sanity check the array
			expect(a.length).to.eql(iBound / 2);
			expect(a[10].length).to.eql(jBound / 2);
		
			// test
			{
				let i, j, clumpy = new Clumpy();
				(clumpy
					.for_loop(
						() => i = 0,
						() => i < iBound,
						() => i++,
						() => {(clumpy
							.once(() => {
								if (i >= iBound / 2) {
									return (clumpy
										.break_loop()
									);
								}
								b.push([]);
							})
							.for_loop(
								() => j = 0,
								() => j < jBound,
								() => j++,
								() => {
									if (j >= jBound / 2) {
										return clumpy.
										break_loop();
									}
									b[i].push([i,j]);
								}
							)
						);}
					).
					once(() => {
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}
	
		});

		it('continue_loop with label (shallow)', multi[i++] = (done) => {

			var a = [],
				b = [],
				bound = 100000;
		
			// control
			{
				let i;
				myLabel:
				for (i = 0; i < bound; i++) {
					if (10 < i && i < 100) {
						continue myLabel;
					}
					a.push(i);
				}
			}
			
			// sanity check
			expect(a[9]).to.eql(9);
			expect(a[10]).to.eql(10);
			expect(a[11]).to.eql(100);
			expect(a[12]).to.eql(101);
			expect(a[13]).to.eql(102);

			// test
			{
				let i, clumpy = new Clumpy();
				(clumpy
					.label('myLabel')
					.for_loop(
						() => i = 0,
						() => i < bound,
						() => i++,
						() => {
							if (10 < i && i < 100) {
								return (clumpy
									.continue_loop('myLabel')
								);
							}
							b.push(i);
						}
					)
					.once(() => {
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}
	
	
		});

		it('break_loop with label (shallow)', multi[i++] = (done) => {
			var a = [],
				b = [],
				bound = 100000;
		
			// control
			{
				let i;
				myLabel:
				for (i = 0; i < bound; i++) {
					if (i >= bound / 2) {
						break myLabel;
					}
					a.push(i);
				}
			}
			
			// sanity check
			expect(a.length).to.eql(bound / 2);
			expect(a[120]).to.eql(120);
		
			// test
			{
				let i, clumpy = new Clumpy();
				(clumpy
					.label('myLabel')
					.for_loop(
						() => i = 0,
						() => i < bound,
						() => i++,
						() => {
							if (i >= bound / 2) {
								return (clumpy
									.break_loop('myLabel')
								);
							}
							b.push(i);
						}
					)
					.once(() => {
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}

		});

		it('continue_loop with label (nested)', multi[i++] = (done) => {
			var a = [],
				b = [],
				iBound = 300,
				jBound = 400;
		
			// control
			{
				let i, j;
				myLabel:
				for (i = 0; i < iBound; i++) {
					a.push([]);
					if (i === 3) {
						continue;
					}
					for (j = 0; j < jBound; j++) {
						if (j === 2) {
							continue myLabel;
						}
						a[i].push([i,j]);
					}
				}
			}
			
			// sanity check
			expect(a.length).to.eql(iBound);
			expect(a[3]).to.eql([]); // i === 3 has an empty array
			expect(a[0].length).to.eql(2); // all subarrays stop after 2 items
			expect(a[1].length).to.eql(2);
			expect(a[2].length).to.eql(2);
			expect(a[94].length).to.eql(2);
			expect(a[123].length).to.eql(2);
			expect(a[32][0]).to.eql([32, 0]); // subarrays should contain arrays of the indexes
			expect(a[132][1]).to.eql([132, 1]);
			
			// test
			{
				let i, j, clumpy = new Clumpy();
				(clumpy
					.label('myLabel')
					.for_loop(
						() => i = 0,
						() => i < iBound,
						() => i++,
						() => {
							(clumpy
								.once(() => {
									b.push([]);
									if (i === 3) {
										return (clumpy.
											continue_loop()
										);
									}
								})
								.for_loop(
									() => j = 0,
									() => j < jBound,
									() => j++,
									() => {
										if (j === 2) {
											return (clumpy
												.continue_loop('myLabel')
											);
										}
										b[i].push([i,j]);
									}
								)
							);
						}
					)
					.once(() => {
						// different arrays, same content
						expect(a).not.to.equal(b); 
						expect(a).to.eql(b);
						done();
					})
				);
			}
			
		});

		it('break_loop with label (nested)', multi[i++] = (done) => {
			var a = [],
				b = [],
				iBound = 300,
				jBound = 400;
		
			// control
			{
				let i, j;
				myLabel:
				for (i = 0; i < iBound; i++) {
					if (i >= iBound / 2) {
						break;
					}
					a.push([]);
					for (j = 0; j < jBound; j++) {
						if (j >= jBound / 2) {
							break myLabel;
						}
						a[i].push([i,j]);
					}
				}
			}
			
			// sanity check
			expect(a.length).to.eql(1); // because the inner loop breaks the outer loop
			expect(a[0].length).to.eql(jBound / 2);
			expect(a[0][123]).to.eql([0, 123]);
		
			// test
			{
				let i, j, clumpy = new Clumpy();
				
				(clumpy
					.label('myLabel')
					.for_loop(
						() => i = 0,
						() => i < iBound,
						() => i++,
						() => {
							(clumpy
								.once(() => {
									if (i >= iBound / 2) {
										return (clumpy
											.break_loop()
										);
									}
									b.push([]);
								})
								.for_loop(
									() => j = 0,
									() => j < jBound,
									() => j++,
									() => {
										if (j >= jBound / 2) {
											return (clumpy
												.break_loop('myLabel')
											);
										}
										b[i].push([i,j]);
									}
								)
							);
						}
					)
					.once(() => {
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
