// Mocha configuration
beforeEach(function() {
  // Increase the test timeout, since some tests have to allow time for multiple Browserify builds
  this.currentTest.timeout(5000);
  this.currentTest.slow(3000);
});
