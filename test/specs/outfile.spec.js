'use strict';

const cli = require('../fixtures/cli');
const assert = require('../fixtures/assert');
const expect = require('chai').expect;

describe('simplifyify --outfile', () => {
  it('should create a single output file, with the an explicit name', (done) => {
    cli.run('es5/lib/index.js --outfile es5/dist/my-file.js', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal('es5/lib/index.js --> es5/dist/my-file.js');

      assert.directoryContents('es5/dist', 'my-file.js');

      assert.fileContents('es5/dist/my-file.js', (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      done();
    });
  });

  it('should create a single output file, with the entry file name', (done) => {
    cli.run('es5/lib/index.js --outfile es5/dist', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal('es5/lib/index.js --> es5/dist/index.js');

      assert.directoryContents('es5/dist', 'index.js');

      assert.fileContents('es5/dist/index.js', (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      done();
    });
  });

  it('should create multiple output files, with the entry file names', (done) => {
    cli.run('es5/lib/**/index.js --outfile es5/dist', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
      expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.js');

      assert.directoryContents('es5/dist', [
        'index.js',
        'say/index.js'
      ]);

      assert.fileContents('es5/dist/index.js', (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      assert.fileContents('es5/dist/say/index.js', (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });

      done();
    });
  });

  it('should create a single output file, with a patterned file name', (done) => {
    cli.run('es5/lib/index.js --outfile es5/dist/*.foo-bar.es6', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal('es5/lib/index.js --> es5/dist/index.foo-bar.es6');

      assert.directoryContents('es5/dist', 'index.foo-bar.es6');

      assert.fileContents('es5/dist/index.foo-bar.es6', (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      done();
    });
  });

  describe('no --outfile specified', () => {
    it('should create a single output file, in the entry file directory', (done) => {
      cli.run('es5/lib/index.js', (err, stdout) => {
        if (err) {
          return done(err);
        }

        expect(stdout).to.equal('es5/lib/index.js --> es5/lib/index.bundle.js');

        let filesThatAlreadyExisted = ['hello-world.js', 'index.js', 'say/index.js'];
        assert.directoryContents('es5/lib',
          ['index.bundle.js'].concat(filesThatAlreadyExisted));

        assert.fileContents('es5/lib/index.bundle.js', (contents) => {
          assert.noBanner(contents);
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
        });
        done();
      });
    });

    it('should create multiple output files, in the entry file directories', (done) => {
      cli.run('es5/lib/**/*.js --bundle --debug --minify --coverage', (err, stdout) => {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/lib/index.bundle.js');
        expect(stdout).to.contain('es5/lib/index.js --> es5/lib/index.bundle.js.map');
        expect(stdout).to.contain('es5/lib/index.js --> es5/lib/index.bundle.min.js');
        expect(stdout).to.contain('es5/lib/index.js --> es5/lib/index.bundle.min.js.map');
        expect(stdout).to.contain('es5/lib/index.js --> es5/lib/index.bundle.coverage.js');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/lib/hello-world.bundle.js');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/lib/hello-world.bundle.js.map');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/lib/hello-world.bundle.min.js');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/lib/hello-world.bundle.min.js.map');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/lib/hello-world.bundle.coverage.js');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/lib/say/index.bundle.js');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/lib/say/index.bundle.js.map');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/lib/say/index.bundle.min.js');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/lib/say/index.bundle.min.js.map');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/lib/say/index.bundle.coverage.js');

        let filesThatAlreadyExisted = ['hello-world.js', 'index.js', 'say/index.js'];
        assert.directoryContents('es5/lib', [
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
        ].concat(filesThatAlreadyExisted)
        );

        assert.fileContents('es5/lib', [
          'index.bundle.js', 'hello-world.bundle.js', 'say/index.bundle.js'
        ],
        function (contents) {
          assert.noBanner(contents);
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        }
        );
        assert.fileContents('es5/lib', [
          'index.bundle.min.js', 'hello-world.bundle.min.js', 'say/index.bundle.min.js'
        ],
        function (contents) {
          assert.noBanner(contents);
          assert.hasMinifiedPreamble(contents);
          assert.isMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        }
        );
        assert.fileContents('es5/lib', [
          'index.bundle.coverage.js', 'hello-world.bundle.coverage.js', 'say/index.bundle.coverage.js'
        ],
        function (contents) {
          assert.noBanner(contents);
          assert.hasMinifiedPreamble(contents);
          assert.isMinified(contents, true);
          assert.noSourceMap(contents);
          assert.hasCoverage(contents);
        }
        );

        assert.fileContents('es5/lib', ['index.bundle.js.map', 'index.bundle.min.js.map'],
          function (contents) {
            expect(contents.sources).to.contain.members([
              'hello-world.js',
              'index.js',
              'say/index.js'
            ]);
          }
        );
        assert.fileContents('es5/lib', ['hello-world.bundle.js.map', 'hello-world.bundle.min.js.map'],
          function (contents) {
            expect(contents.sources).to.contain.members([
              'hello-world.js',
              'say/index.js'
            ]);
          }
        );
        assert.fileContents('es5/lib', ['say/index.bundle.js.map', 'say/index.bundle.min.js.map'],
          function (contents) {
            expect(contents.sources).to.contain.members([
              'index.js'
            ]);
          }
        );

        done();
      });
    });
  });

  it('should work with shorthand arguments', (done) => {
    cli.run('es5/lib/index.js -o es5/dist/my-file.js', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal('es5/lib/index.js --> es5/dist/my-file.js');

      assert.directoryContents('es5/dist', 'my-file.js');

      assert.fileContents('es5/dist/my-file.js', (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      done();
    });
  });
});
