"use strict";

exports.increaseTimeout = increaseTimeout;


/**
 * Increases the timeout of a test, if necessary.
 */
function increaseTimeout (test, timeout) {
  if (process.env.CI) {
    // Increase timeouts when running in CI because slooooow
    timeout *= 4;
  }

  let currentTimeout = test.timeout();
  if (currentTimeout >= timeout) {
    return currentTimeout;
  }
  else {
    test.timeout(timeout);
    test.slow(timeout * 0.75);
    return timeout;
  }
}
