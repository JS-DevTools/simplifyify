'use strict';

const cli = require('../fixtures/cli');
const assert = require('../fixtures/assert');
const expect = require('chai').expect;

describe('simplifyify --test', () => {
  it('should add code-coverage to a single file', (done) => {
    cli.run('es5/lib/index.js --test --outfile es5/dist/', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');

      assert.directoryContents('es5/dist', 'index.js');

      assert.fileContents('es5/dist/index.js', (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
      });
      done();
    });
  });

  it('should create a code-coverage and normal file', (done) => {
    cli.run('es5/lib/index.js --bundle --test --outfile es5/dist/', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
      expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.test.js');

      assert.directoryContents('es5/dist', [
        'index.js',
        'index.test.js'
      ]);

      assert.fileContents('es5/dist/index.js', (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.noCoverage(contents);
      });
      assert.fileContents('es5/dist/index.test.js', (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
      });
      done();
    });
  });

  it('should add code-coverage to multiple files', (done) => {
    cli.run('es5/lib/**/index.js --test --outfile es5/dist/', (err, stdout) => {
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
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
      });
      done();
    });
  });

  it('should NOT create a ".map" file for test bundles, even if --debug is set', (done) => {
    cli.run('es5/lib/**/*.js --test --debug --outfile es5/dist/*.foo.es5', (err, stdout) => {
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
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
      });

      done();
    });
  });

  it('should NOT append ".test" when renaming output files', (done) => {
    cli.run('es5/lib/**/*.js --test --outfile es5/dist/*.foo.es5', (err, stdout) => {
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
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
      });

      done();
    });
  });

  it('should append ".test" when renaming output files and producing multiple bundles', (done) => {
    cli.run('es5/lib/**/*.js --test --bundle --minify --debug --outfile es5/dist/*.foo.es5', (err, stdout) => {
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

      assert.fileContents('es5/dist', ['index.foo.es5', 'hello-world.foo.es5', 'say/index.foo.es5'], (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
      });
      assert.fileContents('es5/dist', ['index.foo.min.es5', 'hello-world.foo.min.es5', 'say/index.foo.min.es5'],
        function (contents) {
          assert.noBanner(contents);
          assert.hasMinifiedPreamble(contents);
          assert.isMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });
      assert.fileContents('es5/dist', ['index.foo.test.es5', 'hello-world.foo.test.es5', 'say/index.foo.test.es5'],
        function (contents) {
          assert.noBanner(contents);
          assert.hasMinifiedPreamble(contents);
          assert.isMinified(contents, true);
          assert.noSourceMap(contents);
          assert.hasCoverage(contents);
        });

      assert.fileContents('es5/dist', ['index.foo.es5.map', 'index.foo.min.es5.map'], (contents) => {
        expect(contents.sources).to.contain.members([
          '../lib/hello-world.js',
          '../lib/index.js',
          '../lib/say/index.js'
        ]);
      });
      assert.fileContents('es5/dist', ['hello-world.foo.es5.map', 'hello-world.foo.min.es5.map'], (contents) => {
        expect(contents.sources).to.contain.members([
          '../lib/hello-world.js',
          '../lib/say/index.js'
        ]);
      });
      assert.fileContents('es5/dist', ['say/index.foo.es5.map', 'say/index.foo.min.es5.map'], (contents) => {
        expect(contents.sources).to.contain.members([
          '../../lib/say/index.js'
        ]);
      });
      done();
    });
  });

  it('should create a test bundle with a banner', (done) => {
    cli.run('hello/index.js --test --outfile hello/dist/', (err, stdout) => {
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
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
      });
      done();
    });
  });
});
