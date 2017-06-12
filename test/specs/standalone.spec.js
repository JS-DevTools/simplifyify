'use strict';

const cli = require('../fixtures/cli');
const assert = require('../fixtures/assert');
const expect = require('chai').expect;

describe('simplifyify --standalone', function () {
  it('should create a UMD module with the given name', function (done) {
    cli.run('es5/lib/index.js --standalone FizzBuzz --outfile es5/dist/',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.equal('es5/lib/index.js --> es5/dist/index.js');

        assert.directoryContents('es5/dist', 'index.js');

        assert.fileContents('es5/dist/index.js', function (contents) {
          assert.noBanner(contents);
          assert.hasUmdPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
          expect(contents).to.match(/\.FizzBuzz = /);
        });
        done();
      });
  });

  it('should create a UMD module with a namespaced name', function (done) {
    cli.run('es5/lib/index.js --standalone Fizz.Buzz --outfile es5/dist/',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.equal('es5/lib/index.js --> es5/dist/index.js');

        assert.directoryContents('es5/dist', 'index.js');

        assert.fileContents('es5/dist/index.js', function (contents) {
          assert.noBanner(contents);
          assert.hasUmdPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
          expect(contents).to.match(/\.Fizz = /);
          expect(contents).to.match(/\.Buzz = /);
        });
        done();
      });
  });

  it('should create a UMD bundle with a banner', function (done) {
    cli.run('hello/index.js --standalone Fizz.Buzz --outfile hello/dist/',
      function (err, stdout) {
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

        assert.fileContents('hello/dist/index.js', function (contents) {
          assert.hasBanner(contents);
          assert.hasUmdPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
          expect(contents).to.match(/\.Fizz = /);
          expect(contents).to.match(/\.Buzz = /);
        });
        done();
      });
  });

  it('should create a UMD bundle with all options', function (done) {
    cli.run('hello/index.js --bundle --minify --debug --test --standalone Fizz.Buzz --outfile hello/dist/',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('hello/index.js --> hello/dist/index.js');
        expect(stdout).to.contain('hello/index.js --> hello/dist/index.js.map');
        expect(stdout).to.contain('hello/index.js --> hello/dist/index.min.js');
        expect(stdout).to.contain('hello/index.js --> hello/dist/index.min.js.map');
        expect(stdout).to.contain('hello/index.js --> hello/dist/index.test.js');

        assert.directoryContents('hello', [
          'banner.txt',
          'hello-world.js',
          'index.js',
          'package.json',
          'say/index.js',
          'dist/index.js',
          'dist/index.js.map',
          'dist/index.min.js',
          'dist/index.min.js.map',
          'dist/index.test.js',
        ]);

        assert.fileContents('hello/dist/index.js', function (contents) {
          assert.hasBanner(contents);
          assert.hasUmdPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
          expect(contents).to.match(/\.Fizz = /);
          expect(contents).to.match(/\.Buzz = /);
        });

        assert.fileContents('hello/dist/index.min.js', function (contents) {
          assert.hasBanner(contents);
          assert.hasMinifiedUmdPreamble(contents);
          assert.isMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
          expect(contents).to.match(/\.Fizz=/);
          expect(contents).to.match(/\.Buzz=/);
        });

        assert.fileContents('hello/dist/index.test.js', function (contents) {
          assert.hasBanner(contents);
          assert.hasMinifiedUmdPreamble(contents);
          assert.isMinified(contents, true);
          assert.noSourceMap(contents);
          assert.hasCoverage(contents);
          expect(contents).to.match(/\.Fizz=/);
          expect(contents).to.match(/\.Buzz=/);
        });

        assert.fileContents('hello/dist', ['index.js.map', 'index.min.js.map'], function (contents) {
          expect(contents.sources).to.contain.members([
            '../hello-world.js',
            '../index.js',
            '../say/index.js'
          ]);
        });

        done();
      });
  });

  it('should create a bundle and sourcemap for a universal library', function (done) {
    cli.run('universal-lib/lib/browser.js --outfile universal-lib/dist/universal-lib.js --standalone universal --bundle --debug --minify',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('universal-lib/lib/browser.js --> universal-lib/dist/universal-lib.js');
        expect(stdout).to.contain('universal-lib/lib/browser.js --> universal-lib/dist/universal-lib.js.map');

        assert.directoryContents('universal-lib', [
          'banner.txt',
          'bower.json',
          'dist/universal-lib.js',
          'dist/universal-lib.js.map',
          'dist/universal-lib.min.js',
          'dist/universal-lib.min.js.map',
          'lib/browser.js',
          'lib/node.js',
          'lib/resolve.js',
          'package.json',
        ]);

        assert.fileContents('universal-lib/dist/universal-lib.js', function (contents) {
          assert.hasBanner(contents);
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });

        assert.fileContents('universal-lib/dist/universal-lib.min.js', function (contents) {
          assert.hasBanner(contents);
          assert.hasMinifiedUmdPreamble(contents);
          assert.isMinified(contents);
          assert.hasSourceMap(contents);
          assert.noCoverage(contents);
        });

        assert.fileContents('universal-lib/dist', ['universal-lib.js.map', 'universal-lib.min.js.map'], function (contents) {
          expect(contents.sources).to.contain.members([
            '../lib/browser.js',
            '../lib/resolve.js',
          ]);

          // The first 9 lines of the sourcemap should be blank, since we don't
          // have sourcemappings for the banner
          expect(contents.mappings).to.match(/^;;;;;;;;(C|A)AAA/);
        });

        done();
      });
  });
});
