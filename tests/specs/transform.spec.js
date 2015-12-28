'use strict';

var cli    = require('../fixtures/cli'),
    assert = require('../fixtures/assert'),
    expect = require('chai').expect;

describe('browserify transforms', function() {
  it('should use the browserify.transform field in package.json', function(done) {
    cli.run('transform/src/**/*.js --bundle --minify --debug --test --outfile transform/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('transform/src/index.js --> transform/dist/index.js');
        expect(stdout).to.contain('transform/src/index.js --> transform/dist/index.js.map');
        expect(stdout).to.contain('transform/src/index.js --> transform/dist/index.min.js');
        expect(stdout).to.contain('transform/src/index.js --> transform/dist/index.min.js.map');
        expect(stdout).to.contain('transform/src/index.js --> transform/dist/index.test.js');
        expect(stdout).to.contain('transform/src/hello-world.js --> transform/dist/hello-world.js');
        expect(stdout).to.contain('transform/src/hello-world.js --> transform/dist/hello-world.js.map');
        expect(stdout).to.contain('transform/src/hello-world.js --> transform/dist/hello-world.min.js');
        expect(stdout).to.contain('transform/src/hello-world.js --> transform/dist/hello-world.min.js.map');
        expect(stdout).to.contain('transform/src/hello-world.js --> transform/dist/hello-world.test.js');
        expect(stdout).to.contain('transform/src/say/index.js --> transform/dist/say/index.js');
        expect(stdout).to.contain('transform/src/say/index.js --> transform/dist/say/index.js.map');
        expect(stdout).to.contain('transform/src/say/index.js --> transform/dist/say/index.min.js');
        expect(stdout).to.contain('transform/src/say/index.js --> transform/dist/say/index.min.js.map');
        expect(stdout).to.contain('transform/src/say/index.js --> transform/dist/say/index.test.js');

        assert.directoryContents('transform/dist', [
          'index.js',
          'index.js.map',
          'index.min.js',
          'index.min.js.map',
          'index.test.js',
          'hello-world.js',
          'hello-world.js.map',
          'hello-world.min.js',
          'hello-world.min.js.map',
          'hello-world.test.js',
          'say/index.js',
          'say/index.js.map',
          'say/index.min.js',
          'say/index.min.js.map',
          'say/index.test.js',
        ]);

        assert.fileContents('transform/dist', ['index.js', 'hello-world.js', 'say/index.js'], function(contents) {
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
          assert.isBabelified(contents);
        });

        assert.fileContents('transform/dist', ['index.min.js', 'hello-world.min.js', 'say/index.min.js'], function(contents) {
          assert.hasPreamble(contents);
          assert.isMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
          assert.isBabelified(contents);
        });

        assert.fileContents('transform/dist', ['index.test.js', 'hello-world.test.js', 'say/index.test.js'], function(contents) {
          assert.hasPreamble(contents);
          assert.isMinified(contents, true);
          assert.noSourceMap(contents);
          assert.hasCoverage(contents);
          assert.isBabelified(contents);
        });

        assert.fileContents('transform/dist', ['index.js.map', 'index.min.js.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../src/hello-world.js',
            '../src/index.js',
            '../src/say/index.js'
          ]);
        });

        assert.fileContents('transform/dist', ['hello-world.js.map', 'hello-world.min.js.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../src/hello-world.js',
            '../src/say/index.js'
          ]);
        });

        assert.fileContents('transform/dist/say', ['index.js.map', 'index.min.js.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../../src/say/index.js'
          ]);
        });

        done();
      });
  });

  it('should use the transform options in the browserify.transform field', function(done) {
    cli.run('transform-with-options/src/**/*.js --bundle --minify --debug --test --outfile transform-with-options/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('transform-with-options/src/index.js --> transform-with-options/dist/index.js');
        expect(stdout).to.contain('transform-with-options/src/index.js --> transform-with-options/dist/index.js.map');
        expect(stdout).to.contain('transform-with-options/src/index.js --> transform-with-options/dist/index.min.js');
        expect(stdout).to.contain('transform-with-options/src/index.js --> transform-with-options/dist/index.min.js.map');
        expect(stdout).to.contain('transform-with-options/src/index.js --> transform-with-options/dist/index.test.js');
        expect(stdout).to.contain('transform-with-options/src/hello-world.js --> transform-with-options/dist/hello-world.js');
        expect(stdout).to.contain('transform-with-options/src/hello-world.js --> transform-with-options/dist/hello-world.js.map');
        expect(stdout).to.contain('transform-with-options/src/hello-world.js --> transform-with-options/dist/hello-world.min.js');
        expect(stdout).to.contain('transform-with-options/src/hello-world.js --> transform-with-options/dist/hello-world.min.js.map');
        expect(stdout).to.contain('transform-with-options/src/hello-world.js --> transform-with-options/dist/hello-world.test.js');
        expect(stdout).to.contain('transform-with-options/src/say/index.js --> transform-with-options/dist/say/index.js');
        expect(stdout).to.contain('transform-with-options/src/say/index.js --> transform-with-options/dist/say/index.js.map');
        expect(stdout).to.contain('transform-with-options/src/say/index.js --> transform-with-options/dist/say/index.min.js');
        expect(stdout).to.contain('transform-with-options/src/say/index.js --> transform-with-options/dist/say/index.min.js.map');
        expect(stdout).to.contain('transform-with-options/src/say/index.js --> transform-with-options/dist/say/index.test.js');

        assert.directoryContents('transform-with-options/dist', [
          'index.js',
          'index.js.map',
          'index.min.js',
          'index.min.js.map',
          'index.test.js',
          'hello-world.js',
          'hello-world.js.map',
          'hello-world.min.js',
          'hello-world.min.js.map',
          'hello-world.test.js',
          'say/index.js',
          'say/index.js.map',
          'say/index.min.js',
          'say/index.min.js.map',
          'say/index.test.js',
        ]);

        assert.fileContents('transform-with-options/dist', ['index.js', 'hello-world.js', 'say/index.js'], function(contents) {
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
          assert.isBabelified(contents);
        });

        assert.fileContents('transform-with-options/dist', ['index.min.js', 'hello-world.min.js', 'say/index.min.js'], function(contents) {
          assert.hasPreamble(contents);
          assert.isMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
          assert.isBabelified(contents);
        });

        assert.fileContents('transform-with-options/dist', ['index.test.js', 'hello-world.test.js', 'say/index.test.js'], function(contents) {
          assert.hasPreamble(contents);
          assert.isMinified(contents, true);
          assert.noSourceMap(contents);
          assert.hasCoverage(contents);
          assert.isBabelified(contents);
        });

        assert.fileContents('transform-with-options/dist', ['index.js.map', 'index.min.js.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../src/hello-world.js',
            '../src/index.js',
            '../src/say/index.js'
          ]);
        });

        assert.fileContents('transform-with-options/dist', ['hello-world.js.map', 'hello-world.min.js.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../src/hello-world.js',
            '../src/say/index.js'
          ]);
        });

        assert.fileContents('transform-with-options/dist/say', ['index.js.map', 'index.min.js.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../../src/say/index.js'
          ]);
        });

        done();
      });
  });
});
