'use strict';

var cli    = require('../fixtures/cli'),
    assert = require('../fixtures/assert'),
    expect = require('chai').expect;

describe('simplifyify --standalone', function() {
  it('should create a UMD module with the given name', function(done) {
    cli.run('es5/lib/index.js --standalone FizzBuzz --outfile es5/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.equal('es5/lib/index.js --> es5/dist/index.js');

        assert.directoryContents('es5/dist', 'index.js');

        assert.fileContents('es5/dist/index.js', function(contents) {
          assert.hasUmdPreamble(contents);
          assert.notMinified(contents);
          assert.noSourceMap(contents);
          assert.noCoverage(contents);
          expect(contents).to.match(/\.FizzBuzz = /);
        });
        done();
      });
  });

  it('should create a UMD module with a namespaced name', function(done) {
    cli.run('es5/lib/index.js --standalone Fizz.Buzz --outfile es5/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.equal('es5/lib/index.js --> es5/dist/index.js');

        assert.directoryContents('es5/dist', 'index.js');

        assert.fileContents('es5/dist/index.js', function(contents) {
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
});
