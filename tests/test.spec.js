'use strict';

var helper = require('./helper'),
    expect = require('chai').expect;

describe('simplifyify --test', function() {
  it('should add code-coverage to a single file', function(done) {
    helper.run('test-app/lib/index.js --test --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.test.js');

        helper.assert.filesWereCreated([
          'index.js',
          'index.test.js'
        ]);

        helper.fileContents('index.js', function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        helper.fileContents('index.test.js', function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.isMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.hasCoverage(contents);
        });
        done();
      });
  });

  it('should add code-coverage to multiple files', function(done) {
    helper.run('test-app/lib/**/index.js --test --outfile test-app/dist/',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.js');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.test.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.test.js');

        helper.assert.filesWereCreated([
          'index.js',
          'index.test.js',
          'say/index.js',
          'say/index.test.js'
        ]);

        helper.fileContents(['index.js', 'say/index.js'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        helper.fileContents(['index.test.js', 'say/index.test.js'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.isMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.hasCoverage(contents);
        });
        done();
      });
  });

  it('should append ".test" when renaming output files', function(done) {
    helper.run('test-app/lib/**/*.js --test --minify --debug --outfile test-app/dist/*.foo.es5',
      function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.foo.es5');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.foo.es5.map');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.foo.min.es5');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.foo.min.es5.map');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/dist/index.foo.test.es5');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.foo.es5');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.foo.es5.map');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.foo.min.es5');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.foo.min.es5.map');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/dist/hello-world.foo.test.es5');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.foo.es5');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.foo.es5.map');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.foo.min.es5');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.foo.min.es5.map');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/dist/say/index.foo.test.es5');

        helper.assert.filesWereCreated([
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

        helper.fileContents(['index.foo.es5', 'hello-world.foo.es5', 'say/index.foo.es5'], function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.hasSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        helper.fileContents(['index.foo.min.es5', 'hello-world.foo.min.es5', 'say/index.foo.min.es5'],
          function(contents) {
            helper.assert.hasPreamble(contents);
            helper.assert.isMinified(contents);
            helper.assert.hasSourceMap(contents);
            helper.assert.noCoverage(contents);
          });
        helper.fileContents(['index.foo.test.es5', 'hello-world.foo.test.es5', 'say/index.foo.test.es5'],
          function(contents) {
            helper.assert.hasPreamble(contents);
            helper.assert.isMinified(contents);
            helper.assert.noSourceMap(contents);
            helper.assert.hasCoverage(contents);
          });

        helper.fileContents(['index.foo.es5.map', 'index.foo.min.es5.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/index.js',
            '../lib/say/index.js'
          ]);
        });
        helper.fileContents(['hello-world.foo.es5.map', 'hello-world.foo.min.es5.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../lib/hello-world.js',
            '../lib/say/index.js'
          ]);
        });
        helper.fileContents(['say/index.foo.es5.map', 'say/index.foo.min.es5.map'], function(contents) {
          expect(contents.sources).to.contain.members([
            '../../lib/say/index.js'
          ]);
        });
        done();
      });
  });
});
