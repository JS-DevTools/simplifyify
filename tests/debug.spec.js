'use strict';

var helper = require('./helper'),
    expect = require('chai').expect;

describe('simplifyify --debug', function() {
  it('should create source map for a single file', function(done) {
    helper.run('test-app/lib/index.js --debug --outfile test-app/dist/index.js',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js.map');

        helper.assert.filesWereCreated([
          'index.js',
          'index.js.map'
        ]);

        helper.fileContents('index.js', function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.hasSourceMap(contents);
          helper.assert.noCoverage(contents);
        });

        helper.fileContents('index.js.map', function(contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/index.js',
            '../lib/say/index.js'
          ]);
        });
        done();
      });
  });

  it('should create source maps for multiple files', function(done) {
    helper.run('"test-app/lib/**/*.js" --debug --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js.map');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.js');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.js.map');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.js.map');

        helper.assert.filesWereCreated([
          'index.js',
          'index.js.map',
          'hello-world.js',
          'hello-world.js.map',
          'say/index.js',
          'say/index.js.map'
        ]);

        helper.fileContents(['index.js', 'hello-world.js', 'say/index.js'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.hasSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        helper.fileContents('index.js.map', function(contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/index.js',
            '../lib/say/index.js'
          ]);
        });
        helper.fileContents('hello-world.js.map', function(contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/say/index.js'
          ]);
        });
        helper.fileContents('say/index.js.map', function(contents) {
          expect(contents.sources).to.contain.members([
            '../../lib/say/index.js'
          ]);
        });
        done();
      });
  });

  it('should create source maps for multiple minified files', function(done) {
    helper.run('"test-app/lib/**/index.js" --debug --minify --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js.map');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.min.js');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.min.js.map');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.js.map');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.min.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.min.js.map');

        helper.assert.filesWereCreated([
          'index.js',
          'index.js.map',
          'index.min.js',
          'index.min.js.map',
          'say/index.js',
          'say/index.js.map',
          'say/index.min.js',
          'say/index.min.js.map'
        ]);

        helper.fileContents(['index.js', 'say/index.js'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.hasSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        helper.fileContents(['index.min.js', 'say/index.min.js'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.isMinified(contents);
          helper.assert.hasSourceMap(contents);
          helper.assert.noCoverage(contents);
        });

        helper.fileContents(['index.js.map', 'index.min.js.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/index.js',
            '../lib/say/index.js'
          ]);
        });
        helper.fileContents(['say/index.js.map', 'say/index.min.js.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../../lib/say/index.js'
          ]);
        });
        done();
      });
  });

  it('should append ".map" when renaming output files', function(done) {
    helper.run('"test-app/lib/**/*.js" --debug --minify --outfile test-app/dist/*.bundle.es',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.bundle.es');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.bundle.es.map');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.bundle.min.es');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.bundle.min.es.map');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.bundle.es');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.bundle.es.map');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.bundle.min.es');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.bundle.min.es.map');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.bundle.es');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.bundle.es.map');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.bundle.min.es');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.bundle.min.es.map');

        helper.assert.filesWereCreated([
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

        helper.fileContents(['index.bundle.es', 'hello-world.bundle.es', 'say/index.bundle.es'],
          function(contents) {
            helper.assert.hasPreamble(contents);
            helper.assert.notMinified(contents);
            helper.assert.hasSourceMap(contents);
            helper.assert.noCoverage(contents);
          });
        helper.fileContents(['index.bundle.min.es', 'hello-world.bundle.min.es', 'say/index.bundle.min.es'],
          function(contents) {
            helper.assert.hasPreamble(contents);
            helper.assert.isMinified(contents);
            helper.assert.hasSourceMap(contents);
            helper.assert.noCoverage(contents);
          });

        helper.fileContents(['index.bundle.es.map', 'index.bundle.min.es.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/index.js',
            '../lib/say/index.js'
          ]);
        });
        helper.fileContents(['hello-world.bundle.es.map', 'hello-world.bundle.min.es.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/say/index.js'
          ]);
        });
        helper.fileContents(['say/index.bundle.es.map', 'say/index.bundle.min.es.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../../lib/say/index.js'
          ]);
        });
        done();
      });
  });
});
