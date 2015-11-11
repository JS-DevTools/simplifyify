'use strict';

var helper = require('../fixtures/helper'),
    expect = require('chai').expect;

describe('simplifyify --minify', function() {
  it('should minify a single file', function(done) {
    helper.run('test-app/lib/index.js --minify --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.min.js');

        helper.assert.filesWereCreated([
          'index.js',
          'index.min.js'
        ]);

        helper.fileContents('index.js', function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        helper.fileContents('index.min.js', function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.isMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        done();
      });
  });

  it('should minify multiple files', function(done) {
    helper.run('test-app/lib/**/index.js --minify --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.min.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.min.js');

        helper.assert.filesWereCreated([
          'index.js',
          'index.min.js',
          'say/index.js',
          'say/index.min.js'
        ]);

        helper.fileContents(['index.js', 'say/index.js'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        helper.fileContents(['index.min.js', 'say/index.min.js'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.isMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        done();
      });
  });

  it('should append ".min" when renaming output files', function(done) {
    helper.run('test-app/lib/**/*.js --minify --outfile test-app/dist/*.foo.es5',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.foo.es5');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.foo.min.es5');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.foo.es5');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.foo.min.es5');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.foo.es5');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.foo.min.es5');

        helper.assert.filesWereCreated([
          'index.foo.es5',
          'index.foo.min.es5',
          'hello-world.foo.es5',
          'hello-world.foo.min.es5',
          'say/index.foo.es5',
          'say/index.foo.min.es5'
        ]);

        helper.fileContents(['index.foo.es5', 'hello-world.foo.es5', 'say/index.foo.es5'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        helper.fileContents(['index.foo.min.es5', 'hello-world.foo.min.es5', 'say/index.foo.min.es5'],
          function(contents) {
            helper.assert.hasPreamble(contents);
            helper.assert.isMinified(contents);
            helper.assert.noSourceMap(contents);
            helper.assert.noCoverage(contents);
          });
        done();
      });
  });
});
