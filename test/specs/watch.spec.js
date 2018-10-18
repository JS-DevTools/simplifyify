'use strict';

const cli = require('../fixtures/cli');
const mocha = require('../fixtures/mocha');
const assert = require('../fixtures/assert');
const expect = require('chai').expect;
const util = require('../../lib/util');

describe('simplifyify --watch', () => {
  let testTimeout, modifiedFilePath, originalFileContents;
  const modifiedMarker = 'This file has been modified by one of the Watchify tests';

  beforeEach(function () {
    // Increase the test timeouts to allow sufficient time for multiple Browserify builds
    testTimeout = mocha.increaseTimeout(this.currentTest, 15000);

    // Reset variables that track modified files
    modifiedFilePath = undefined;
    originalFileContents = undefined;
  });

  afterEach(function () {
    if (modifiedFilePath) {
      // Restore the original contents of the file that was modified to trigger Watchify
      return util.writeFile(modifiedFilePath, originalFileContents);
    }
  });

  /**
   * Waits a few seconds to allow Watchify to re-build the bundle
   */
  function waitForWatchify () {
    return new Promise((resolve) => setTimeout(resolve, testTimeout / 4));
  }

  /**
   * Ensures that the "done()" function is only called once
   */
  function doneOnce(done) {
    return function(error) {
      done && done(error);
      done = undefined;
    }
  }

  /**
   * Modifies the specified file to trigger Watchify.
   *
   * @param {string} file - The file to modify
   * @param {string} [newContent] - The new file content.  Defaults to the original content
   *                                with a marker appended
   */
  function modifyFile (file, newContent) {
    file = `test/test-apps/${file}`;

    return util.readFile(file)
      .then((contents) => {
        // Save the file's original contents, so we can restore it after the test finishes
        modifiedFilePath = file;
        originalFileContents = originalFileContents || contents;

        // Modify the file to trigger Watchify
        return util.writeFile(file, newContent || `
          ${originalFileContents}

          // ${modifiedMarker}
          var x = "${modifiedMarker}";
        `);
      });
  }

  it('should rebuild a single output file', (done) => {
    done = doneOnce(done);

    // Run Watchify
    let watchify = cli.run('es5/lib/index.js --watch --outfile es5/dist/my-file.js', onExit);

    // Wait for Watchify to finish building the code
    waitForWatchify()
      .then(() => {
        // Confirm that the code built correctly
        checkOutputFiles();

        // Confirm that the code DOES NOT contain our modified code yet
        assert.fileContents('es5/dist/my-file.js', (contents) => {
          expect(contents).not.to.contain(modifiedMarker);
        });

        // Modify a file, to trigger Watchify again
        return modifyFile('es5/lib/say/index.js');
      })
      .then(() => {
        // Wait for Watchify to finish re-building the code
        return waitForWatchify();
      })
      .then(() => {
        // Confirm that the same output files exist
        checkOutputFiles();

        // Confirm that the code DOES contain our modified code
        assert.fileContents('es5/dist/my-file.js', (contents) => {
          expect(contents).to.contain(modifiedMarker);
        });
      })
      .catch(done)
      .then(() => {
        watchify.kill();
      });

    function checkOutputFiles() {
      assert.directoryContents('es5/dist', 'my-file.js');

      assert.fileContents('es5/dist/my-file.js', (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
    }

    function onExit (err, stdout, stderr) {
      try {
        // Verify the final results
        expect(stderr).to.be.empty;
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/my-file.js');
        expect(stdout).to.contain('\nes5/lib/say/index.js has changed');
        done();
      }
      catch (error) {
        done(error);
      }
    }
  });

  it('should rebuild multiple output files', (done) => {
    done = doneOnce(done);

    // Run Watchify
    let watchify = cli.run('es5/lib/**/*.js -wbcdm --standalone Fizz.Buzz --outfile es5/dist/*.bundle.js', onExit);

    // Wait for Watchify to finish building the code
    waitForWatchify()
      .then(() => {
        // Confirm that the code built correctly
        checkOutputFiles();

        // Confirm that the code DOES NOT contain our modified code yet
        assert.fileContents('es5/dist/hello-world.bundle.coverage.js', (contents) => {
          expect(contents).not.to.contain(modifiedMarker);
        });

        assert.fileContents('es5/dist/hello-world.bundle.js', (contents) => {
          expect(contents).not.to.contain(modifiedMarker);
        });

        assert.fileContents('es5/dist/hello-world.bundle.js.map', (map) => {
          expect(map.sourcesContent[1]).not.to.contain(modifiedMarker);
        });

        assert.fileContents('es5/dist/hello-world.bundle.min.js', (contents) => {
          expect(contents).not.to.contain(modifiedMarker);
        });

        assert.fileContents('es5/dist/hello-world.bundle.min.js.map', (map) => {
          expect(map.sourcesContent[1]).not.to.contain(modifiedMarker);
        });

        // Modify a file, to trigger Watchify again
        return modifyFile('es5/lib/hello-world.js');
      })
      .then(() => {
          // Wait for Watchify to finish re-building the code
          return waitForWatchify();
      })
      .then(() => {
        // Confirm that the same output files exist
        checkOutputFiles();

        // Confirm that the code DOES contain our modified code
        assert.fileContents('es5/dist/hello-world.bundle.coverage.js', (contents) => {
          expect(contents).to.contain(modifiedMarker);
        });

        assert.fileContents('es5/dist/hello-world.bundle.js', (contents) => {
          expect(contents).to.contain(modifiedMarker);
        });

        assert.fileContents('es5/dist/hello-world.bundle.js.map', (map) => {
          expect(map.sourcesContent[1]).to.contain(modifiedMarker);
        });

        assert.fileContents('es5/dist/hello-world.bundle.min.js', (contents) => {
          expect(contents).to.contain(modifiedMarker);
        });

        assert.fileContents('es5/dist/hello-world.bundle.min.js.map', (map) => {
          expect(map.sourcesContent[1]).to.contain(modifiedMarker);
        });
      })
      .catch(done)
      .then(() => {
        watchify.kill();
      });

    function checkOutputFiles() {
      assert.directoryContents('es5/dist', [
        'hello-world.bundle.coverage.js',
        'hello-world.bundle.js',
        'hello-world.bundle.js.map',
        'hello-world.bundle.min.js',
        'hello-world.bundle.min.js.map',
        'index.bundle.coverage.js',
        'index.bundle.js',
        'index.bundle.js.map',
        'index.bundle.min.js',
        'index.bundle.min.js.map',
        'say/index.bundle.coverage.js',
        'say/index.bundle.js',
        'say/index.bundle.js.map',
        'say/index.bundle.min.js',
        'say/index.bundle.min.js.map',
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
    }

    // Verify the final results
    function onExit (err, stdout, stderr) {
      try {
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
      catch (error) {
        done(error);
      }
    }
  });

  it('should report JavaScript syntax errors', (done) => {
    done = doneOnce(done);

    // Run Watchify
    let watchify = cli.run('error/error.js --watch --outfile error/dist/error.js', onExit);

    // Wait for Watchify to finish building the code
    waitForWatchify()
      .then(() => {
        // Confirm that the code built correctly
        checkOutputFiles();

        // The output file should be empty, because of a syntax error
        assert.fileContents('error/dist/error.js', (contents) => {
          expect(contents).to.equal('');
        });

        // Modify a file, to trigger Watchify again
        return modifyFile('error/error.js', `
          console.log('no longer a syntax error');
        `);
      })
      .then(() => {
          // Wait for Watchify to finish re-building the code
          return waitForWatchify();
      })
      .then(() => {
        // Confirm that the same output files exist
        checkOutputFiles();

        // Confirm that the code built succesfully this time, since the syntax error is fixed
        assert.fileContents('error/dist/error.js', (contents) => {
          assert.noBanner(contents);
          assert.hasPreamble(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);

          // Confirm that the code DOES contain our modified code
          expect(contents).to.contain('no longer a syntax error');
        });
      })
      .catch(done)
      .then(() => {
        watchify.kill();
      });

    function checkOutputFiles () {
      // The output file should be created, even though an error occurred
      assert.directoryContents('error/dist', 'error.js');
    }

    // Verify the final results
    function onExit (err, stdout, stderr) {
      try {
        expect(stderr).to.equal('Error bundling error\/error.js\nUnexpected token');
        expect(stdout).to.contain('error/error.js has changed');
        expect(stdout).to.contain('error/error.js --> error/dist/error.js');
        done();
      }
      catch (error) {
        done(error);
      }
    }
  });

  it('should report TypeScript syntax errors', function (done) {
    done = doneOnce(done);

    // Increase timeouts to allow time for TypeScript transpiling
    mocha.increaseTimeout(this, this.timeout() * 4);

    // Run Watchify
    let watchify = cli.run('typescript-error/error.ts --watch --outfile typescript-error/dist/error.js', onExit);

    // Wait for Watchify to finish building the code
    waitForWatchify()
      .then(() => {
        // Confirm that the code built correctly
        checkOutputFiles();

        // Despite the TypeScript syntax error, the code is still transpiled to JavaScript
        assert.fileContents('typescript-error/dist/error.js', (contents) => {
          assert.noBanner(contents);
          assert.hasPreamble(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);

          // Confirm that the TypeScript code has been transpiled to JavaScript
          expect(contents).to.contain('function say(what, to) {');

          // Confirm that the code DOES NOT contain our modified code yet
          expect(contents).not.to.contain('no longer a syntax error');
        });

        // Modify a file, to trigger Watchify again.
        // This time, we'll introduce a JavaScript syntax error
        return modifyFile('typescript-error/error.ts', `
          function say(what: string, to: string): string {
            return what to;   // <--- missing quotes
          }
        `);
      })
      .then(() => {
          // Wait for Watchify to finish re-building the code
          return waitForWatchify();
      })
      .then(() => {
        // Confirm that the code built correctly
        checkOutputFiles();

        // The output file should be empty, because of a syntax error
        assert.fileContents('typescript-error/dist/error.js', (contents) => {
          expect(contents).to.equal('');
        });

        // Modify a file, to trigger Watchify again
        return modifyFile('typescript-error/error.ts', `
          function say(what: string, to: string): string {
            return "no longer a syntax error";
          }
        `);
      })
      .then(() => {
          // Wait for Watchify to finish re-building the code
          return waitForWatchify();
      })
      .then(() => {
        // Confirm that the same output files exist
        checkOutputFiles();

        // Confirm that the code built succesfully this time, since the syntax error is fixed
        assert.fileContents('typescript-error/dist/error.js', (contents) => {
          assert.noBanner(contents);
          assert.hasPreamble(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);

          // Confirm that the TypeScript code has been transpiled to JavaScript
          expect(contents).to.contain('function say(what, to) {');

          // Confirm that the code DOES contain our modified code
          expect(contents).to.contain('no longer a syntax error');
        });
      })
      .catch(done)
      .then(() => {
        watchify.kill();
      });

    function checkOutputFiles () {
      // The output file should be created, even though an error occurred
      assert.directoryContents('typescript-error/dist', 'error.js');
    }

    // Verify the final results
    function onExit (err, stdout, stderr) {
      try {
        expect(stderr).to.contain(
          'Error bundling typescript-error/error.ts\n' +
          'typescript-error/error.ts(3,28): ' +
          "Error TS7006: Parameter 'to' implicitly has an 'any' type.\n" +
          'Error bundling typescript-error/error.ts\n' +
          'typescript-error/error.ts(3,25): ' +
          "Error TS1005: ';' expected."
        );
        expect(stdout).to.contain('typescript-error/error.ts has changed');
        expect(stdout).to.contain('typescript-error/error.ts --> typescript-error/dist/error.js');
        done();
      }
      catch (error) {
        done(error);
      }
    }
  });

});
