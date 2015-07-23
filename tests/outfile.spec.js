'use strict';

var helper = require('./helper'),
    expect = require('chai').expect;

describe('simplifyify --outfile', function() {
  it('should create a single output file, with the an explicit name', function(done) {
    helper.run('test-app/lib/index.js --outfile test-app/dist/my-file.js', function(err, stdout) {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal('test-app/lib/index.js --> test-app/dist/my-file.js');

      helper.assert.filesWereCreated(['my-file.js']);

      helper.fileContents('my-file.js', function(contents) {
        helper.assert.hasPreamble(contents);
        helper.assert.notMinified(contents);
        helper.assert.noSourceMap(contents);
        helper.assert.noCoverage(contents);
      });
      done();
    });
  });

  it('should create a single output file, with the entry file name', function(done) {
    helper.run('test-app/lib/index.js --outfile test-app/dist', function(err, stdout) {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal('test-app/lib/index.js --> test-app/dist/index.js');

      helper.assert.filesWereCreated(['index.js']);

      helper.fileContents('index.js', function(contents) {
        helper.assert.hasPreamble(contents);
        helper.assert.notMinified(contents);
        helper.assert.noSourceMap(contents);
        helper.assert.noCoverage(contents);
      });
      done();
    });
  });

  it('should create a single output file, with the patterned file name', function(done) {
    helper.run('test-app/lib/index.js --outfile test-app/dist/*.foo-bar.es6', function(err, stdout) {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal('test-app/lib/index.js --> test-app/dist/index.foo-bar.es6');

      helper.assert.filesWereCreated(['index.foo-bar.es6']);

      helper.fileContents('index.foo-bar.es6', function(contents) {
        helper.assert.hasPreamble(contents);
        helper.assert.notMinified(contents);
        helper.assert.noSourceMap(contents);
        helper.assert.noCoverage(contents);
      });
      done();
    });
  });
});
