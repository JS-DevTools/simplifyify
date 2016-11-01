'use strict';

const cli = require('../fixtures/cli');
const assert = require('../fixtures/assert');
const expect = require('chai').expect;

describe('simplifyify --debug', function () {
  it('should create source map for a single file', function (done) {
    cli.run('es5/lib/index.js --debug --outfile es5/dist/index.js',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js.map');

        assert.directoryContents('es5/dist', [
          'index.js',
          'index.js.map'
        ]);

        assert.fileContents('es5/dist/index.js', function (contents) {
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });

        assert.fileContents('es5/dist/index.js.map', function (contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/index.js',
            '../lib/say/index.js'
          ]);
        });
        done();
      });
  });

  it('should create source maps for multiple files', function (done) {
    cli.run('es5/lib/**/*.js --debug --outfile es5/dist/',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js.map');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.js');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.js.map');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.js');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.js.map');

        assert.directoryContents('es5/dist', [
          'index.js',
          'index.js.map',
          'hello-world.js',
          'hello-world.js.map',
          'say/index.js',
          'say/index.js.map'
        ]);

        assert.fileContents('es5/dist', ['index.js', 'hello-world.js', 'say/index.js'], function (contents) {
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });
        assert.fileContents('es5/dist/index.js.map', function (contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/index.js',
            '../lib/say/index.js'
          ]);
        });
        assert.fileContents('es5/dist/hello-world.js.map', function (contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/say/index.js'
          ]);
        });
        assert.fileContents('es5/dist/say/index.js.map', function (contents) {
          expect(contents.sources).to.contain.members([
            '../../lib/say/index.js'
          ]);
        });
        done();
      });
  });

  it('should create source maps for multiple minified files', function (done) {
    cli.run('es5/lib/**/index.js --bundle --debug --minify --outfile es5/dist/',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js.map');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.min.js');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.min.js.map');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.js');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.js.map');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.min.js');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.min.js.map');

        assert.directoryContents('es5/dist', [
          'index.js',
          'index.js.map',
          'index.min.js',
          'index.min.js.map',
          'say/index.js',
          'say/index.js.map',
          'say/index.min.js',
          'say/index.min.js.map'
        ]);

        assert.fileContents('es5/dist', ['index.js', 'say/index.js'], function (contents) {
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });
        assert.fileContents('es5/dist', ['index.min.js', 'say/index.min.js'], function (contents) {
          assert.hasPreamble(contents);
          assert.isMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });

        assert.fileContents('es5/dist', ['index.js.map', 'index.min.js.map'], function (contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/index.js',
            '../lib/say/index.js'
          ]);
        });
        assert.fileContents('es5/dist', ['say/index.js.map', 'say/index.min.js.map'], function (contents) {
          expect(contents.sources).to.contain.members([
            '../../lib/say/index.js'
          ]);
        });
        done();
      });
  });

  it('should append ".map" when renaming output files', function (done) {
    cli.run('es5/lib/**/*.js --bundle --debug --minify --outfile es5/dist/*.bundle.es',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.bundle.es');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.bundle.es.map');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.bundle.min.es');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.bundle.min.es.map');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.bundle.es');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.bundle.es.map');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.bundle.min.es');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.bundle.min.es.map');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.bundle.es');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.bundle.es.map');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.bundle.min.es');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.bundle.min.es.map');

        assert.directoryContents('es5/dist', [
          'index.bundle.es',
          'index.bundle.es.map',
          'index.bundle.min.es',
          'index.bundle.min.es.map',
          'hello-world.bundle.es',
          'hello-world.bundle.es.map',
          'hello-world.bundle.min.es',
          'hello-world.bundle.min.es.map',
          'say/index.bundle.es',
          'say/index.bundle.es.map',
          'say/index.bundle.min.es',
          'say/index.bundle.min.es.map'
        ]);

        assert.fileContents('es5/dist', ['index.bundle.es', 'hello-world.bundle.es', 'say/index.bundle.es'],
          function (contents) {
            assert.hasPreamble(contents);
            assert.notMinified(contents);
            assert.hasSourceMap(contents);
            assert.noCoverage(contents);
          });
        assert.fileContents('es5/dist', ['index.bundle.min.es', 'hello-world.bundle.min.es', 'say/index.bundle.min.es'],
          function (contents) {
            assert.hasPreamble(contents);
            assert.isMinified(contents);
            assert.hasSourceMap(contents);
            assert.noCoverage(contents);
          });

        assert.fileContents('es5/dist', ['index.bundle.es.map', 'index.bundle.min.es.map'], function (contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/index.js',
            '../lib/say/index.js'
          ]);
        });
        assert.fileContents('es5/dist', ['hello-world.bundle.es.map', 'hello-world.bundle.min.es.map'], function (contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/say/index.js'
          ]);
        });
        assert.fileContents('es5/dist', ['say/index.bundle.es.map', 'say/index.bundle.min.es.map'], function (contents) {
          expect(contents.sources).to.contain.members([
            '../../lib/say/index.js'
          ]);
        });
        done();
      });
  });
});
