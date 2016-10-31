'use strict';

// Mocha configuration
beforeEach(function () {
  // Increase the test timeout to allow sufficient time for Browserify builds to complete
  this.currentTest.timeout(6000);
  this.currentTest.slow(4000);
});
