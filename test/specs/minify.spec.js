'use strict';

const cli = require('../fixtures/cli');
const assert = require('../fixtures/assert');
const expect = require('chai').expect;

describe('simplifyify --minify', () => {
  it('should minify a single file', (done) => {
    cli.run('es5/lib/index.js --minify --outfile es5/dist/', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');

      assert.directoryContents('es5/dist', 'index.js');

      assert.fileContents('es5/dist/index.js', (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      done();
    });
  });

  it('should create a minified and non-minified file', (done) => {
    cli.run('es5/lib/index.js --bundle --minify --outfile es5/dist/', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.min.js');

      assert.directoryContents('es5/dist', [
        'index.js',
        'index.min.js'
      ]);

      assert.fileContents('es5/dist/index.js', (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      assert.fileContents('es5/dist/index.min.js', (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      done();
    });
  });

  it('should minify multiple files', (done) => {
    cli.run('es5/lib/**/index.js --minify --outfile es5/dist/', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
      expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.js');

      assert.directoryContents('es5/dist', [
        'index.js',
        'say/index.js',
      ]);

      assert.fileContents('es5/dist', ['index.js', 'say/index.js'], (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      done();
    });
  });

  it('should NOT append ".min" when renaming output files', (done) => {
    cli.run('es5/lib/**/*.js --minify --outfile es5/dist/*.foo.es5', (err, stdout) => {
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

      assert.fileContents('es5/dist', ['index.foo.es5', 'hello-world.foo.es5', 'say/index.foo.es5'], (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      done();
    });
  });

  it('should append ".min" when renaming output files and producing multiple bundles', (done) => {
    cli.run('es5/lib/**/*.js --bundle --minify --outfile es5/dist/*.foo.es5', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.foo.es5');
      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.foo.min.es5');
      expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.foo.es5');
      expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.foo.min.es5');
      expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.foo.es5');
      expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.foo.min.es5');

      assert.directoryContents('es5/dist', [
        'index.foo.es5',
        'index.foo.min.es5',
        'hello-world.foo.es5',
        'hello-world.foo.min.es5',
        'say/index.foo.es5',
        'say/index.foo.min.es5'
      ]);

      assert.fileContents('es5/dist', ['index.foo.es5', 'hello-world.foo.es5', 'say/index.foo.es5'], (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      assert.fileContents('es5/dist', ['index.foo.min.es5', 'hello-world.foo.min.es5', 'say/index.foo.min.es5'],
        function (contents) {
          assert.noBanner(contents);
          assert.hasMinifiedPreamble(contents);
          assert.isMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
        });
      done();
    });
  });

  it('should create a minified bundle with a banner', (done) => {
    cli.run('hello/index.js --minify --outfile hello/dist/', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain('hello/index.js --> hello/dist/index.js');

      assert.directoryContents('hello', [
        'banner.txt',
        'hello-world.js',
        'index.js',
        'package.json',
        'say/index.js',
        'dist/index.js',
      ]);

      assert.fileContents('hello/dist/index.js', (contents) => {
        assert.hasBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      done();
    });
  });
});
