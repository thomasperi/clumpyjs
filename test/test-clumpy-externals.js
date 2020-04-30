var chai = require('chai');  
var assert = chai.assert;    // Using Assert style
var expect = chai.expect;    // Using Expect style
var should = chai.should();  // Using Should style

require('./test-clumpy.js')((Clumpy) => {

	var i = 0,
		multi = [];
	
	describe('Test Clumpy External Control', () => {
		
		it('pause', multi[i++] = (done) => {

			var delay = 100,
				clumpy = new Clumpy(),
				now = ()=> new Date().getTime(),
				start = now(),
				recent = 0;
			
			// Start the loop
			(clumpy
				.while_loop(
					() => true,
					() => {
						recent = now();
					}
				)
			);
			
			// Pause the instance after the time delay elapses.
			setTimeout(function () {
				clumpy.pause();
				
				// After pausing, recent should be at least the starting
				// timestamp plus the length of the timeout before pausing
				expect(recent).to.not.be.below(start + delay);
				
				// Stash the recent timestamp.
				var past = recent;
				
				// Set another timeout to verify that the loop really paused.
				setTimeout(function () {
					expect(past).to.equal(recent);
					done();
				}, delay);
				
			}, delay);
	
		});

		it('resume', multi[i++] = (done) => {

			var delay = 100,
				clumpy = new Clumpy(),
				now = ()=> new Date().getTime(),
				start = now(),
				recent = 0;
			
			// Start the loop
			(clumpy
				.while_loop(
					() => true,
					() => {
						recent = now();
					}
				)
			);
			
			// Pause the instance after the time delay elapses.
			setTimeout(function () {
				clumpy.pause();
				
				// Resume it after waiting another equal time period.
				setTimeout(function () {
					clumpy.resume();
					
					// Wait yet another equal time period after resuming,
					// and verify that the clumpy has resumed updating the
					// timestamp. (3 timeouts have happened, so the timestamp
					// should be at least that plus the starting time.)
					setTimeout(function () {
						expect(recent).to.not.be.below(start + 3 * delay);
						clumpy.pause(); // Prevent the clumpy from continuing to run
						done();
					}, delay);
					
				}, delay);
				
			}, delay);
	
		});

		it('clear while paused', multi[i++] = (done) => {

			var delay = 100,
				clumpy = new Clumpy(),
				now = ()=> new Date().getTime(),
				start = now(),
				recentA = 0,
				recentB = 0;
			
			// Start a loop
			(clumpy
				.while_loop(
					() => true,
					() => {
						recentA = now();
					}
				)
			);
			
			// Pause the instance after the time delay elapses.
			setTimeout(function () {
				clumpy.pause();
				
				// Reinitialize it after waiting another equal time period.
				setTimeout(function () {
					// Keep a copy of recentA to be sure the first loop
					// doesn't contine to update it.
					var stashA = recentA;
					
					// Reinitialize the instance.
					clumpy.clear();
					
					// Start another loop that updates a different timestamp.
					(clumpy
						.while_loop(
							() => true,
							() => {
								recentB = now();
							}
						)
					);
					
					// Pause it again, and compare.
					setTimeout(function () {
						clumpy.pause();
						
						// recentA should not have changed.
						expect(recentA).to.equal(stashA);
						
						// recentB should have been updated.
						expect(recentB).to.not.be.below(start + 3 * delay);
						done();
					}, delay);
					
				}, delay);
				
			}, delay);
	
		});

		it('clear while running', multi[i++] = (done) => {

			var delay = 100,
				clumpy = new Clumpy(),
				now = ()=> new Date().getTime(),
				start = now(),
				recentA = 0,
				recentB = 0;
			
			// Start a loop
			(clumpy
				.while_loop(
					() => true,
					() => {
						recentA = now();
					}
				)
			);
			
			// Reinitialize after a delay
			setTimeout(function () {
				// Keep a copy of recentA to be sure the first loop
				// doesn't contine to update it.
				var stashA = recentA;
				
				// Reinitialize the instance.
				clumpy.clear();
				
				// Start another loop that updates a different timestamp.
				(clumpy
					.while_loop(
						() => true,
						() => {
							recentB = now();
						}
					)
				);
				
				// Pause it again, and compare.
				setTimeout(function () {
					clumpy.pause();
					
					// recentA should not have changed.
					expect(recentA).to.equal(stashA);
					
					// recentB should have been updated.
					expect(recentB).to.not.be.below(start + 2 * delay);
					done();
				}, delay);
				
			}, delay);
	
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
