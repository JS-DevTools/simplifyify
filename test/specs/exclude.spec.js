'use strict';

const cli = require('../fixtures/cli');
const assert = require('../fixtures/assert');
const expect = require('chai').expect;

describe('simplifyify --exclude', function () {
  it('should not exclude anything if nothing matches', function (done) {
    cli.run('es5/lib/**/*.js --exclude es5/lib/**/*-foo.js --outfile es5/dist/',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.js');
        expect(stdout).to.contain('es5/lib/say/index.js --> es5/dist/say/index.js');

        assert.directoryContents('es5/dist', [
          'index.js',
          'hello-world.js',
          'say/index.js'
        ]);

        assert.fileContents('es5/dist', ['index.js', 'hello-world.js', 'say/index.js'], function (contents) {
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
        });
        done();
      });
  });

  it('should exclude a single file', function (done) {
    cli.run('es5/lib/**/*.js --exclude es5/lib/say/index.js --outfile es5/dist/',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/index.js --> es5/dist/index.js');
        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.js');
        expect(stdout).not.to.contain('es5/lib/say/index.js --> es5/dist/say/index.js');

        assert.directoryContents('es5/dist', [
          'index.js',
          'hello-world.js'
        ]);

        assert.fileContents('es5/dist', ['index.js', 'hello-world.js'], function (contents) {
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
        });
        done();
      });
  });

  it('should exclude multiple files', function (done) {
    cli.run('es5/lib/**/*.js --exclude es5/lib/**/index.js --outfile es5/dist/',
      function (err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('es5/lib/hello-world.js --> es5/dist/hello-world.js');
        expect(stdout).not.to.contain('es5/lib/index.js --> es5/dist/index.js');
        expect(stdout).not.to.contain('es5/lib/say/index.js --> es5/dist/say/index.js');

        assert.directoryContents('es5/dist', [
          'hello-world.js'
        ]);

        assert.fileContents('es5/dist', ['hello-world.js'], function (contents) {
          assert.hasPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
        });
        done();
      });
  });
});
