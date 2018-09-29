'use strict';

const cli = require('../fixtures/cli');
const assert = require('../fixtures/assert');
const expect = require('chai').expect;
const del = require('del');
const touch = require('touch');

describe('simplifyify --watch', () => {
  let waitForBrowserify;

  beforeEach(function () {
    // Increase the test timeouts to allow sufficient time for multiple Browserify builds
    let isSlowEnvironment = !!process.env.CI;
    this.currentTest.timeout(isSlowEnvironment ? 45000 : 15000);
    waitForBrowserify = isSlowEnvironment ? 15000 : 5000;
  });

  it('should rebuild a single output file', (done) => {
    // Run Watchify
    let watchify = cli.run('es5/lib/index.js --watch --outfile es5/dist/my-file.js', onExit);

    // Check the initial outputs after a few seconds
    setTimeout(firstCheck, waitForBrowserify);

    function firstCheck () {
      checkOutputFiles();

      // Delete the output
      del('test/test-apps/es5/dist')
        .then(() => {
          // Touch a file, to trigger Watchify again
          touch('test/test-apps/es5/lib/say/index.js');

          // Check the outputs again after a few seconds
          setTimeout(secondCheck, waitForBrowserify);
        })
        .catch(done);
    }

    function secondCheck () {
      checkOutputFiles();
      watchify.kill();
    }

    // Verify the final results
    function onExit (err, stdout, stderr) {
      expect(stderr).to.be.empty;
      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/my-file.js');
      expect(stdout).to.contain('\nes5/lib/say/index.js has changed');
      checkOutputFiles();
      done();
    }

    function checkOutputFiles () {
      assert.directoryContents('es5/dist', 'my-file.js');

      assert.fileContents('es5/dist/my-file.js', (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
    }
  });

  it('should rebuild multiple output files', (done) => {
    // Run Watchify
    // jscs:disable maximumLineLength
    let watchify = cli.run(
      'es5/lib/**/*.js --watch --bundle --debug --minify --test --standalone Fizz.Buzz --outfile es5/dist/*.bundle.js',
      onExit
    );
    // jscs:enable maximumLineLength

    // Check the initial outputs after a few seconds
    setTimeout(firstCheck, waitForBrowserify);

    function firstCheck () {
      assert.directoryContents('es5/dist', [
        'index.bundle.js',
        'index.bundle.js.map',
        'index.bundle.min.js',
        'index.bundle.min.js.map',
        'index.bundle.coverage.js',
        'hello-world.bundle.js',
        'hello-world.bundle.js.map',
        'hello-world.bundle.min.js',
        'hello-world.bundle.min.js.map',
        'hello-world.bundle.coverage.js',
        'say/index.bundle.js',
        'say/index.bundle.js.map',
        'say/index.bundle.min.js',
        'say/index.bundle.min.js.map',
        'say/index.bundle.coverage.js'
      ]);

      assert.fileContents('es5/dist', ['index.bundle.js', 'hello-world.bundle.js', 'say/index.bundle.js'],
        function (contents) {
          assert.noBanner(contents);
          assert.hasUmdPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });
      assert.fileContents('es5/dist', ['index.bundle.min.js', 'hello-world.bundle.min.js', 'say/index.bundle.min.js'],
        function (contents) {
          assert.noBanner(contents);
          assert.hasMinifiedUmdPreamble(contents);
          assert.isMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });
      assert.fileContents('es5/dist', ['index.bundle.coverage.js', 'hello-world.bundle.coverage.js', 'say/index.bundle.coverage.js'],
        function (contents) {
          assert.noBanner(contents);
          assert.hasMinifiedUmdPreamble(contents);
          assert.isMinified(contents, true);
          assert.noSourceMap(contents);
          assert.hasCoverage(contents);
        });

      assert.fileContents('es5/dist', ['index.bundle.js.map', 'index.bundle.min.js.map'], (contents) => {
        expect(contents.sources).to.contain.members([
          '../lib/hello-world.js',
          '../lib/index.js',
          '../lib/say/index.js'
        ]);
      });
      assert.fileContents('es5/dist', ['hello-world.bundle.js.map', 'hello-world.bundle.min.js.map'], (contents) => {
        expect(contents.sources).to.contain.members([
          '../lib/hello-world.js',
          '../lib/say/index.js'
        ]);
      });
      assert.fileContents('es5/dist', ['say/index.bundle.js.map', 'say/index.bundle.min.js.map'], (contents) => {
        expect(contents.sources).to.contain.members([
          '../../lib/say/index.js'
        ]);
      });

      // Delete the output
      del('test/test-apps/es5/dist')
        .then(() => {
          // Touch a file, to trigger Watchify again
          // NOTE: Only two of the three entry files will be re-build, since the third doesn't reference this file
          touch('test/test-apps/es5/lib/hello-world.js');

          // Check the outputs again after a few seconds
          setTimeout(secondCheck, waitForBrowserify);
        })
        .catch(done);
    }

    function secondCheck () {
      assert.directoryContents('es5/dist', [
        'index.bundle.js',
        'index.bundle.js.map',
        'index.bundle.min.js',
        'index.bundle.min.js.map',
        'index.bundle.coverage.js',
        'hello-world.bundle.js',
        'hello-world.bundle.js.map',
        'hello-world.bundle.min.js',
        'hello-world.bundle.min.js.map',
        'hello-world.bundle.coverage.js'
      ]);

      assert.fileContents('es5/dist', ['index.bundle.js', 'hello-world.bundle.js'],
        function (contents) {
          assert.noBanner(contents);
          assert.hasUmdPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });
      assert.fileContents('es5/dist', ['index.bundle.min.js', 'hello-world.bundle.min.js'],
        function (contents) {
          assert.noBanner(contents);
          assert.hasMinifiedUmdPreamble(contents);
          assert.isMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });
      assert.fileContents('es5/dist', ['index.bundle.coverage.js', 'hello-world.bundle.coverage.js'],
        function (contents) {
          assert.noBanner(contents);
          assert.hasMinifiedUmdPreamble(contents);
          assert.isMinified(contents, true);
          assert.noSourceMap(contents);
          assert.hasCoverage(contents);
        });

      assert.fileContents('es5/dist', ['index.bundle.js.map', 'index.bundle.min.js.map'], (contents) => {
        expect(contents.sources).to.contain.members([
          '../lib/hello-world.js',
          '../lib/index.js',
          '../lib/say/index.js'
        ]);
      });
      assert.fileContents('es5/dist', ['hello-world.bundle.js.map', 'hello-world.bundle.min.js.map'], (contents) => {
        expect(contents.sources).to.contain.members([
          '../lib/hello-world.js',
          '../lib/say/index.js'
        ]);
      });

      watchify.kill();
    }

    // Verify the final results
    function onExit (err, stdout, stderr) {
      expect(stderr).to.be.empty;

      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.bundle.js');
      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.bundle.js.map');
      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.bundle.min.js');
      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.bundle.min.js.map');
      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.bundle.coverage.js');
      expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.bundle.js');
      expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.bundle.js.map');
      expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.bundle.min.js');
      expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.bundle.min.js.map');
      expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.bundle.coverage.js');
      expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.bundle.js');
      expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.bundle.js.map');
      expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.bundle.min.js');
      expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.bundle.min.js.map');
      expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.bundle.coverage.js');

      expect(stdout).to.contain('\nes5/lib/hello-world.js has changed');
      done();
    }
  });

  it('should report errors', (done) => {
    // This test fails on Windows, because Watchify crashes
    if (process.platform === 'win32') {
      return done();
    }

    // Run Watchify
    let watchify = cli.run('error/error.js --watch --outfile es5/dist/error.js', onExit);

    // Check the outputs after a few seconds
    setTimeout(firstCheck, waitForBrowserify);

    function firstCheck () {
      checkOutputFiles();

      // Delete the output
      del('test/test-apps/es5/dist')
        .then(() => {
          // Touch a file, to trigger Watchify again
          touch('test/test-apps/error/error.js');

          // Check the outputs again after a few seconds
          setTimeout(secondCheck, waitForBrowserify);
        })
        .catch(done);
    }

    function secondCheck () {
      checkOutputFiles();
      watchify.kill();
      done();
    }

    // Verify the final results
    function onExit (err, stdout, stderr) {
      expect(stderr).to.equal('Error bundling error\/error.js\nUnexpected token');
      expect(stdout).to.equal('');
    }

    function checkOutputFiles () {
      // The output file should be created, even though an error occurred
      assert.directoryContents('es5/dist', 'error.js');

      // The output file should be empty
      assert.fileContents('es5/dist/error.js', (contents) => {
        expect(contents).to.equal('');
      });
    }
  });

});
