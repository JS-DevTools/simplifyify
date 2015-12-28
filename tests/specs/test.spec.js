'use strict';

var cli    = require('../fixtures/cli'),
    assert = require('../fixtures/assert'),
    expect = require('chai').expect;

describe('simplifyify --test', function() {
  it('should add code-coverage to a single file', function(done) {
    cli.run('es5/lib/index.js --test --outfile es5/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');

        assert.directoryContents('es5/dist', 'index.js');

        assert.fileContents('es5/dist/index.js', function(contents) {
          assert.hasPreamble(contents);
          assert.isMinified(contents, true);
          assert.noSourceMap(contents);
          assert.hasCoverage(contents);
        });
        done();
      });
  });

  it('should create a code-coverage and normal file', function(done) {
    cli.run('es5/lib/index.js --bundle --test --outfile es5/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.test.js');

        assert.directoryContents('es5/dist', [
          'index.js',
          'index.test.js'
        ]);

        assert.fileContents('es5/dist/index.js', function(contents) {
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
        });
        assert.fileContents('es5/dist/index.test.js', function(contents) {
          assert.hasPreamble(contents);
          assert.isMinified(contents, true);
          assert.noSourceMap(contents);
          assert.hasCoverage(contents);
        });
        done();
      });
  });

  it('should add code-coverage to multiple files', function(done) {
    cli.run('es5/lib/**/index.js --test --outfile es5/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.js');

        assert.directoryContents('es5/dist', [
          'index.js',
          'say/index.js',
        ]);

        assert.fileContents('es5/dist', ['index.js', 'say/index.js'], function(contents) {
          assert.hasPreamble(contents);
          assert.isMinified(contents, true);
          assert.noSourceMap(contents);
          assert.hasCoverage(contents);
        });
        done();
      });
  });

  it('should NOT create a ".map" file for test bundles, even if --debug is set', function(done) {
    cli.run('es5/lib/**/*.js --test --debug --outfile es5/dist/*.foo.es5',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.foo.es5');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.foo.es5');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.foo.es5');

        assert.directoryContents('es5/dist', [
          'index.foo.es5',
          'hello-world.foo.es5',
          'say/index.foo.es5',
        ]);

        assert.fileContents('es5/dist', ['index.foo.es5', 'hello-world.foo.es5', 'say/index.foo.es5'], function(contents) {
            assert.hasPreamble(contents);
            assert.isMinified(contents, true);
            assert.noSourceMap(contents);
            assert.hasCoverage(contents);
          });

        done();
      });
  });

  it('should NOT append ".test" when renaming output files', function(done) {
    cli.run('es5/lib/**/*.js --test --outfile es5/dist/*.foo.es5',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.foo.es5');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.foo.es5');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.foo.es5');

        assert.directoryContents('es5/dist', [
          'index.foo.es5',
          'hello-world.foo.es5',
          'say/index.foo.es5',
        ]);

        assert.fileContents('es5/dist', ['index.foo.es5', 'hello-world.foo.es5', 'say/index.foo.es5'], function(contents) {
            assert.hasPreamble(contents);
            assert.isMinified(contents, true);
            assert.noSourceMap(contents);
            assert.hasCoverage(contents);
          });

        done();
      });
  });

  it('should append ".test" when renaming output files and producing multiple bundles', function(done) {
    cli.run('es5/lib/**/*.js --test --bundle --minify --debug --outfile es5/dist/*.foo.es5',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.foo.es5');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.foo.es5.map');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.foo.min.es5');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.foo.min.es5.map');
        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.foo.test.es5');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.foo.es5');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.foo.es5.map');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.foo.min.es5');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.foo.min.es5.map');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.foo.test.es5');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.foo.es5');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.foo.es5.map');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.foo.min.es5');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.foo.min.es5.map');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.foo.test.es5');

        assert.directoryContents('es5/dist', [
          'index.foo.es5',
          'index.foo.es5.map',
          'index.foo.min.es5',
          'index.foo.min.es5.map',
          'index.foo.test.es5',
          'hello-world.foo.es5',
          'hello-world.foo.es5.map',
          'hello-world.foo.min.es5',
          'hello-world.foo.min.es5.map',
          'hello-world.foo.test.es5',
          'say/index.foo.es5',
          'say/index.foo.es5.map',
          'say/index.foo.min.es5',
          'say/index.foo.min.es5.map',
          'say/index.foo.test.es5'
        ]);

        assert.fileContents('es5/dist', ['index.foo.es5', 'hello-world.foo.es5', 'say/index.foo.es5'], function(contents) {
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });
        assert.fileContents('es5/dist', ['index.foo.min.es5', 'hello-world.foo.min.es5', 'say/index.foo.min.es5'],
          function(contents) {
            assert.hasPreamble(contents);
            assert.isMinified(contents);
            assert.hasSourceMap(contents);
            assert.noCoverage(contents);
          });
        assert.fileContents('es5/dist', ['index.foo.test.es5', 'hello-world.foo.test.es5', 'say/index.foo.test.es5'],
          function(contents) {
            assert.hasPreamble(contents);
            assert.isMinified(contents, true);
            assert.noSourceMap(contents);
            assert.hasCoverage(contents);
          });

        assert.fileContents('es5/dist', ['index.foo.es5.map', 'index.foo.min.es5.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/index.js',
            '../lib/say/index.js'
          ]);
        });
        assert.fileContents('es5/dist', ['hello-world.foo.es5.map', 'hello-world.foo.min.es5.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/say/index.js'
          ]);
        });
        assert.fileContents('es5/dist', ['say/index.foo.es5.map', 'say/index.foo.min.es5.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../../lib/say/index.js'
          ]);
        });
        done();
      });
  });
});
