'use strict';

// Mocha configuration
beforeEach('Increase test timeouts', function () {
  // Increase the test timeout to allow sufficient time for Browserify builds to complete
  this.currentTest.timeout(6000);
  this.currentTest.slow(4000);
});
