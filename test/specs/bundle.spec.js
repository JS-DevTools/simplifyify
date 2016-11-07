'use strict';

const cli = require('../fixtures/cli');
const assert = require('../fixtures/assert');
const expect = require('chai').expect;

describe('simplifyify --bundle', function () {
  it('should bundle a single file by default', function (done) {
    cli.run('hello/index.js',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('hello/index.js --> hello/index.bundle.js');

        assert.directoryContents('hello', [
          'banner.txt',
          'hello-world.js',
          'index.js',
          'index.bundle.js',
          'package.json',
          'say/index.js'
        ]);

        assert.fileContents('hello/index.bundle.js', function (contents) {
          assert.hasBanner(contents);
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
        });
        done();
      });
  });

  it('should bundle a single file', function (done) {
    cli.run('hello/index.js --bundle',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('hello/index.js --> hello/index.bundle.js');

        assert.directoryContents('hello', [
          'banner.txt',
          'hello-world.js',
          'index.js',
          'index.bundle.js',
          'package.json',
          'say/index.js'
        ]);

        assert.fileContents('hello/index.bundle.js', function (contents) {
          assert.hasBanner(contents);
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
        });
        done();
      });
  });
});
