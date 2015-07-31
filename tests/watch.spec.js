'use strict';

var helper = require('./helper'),
    expect = require('chai').expect,
    del    = require('del'),
    touch  = require('touch');

describe('simplifyify --watch', function() {
  it('should rebuild a single output file', function(done) {
    this.timeout(10000);

    // Run Watchify
    var watchify = helper.run('test-app/lib/index.js --watch --outfile test-app/dist/my-file.js', onExit);

    // Check the initial outputs after a few seconds
    setTimeout(firstCheck, 3000);

    function firstCheck() {
      checkOutputFiles();

      // Delete the output
      del('test-app/dist', function() {
        // Touch a file, to trigger Watchify again
        touch('test-app/lib/say/index.js');

        // Check the outputs again after a few seconds
        setTimeout(secondCheck, 3000);
      });
    }

    function secondCheck() {
      checkOutputFiles();
      watchify.kill();
    }

    // Verify the final results
    function onExit(err, stdout, stderr) {
      expect(stderr).to.be.empty;
      expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/my-file.js');
      expect(stdout).to.contain('\ntest-app/lib/say/index.js has changed');
      checkOutputFiles();
      done();
    }

    function checkOutputFiles() {
      helper.assert.filesWereCreated(['my-file.js']);

      helper.fileContents('my-file.js', function(contents) {
        helper.assert.hasPreamble(contents);
        helper.assert.notMinified(contents);
        helper.assert.noSourceMap(contents);
        helper.assert.noCoverage(contents);
      });
    }
  });

  it('should rebuild multiple output files', function(done) {
    this.timeout(10000);

    // Run Watchify
    // jscs:disable maximumLineLength
    var watchify = helper.run(
      'test-app/lib/**/*.js --watch --debug --minify --test --standalone Fizz.Buzz --outfile test-app/dist/*.bundle.js',
      onExit
    );
    // jscs:enable maximumLineLength

    // Check the initial outputs after a few seconds
    setTimeout(firstCheck, 3000);

    function firstCheck() {
      helper.assert.filesWereCreated([
        'index.bundle.js',
        'index.bundle.js.map',
        'index.bundle.min.js',
        'index.bundle.min.js.map',
        'index.bundle.test.js',
        'hello-world.bundle.js',
        'hello-world.bundle.js.map',
        'hello-world.bundle.min.js',
        'hello-world.bundle.min.js.map',
        'hello-world.bundle.test.js',
        'say/index.bundle.js',
        'say/index.bundle.js.map',
        'say/index.bundle.min.js',
        'say/index.bundle.min.js.map',
        'say/index.bundle.test.js'
      ]);

      helper.fileContents(['index.bundle.js', 'hello-world.bundle.js', 'say/index.bundle.js'],
        function(contents) {
          helper.assert.hasUmdPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.hasSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
      helper.fileContents(['index.bundle.min.js', 'hello-world.bundle.min.js', 'say/index.bundle.min.js'],
        function(contents) {
          helper.assert.hasUmdPreamble(contents);
          helper.assert.isMinified(contents);
          helper.assert.hasSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
      helper.fileContents(['index.bundle.test.js', 'hello-world.bundle.test.js', 'say/index.bundle.test.js'],
        function(contents) {
          helper.assert.hasUmdPreamble(contents);
          helper.assert.isMinified(contents, true);
          helper.assert.noSourceMap(contents);
          helper.assert.hasCoverage(contents);
        });

      helper.fileContents(['index.bundle.js.map', 'index.bundle.min.js.map'], function(contents) {
        expect(contents.sources).to.contain.members([
          '../lib/hello-world.js',
          '../lib/index.js',
          '../lib/say/index.js'
        ]);
      });
      helper.fileContents(['hello-world.bundle.js.map', 'hello-world.bundle.min.js.map'], function(contents) {
        expect(contents.sources).to.contain.members([
          '../lib/hello-world.js',
          '../lib/say/index.js'
        ]);
      });
      helper.fileContents(['say/index.bundle.js.map', 'say/index.bundle.min.js.map'], function(contents) {
        expect(contents.sources).to.contain.members([
          '../../lib/say/index.js'
        ]);
      });

      // Delete the output
      del('test-app/dist', function() {
        // Touch a file, to trigger Watchify again
        // NOTE: Only two of the three entry files will be re-build, since the third doesn't reference this file
        touch('test-app/lib/hello-world.js');

        // Check the outputs again after a few seconds
        setTimeout(secondCheck, 3000);
      });
    }

    function secondCheck() {
      helper.assert.filesWereCreated([
        'index.bundle.js',
        'index.bundle.js.map',
        'index.bundle.min.js',
        'index.bundle.min.js.map',
        'index.bundle.test.js',
        'hello-world.bundle.js',
        'hello-world.bundle.js.map',
        'hello-world.bundle.min.js',
        'hello-world.bundle.min.js.map',
        'hello-world.bundle.test.js'
      ]);

      helper.fileContents(['index.bundle.js', 'hello-world.bundle.js'],
        function(contents) {
          helper.assert.hasUmdPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.hasSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
      helper.fileContents(['index.bundle.min.js', 'hello-world.bundle.min.js'],
        function(contents) {
          helper.assert.hasUmdPreamble(contents);
          helper.assert.isMinified(contents);
          helper.assert.hasSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
      helper.fileContents(['index.bundle.test.js', 'hello-world.bundle.test.js'],
        function(contents) {
          helper.assert.hasUmdPreamble(contents);
          helper.assert.isMinified(contents, true);
          helper.assert.noSourceMap(contents);
          helper.assert.hasCoverage(contents);
        });

      helper.fileContents(['index.bundle.js.map', 'index.bundle.min.js.map'], function(contents) {
        expect(contents.sources).to.contain.members([
          '../lib/hello-world.js',
          '../lib/index.js',
          '../lib/say/index.js'
        ]);
      });
      helper.fileContents(['hello-world.bundle.js.map', 'hello-world.bundle.min.js.map'], function(contents) {
        expect(contents.sources).to.contain.members([
          '../lib/hello-world.js',
          '../lib/say/index.js'
        ]);
      });

      watchify.kill();
    }

    // Verify the final results
    function onExit(err, stdout, stderr) {
      expect(stderr).to.be.empty;

      expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.bundle.js');
      expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.bundle.js.map');
      expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.bundle.min.js');
      expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.bundle.min.js.map');
      expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.bundle.test.js');
      expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.bundle.js');
      expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.bundle.js.map');
      expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.bundle.min.js');
      expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.bundle.min.js.map');
      expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.bundle.test.js');
      expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.bundle.js');
      expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.bundle.js.map');
      expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.bundle.min.js');
      expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.bundle.min.js.map');
      expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.bundle.test.js');

      expect(stdout).to.contain('\ntest-app/lib/hello-world.js has changed');
      done();
    }
  });
});
