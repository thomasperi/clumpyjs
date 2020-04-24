// Run tests on the debug and min files.
module.exports = function (fn) {
	fn(require('../dist/clumpy.debug.js'));
	fn(require('../dist/clumpy.min.js'));
};