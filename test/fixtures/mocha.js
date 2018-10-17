'use strict';

exports.increaseTimeout = increaseTimeout;


/**
 * Increases the timeout of a test, if necessary.
 */
function increaseTimeout (test, timeout) {
  if (test.timeout() < timeout) {
    test.timeout(timeout);
    test.slow(timeout * 0.8);
  }
}


// Mocha configuration
beforeEach('Increase test timeouts', function () {
  // Increase the test timeout to allow sufficient time for Browserify builds to complete
  increaseTimeout(this.currentTest, 6000);
});
