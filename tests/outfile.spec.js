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

  describe('no --outfile specified', function() {
    it('should create a single output file, in the entry file directory', function(done) {
      helper.run('test-app/lib/index.js', function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.equal('test-app/lib/index.js --> test-app/lib/index.bundle.js');

        var filesThatAlreadyExisted = ['hello-world.js', 'index.js', 'say/index.js'];
        helper.assert.filesWereCreated(['index.bundle.js'].concat(filesThatAlreadyExisted), 'test-app/lib');

        helper.fileContents('../lib/index.bundle.js', function(contents) {
          helper.assert.hasPreamble(contents);
          helper.assert.notMinified(contents);
          helper.assert.noSourceMap(contents);
          helper.assert.noCoverage(contents);
        });
        done();
      });
    });

    it('should create a multiple output files, in the entry file directories', function(done) {
      helper.run('test-app/lib/**/*.js --debug --minify --test', function(err, stdout) {
        if (err) {
          return done(err);
        }

        expect(stdout).to.contain('test-app/lib/index.js --> test-app/lib/index.bundle.js');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/lib/index.bundle.js.map');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/lib/index.bundle.min.js');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/lib/index.bundle.min.js.map');
        expect(stdout).to.contain('test-app/lib/index.js --> test-app/lib/index.bundle.test.js');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/lib/hello-world.bundle.js');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/lib/hello-world.bundle.js.map');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/lib/hello-world.bundle.min.js');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/lib/hello-world.bundle.min.js.map');
        expect(stdout).to.contain('test-app/lib/hello-world.js --> test-app/lib/hello-world.bundle.test.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/lib/say/index.bundle.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/lib/say/index.bundle.js.map');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/lib/say/index.bundle.min.js');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/lib/say/index.bundle.min.js.map');
        expect(stdout).to.contain('test-app/lib/say/index.js --> test-app/lib/say/index.bundle.test.js');

        var filesThatAlreadyExisted = ['hello-world.js', 'index.js', 'say/index.js'];
        helper.assert.filesWereCreated([
            'index.bundle.js',
            'index.bundle.js.map',
            'index.bundle.min.js',
            'index.bundle.min.js.map',
            'index.bundle.test.js',
            'hello-world.bundle.js',
            'hello-world.bundle.js.map',
            'hello-world.bundle.min.js',
            'hello-world.bundle.min.js.map',
            'hello-world.bundle.test.js',
            'say/index.bundle.js',
            'say/index.bundle.js.map',
            'say/index.bundle.min.js',
            'say/index.bundle.min.js.map',
            'say/index.bundle.test.js'
          ].concat(filesThatAlreadyExisted),
          'test-app/lib'
        );

        helper.fileContents([
            '../lib/index.bundle.js', '../lib/hello-world.bundle.js', '../lib/say/index.bundle.js'
          ],
          function(contents) {
            helper.assert.hasPreamble(contents);
            helper.assert.notMinified(contents);
            helper.assert.hasSourceMap(contents);
            helper.assert.noCoverage(contents);
          }
        );
        helper.fileContents([
            '../lib/index.bundle.min.js', '../lib/hello-world.bundle.min.js', '../lib/say/index.bundle.min.js'
          ],
          function(contents) {
            helper.assert.hasPreamble(contents);
            helper.assert.isMinified(contents);
            helper.assert.hasSourceMap(contents);
            helper.assert.noCoverage(contents);
          }
        );
        helper.fileContents([
            '../lib/index.bundle.test.js', '../lib/hello-world.bundle.test.js', '../lib/say/index.bundle.test.js'
          ],
          function(contents) {
            helper.assert.hasPreamble(contents);
            helper.assert.isMinified(contents, true);
            helper.assert.noSourceMap(contents);
            helper.assert.hasCoverage(contents);
          }
        );

        helper.fileContents(['../lib/index.bundle.js.map', '../lib/index.bundle.min.js.map'],
          function(contents) {
            expect(contents.sources).to.contain.members([
              'hello-world.js',
              'index.js',
              'say/index.js'
            ]);
          }
        );
        helper.fileContents(['../lib/hello-world.bundle.js.map', '../lib/hello-world.bundle.min.js.map'],
          function(contents) {
            expect(contents.sources).to.contain.members([
              'hello-world.js',
              'say/index.js'
            ]);
          }
        );
        helper.fileContents(['../lib/say/index.bundle.js.map', '../lib/say/index.bundle.min.js.map'],
          function(contents) {
            expect(contents.sources).to.contain.members([
              'index.js'
            ]);
          }
        );

        done();
      });
    });
  });
});
