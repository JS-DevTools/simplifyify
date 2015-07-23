'use strict';

var helper = require('./helper'),
    expect = require('chai').expect;

describe('simplifyify --standalone', function() {
  it('should create a UMD module with the given name', function(done) {
    helper.run('test-app/lib/index.js --standalone FizzBuzz --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.equal('test-app/lib/index.js --> test-app/dist/index.js');

        helper.assert.filesWereCreated(['index.js']);

        helper.fileContents('index.js', function(contents) {
          helper.assert.hasUmdPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
          expect(contents).to.match(/\.FizzBuzz = /);
        });
        done();
      });
  });

  it('should create a UMD module with a namespaced name', function(done) {
    helper.run('test-app/lib/index.js --standalone Fizz.Buzz --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.equal('test-app/lib/index.js --> test-app/dist/index.js');

        helper.assert.filesWereCreated(['index.js']);

        helper.fileContents('index.js', function(contents) {
          helper.assert.hasUmdPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
          expect(contents).to.match(/\.Fizz = /);
          expect(contents).to.match(/\.Buzz = /);
        });
        done();
      });
  });
});
