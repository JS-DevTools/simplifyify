'use strict';

var helper = require('./helper'),
    expect = require('chai').expect;

describe('simplifyify --exclude', function() {
  it('should not exclude anything if nothing matches', function(done) {
    helper.run('test-app/lib/**/*.js --exclude test-app/lib/**/*-foo.js --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.js');

        helper.assert.filesWereCreated([
          'index.js',
          'hello-world.js',
          'say/index.js'
        ]);

        helper.fileContents(['index.js', 'hello-world.js', 'say/index.js'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        done();
      });
  });

  it('should exclude a single file', function(done) {
    helper.run('test-app/lib/**/*.js --exclude test-app/lib/say/index.js --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.js');
        expect(stdout).not.to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.js');

        helper.assert.filesWereCreated([
          'index.js',
          'hello-world.js'
        ]);

        helper.fileContents(['index.js', 'hello-world.js'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        done();
      });
  });

  it('should exclude multiple files', function(done) {
    helper.run('test-app/lib/**/*.js --exclude test-app/lib/**/index.js --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.js');
        expect(stdout).not.to.contain('test-app/lib/index.js --> test-app/dist/index.js');
        expect(stdout).not.to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.js');

        helper.assert.filesWereCreated([
          'hello-world.js'
        ]);

        helper.fileContents(['hello-world.js'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        done();
      });
  });
});
