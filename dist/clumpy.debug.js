(function(P,U,L){L(U,P);}(this,function(){'use strict';
/*!
 * Clumpy v1.1.1
 * https://thomasperi.github.io/clumpyjs/
 * Thomas Peri <hello@thomasperi.net>
 * MIT License
 */
 
/*global setTimeout, clearTimeout */

// Shortcuts for minification.
var has = 'hasOwnProperty',
	setTO = setTimeout,
	clearTO = clearTimeout,
	no = false,
	yes = true,
	nil = null;


// The constructor function to export.
function Clumpy(options) {

	var self = this, // Keep methods bound to `this` even if detached.

		// private instance variables
		inside, nextLabel, paused, queue, waiting, stop,
		clumpTimeout, sleepTimeout,

		// user options
		between, delay, duration, manual;


	/*
	 * A pseudo-constructor method that does all the stuff that needs to be
	 * done when a new Clumpy instance is created.
	 */
	function construct() {
		// Set initial values for private instance variables.
		init();

		// Set defaults for user options.
		between = noop;
		delay = 0;
		duration = 100;
		manual = no;

		// User can set options as argument to constructor.
		setNow(options);
	}
	

	// LOOPING ACTION METHODS

	/**
	 * Enqueue the supplied statements function and associated functions
	 * to be executed in the fashion of a 'for' loop.
	 */
	self.for_loop = for_loop;
	function for_loop(init, test, inc, statements) {
		// All the other loop methods are written in terms of this one ultimately.
		enqueue(statements, {
			label: nextLabel,
			init: init,
			test: test,
			inc: inc,
			inited: no,
			done: no
		});
		return self;
	}

	/**
	 * Enqueue the supplied statements function to be executed in the
	 * fashion of a 'for...in' loop, iterating over the supplied object.
	 */
	self.for_in_loop = for_in_loop;
	function for_in_loop(get_obj, statements) {
		// Tolerate unfiltered for...in in just this one method.  It needs to
		// be unfiltered in order to emulate the real behavior of a for...in loop.
		/*jslint forin: true */
		var i, key, keys = [];

		return for_loop(
			function () {
				// Push all the keys from the object into an array.
				for (key in get_obj()) {
					keys.push(key);
				}

				// Initialize the for loop.
				i = 0;
			},
			function () {
				return i < keys.length;
			},
			function () {
				i++;
			},
			function () {
				statements(keys[i]);
			}
		);
		/*jslint forin: false */
	}

	/**
	 * Enqueue the supplied statements and associated test function
	 * to be executed in the fashion of a 'while' loop.
	 */
	self.while_loop = while_loop;
	function while_loop(test, statements) {
		return for_loop(
			noop,
			test,
			noop,
			statements);
	}

	/**
	 * Enqueue the supplied statements and associated test function
	 * to be executed in the fashion of a 'do...while' loop.
	 */
	self.do_while_loop = do_while_loop;
	function do_while_loop(statements, test) {
		var first = yes;
		return while_loop(
			function () {
				var proceed = first || test();
				first = no;
				return proceed;
			},
			statements);
	}


	// LOOP CONTROL METHODS

	/**
	 * Emulate the 'break' keyword inside a Clumpy loop.
	 */
	self.break_loop = break_loop;
	function break_loop(label) {
		findLoop(label);
		queue.head.loop.done = yes;
	}

	/**
	 * Emulate the 'continue' keyword inside a Clumpy loop.
	 */
	self.continue_loop = continue_loop;
	function continue_loop(label) {
		findLoop(label);
	}

	/**
	 * Label the next loop.  Must precede a loop.
	 */
	self.label = label;
	function label(newLabel) {
		nextLabel = newLabel;
		return self;
	}


	// SINGLE ACTION METHODS
	
	/**
	 * Enqueue an end to the current clump.
	 */
	self.interrupt = interrupt;
	function interrupt() {
		return once(function () {
			stop = yes;
		});
	}

	/**
	 * Enqueue a code unit that sets some options.
	 */
	self.set = set;
	function set(options) {
		return once(function () {
			setNow(options);
		});
	}

	/**
	 * Enqueue a sleep of `delay` milliseconds.
	 */
	self.sleep = sleep;
	function sleep(delay) {
		return wait(function (callback) {
			sleepTimeout = setTO(callback, delay);
		});
	}

	/**
	 * Enqueue the supplied statements function to be executed exactly once.
	 */
	self.then = self.once = once;
	function once(statements) {
		enqueue(statements, nil);
		return self;
	}

	/**
	 * Enqueue a code unit that:
	 * (a) performs an asynchronous operation, and then
	 * (b) waits for the callback before proceeding.
	 */
	self.wait = wait;
	function wait(statements) {
		return once(function () {
			waiting = yes;
			statements(wait_callback);
		});
	}

	/**
	 * Enqueue a "try" and "catch" block, during which any exceptions thrown
	 * will get caught and processed by the associated "catch" block.
	 */
// 	self.try_ = try_catch;
// 	function try_catch(try_stmts, catch_stmts, finally_stmts) {
//		
// 		// to-do
//		// Keep a stack of "tries", and push a new one before invoking try_stmts. 
//		// Before invoking *any* statements function,
//		// if there are any tries on the stack,
//		// pop the top one off*, but keep it stashed.
//		// Wrap the function call in a real `try...catch` statement
//		// which can than call the stashed try's catch_stmts function.
//		// * The reason for popping it off is so that anything thrown
//		// from inside `catch_stmts` or `finally_stmts` should get caught
//		// by the outer `try_catch` if there is one, or not caught at all.
//		
// 		return self;
// 	}

	
	// EXTERNAL CONTROL METHODS
	
	/**
	 * Stop and forget everything this Clumpy instance is doing,
	 * but don't reset the options.
	 */
	self.init = init;
	function init() {
		inside = no;
		nextLabel = nil;
		paused = no;
		queue = spawn(nil);
		stop = no;
		waiting = no;
		clearTO(clumpTimeout);
		clearTO(sleepTimeout);
		return self;
	}

	/**
	 * Freeze this Clumpy instance in its tracks.
	 */
	self.pause = pause;
	function pause() {
		paused = yes;
		clearTO(clumpTimeout);
		clearTO(sleepTimeout);
		return self;
	}

	/**
	 * Resume after pause.
	 */
	self.resume = resume;
	function resume() {
		if (paused) {
			paused = no;
			if (!waiting) {
				schedule();
			}
		}
		return self;
	}

	/**
	 * Set some options now, without enqueueing the act of doing so.
	 */
	self.setNow = setNow;
	function setNow(options) {
		if (options && typeof options === 'object') {
			if (options[has]('between')) {
				between = options.between;
				if (typeof between !== 'function') {
					between = noop;
				}
			}
			if (options[has]('delay')) {
				delay = num(options.delay, 0);
			}
			if (options[has]('duration')) {
				duration = num(options.duration, 0);
			}
			if (options[has]('manual')) {
				manual = !!options.manual;
			}

			// Pause and resume the Clumpy to make the changes take effect immediately.
			if (queue.head && !paused && !waiting) {
				pause();
				setTO(resume, 0);
			}
		}
		return self;
	}


	// PRIVATE HELPER METHODS

	/*
	 * Advance to the next iteration.
	 */
	function advance() {

		// Keep advancing until we shouldn't anymore.
		while (true) {

			// If the current node is a loop that hasn't finished,
			// just increment the loop and stop advancing.
			var loop = queue.head.loop;
			if (loop && !loop.done) {
				loop.inc.call();

			// Otherwise -- since it's not a loop that hasn't finished --
			// it must be either a one-off node, or a loop that has finished...
			} else {

				// ...so move on to the next node.
				queue.head = queue.head.next;

				// If it turns out that there was no next node
				// in this queue to move on to...
				if (!queue.head) {

					// ...clear the tail also.
					queue.tail = nil;

					// Then, if there's a parent queue to go back to, go back to it.
					if (queue.parent) {
						queue = queue.parent;

						// Once we're back at the parent queue, though, we
						// can't just stay there, because the very fact that
						// we were running code inside a child queue means
						// that the current node in the parent queue has already
						// been performed.  Therefore, we need to continue
						// this advancing loop to decide where to go from there.
						continue;
					}

					// If there's no parent queue, and there are no more nodes
					// in this queue, that means there are no more nodes left
					// at all.  The current clump will exit without scheduling.
				}
			}

			// End this advancing loop.
			break;
		}
	}

	/*
	 * Do a synchronous clump of statements blocks,
	 * and schedule another clump after a timeout.
	 */
	function clump() {
		if (queue.head) {
			// The time after which this clump should end.
			var end = new Date().getTime() + duration;
			
			// There are many potential reasons why this loop might need
			// to end, so loop indefinitely and break when decided.
			while (true) {
				// Do one iteration.
				iterate();

				// If there's nothing left to do after this iteration,
				// then don't bother calling between or schedule.
				if (!queue.head) {
					break;
				}

				// If this Clumpy has been paused, or if this iteration
				// caused it to be waiting, then don't schedule a new clump
				// right now.  Do call between, though, because we expect
				// another clump eventually.
				if (paused || waiting) {
					between();
					break;
				}

				// If the current clump has reached its time limit,
				// or has been interrupted, schedule a new clump.
				if (stop || (!manual && (new Date().getTime() >= end))) {
					stop = no;
					between();

					// Only delay here, when scheduling from within a clump
					schedule(delay);
					break;
				}
			}
		}
	}

	/*
	 * The callback for wait.
	 */
	function wait_callback() {
		if (waiting) {
			waiting = no;
			if (!paused) {
				schedule();
			}
		}
	}

	/*
	 * Put a node -- either a loop or not --
	 * into the Clumpy queue to be performed eventually.
	 */
	function enqueue(statements, loop) {
		nextLabel = nil;
		var node = {
			loop: loop,
			statements: statements,
			next: nil
		};

		// If this is the first node that was enqueued inside a statements
		// block, start a new queue using the current one as its parent.
		if (inside) {
			inside = no;
			queue = spawn(queue);
		}

		// If there's anything in the (now-)current queue,
		// add the new node to the end of it.
		if (queue.tail) {
			queue.tail.next = node;
			queue.tail = node;

		// Otherwise, mark this new node as the beginning and end.
		} else {
			queue.head = node;
			queue.tail = node;

			// If this is the beginning of the outermost queue,
			// the the timeouts need to be started.
			if (!queue.parent) {
				schedule();
			}
		}
	}

	/*
	 * Back out to the nearest loop, or if a label is supplied,
	 * the nearest loop with that label.
	 */
	function findLoop(label) {
		// Back out until we find a loop.
		while (!queue.head.loop) {
			queue = queue.parent;
			if (!queue) {
				throw "'break_loop' and 'continue_loop' can only be used inside a Clumpy loop!";
			}
		}
		if (label) {
			// If the loop we've found isn't the one with the specified label,
			// keep backing out until we find it.
			while (!queue.head.loop || queue.head.loop.label !== label) {
				queue = queue.parent;
				if (!queue) {
					throw "Clumpy couldn't find the label '" + label + "'.";
				}
			}
		}
	}

	/*
	 * Perform the current code unit.
	 */
	function iterate() {
		var loop;

		queue.begun = yes;

		loop = queue.head.loop;
		if (loop) {
			if (!loop.inited) {
				loop.init.call();
				loop.inited = yes;
			}
			if (loop.test.call()) {
				perform();
			} else {
				loop.done = yes;
			}
		} else {
			perform();
		}

		// Advance only if the latest statements function
		// didn't push a new queue that hasn't begun yet.
		if (queue.begun) {
			advance();
		}
	}

	/*
	 * Perform the current node's statements.
	 */
	function perform() {
		inside = yes;
		queue.head.statements.call();
		inside = no;
	}

	/*
	 * Add the next clump to the browser's event queue.
	 */
	function schedule(d) {
		// Only schedule it if there's something to do.
		if (queue.head) {
			clumpTimeout = setTO(clump, d || 0);
		}
	}


	// Call that pseudo-constructor.
	construct();
}


// PRIVATE MODULE METHODS

/*
 * Any empty function.
 */
function noop() {
}

/*
 * Clean an argument that's supposed to be a number.
 */
function num(value, min) {
	value = parseInt(value) || 0;
	return typeof min === 'number' ? Math.max(min, value) : value;
}

/*
 * Start a new queue, optionally specifying the parent.
 */
function spawn(parent) {
	return {
		begun: no,
		parent: parent,
		head: nil,
		tail: nil
	};
}


return Clumpy;


}, function (factory, root) {
	/*global define, exports, module */
	'use strict';
	
	var library,
		original,
		hasOriginal,
		
		// Shortcuts
		n = 'Clumpy',
		hop = 'hasOwnProperty',
		noc = 'noConflict',
		obj = 'object',
		def = typeof define === 'function' && define,
		exp = typeof exports === obj && exports,
		mod = typeof module === obj && module;
	
	// AMD
	if (def && def.amd && typeof def.amd === obj) {
		define([], factory);
	
	// CommonJS
	} else if (mod && exp === root && exp === mod.exports) {
		module.exports = factory();
	
	// Web
	} else {
		
		// Stash the original value if there was one.
		if ((hasOriginal = root[hop](n))) {
			original = root[n];
		}
		
		// Assign the new value and stash it for later.
		root[n] = library = factory();

		// If the library doesn't define its own `noConflict` method,
		// define a new one that reverts the property on the root object
		// and returns the library for reassignment.
		if (!library[hop](noc)) {
			library[noc] = function () {
				if (hasOriginal) {
					root[n] = original;
				} else {
					delete root[n];
				}
				// Once noConflict has been called once, replace it with a new
				// function that just returns the library, to avoid unexpected
				// consequences if it's accidentally called again.
				library[noc] = function () {
					return library;
				};
				return library;
			};
		}
		
	} 
}));