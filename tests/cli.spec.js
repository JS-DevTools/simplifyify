'use strict';

var helper  = require('./helper'),
    expect  = require('chai').expect,
    version = require('../package').version;

describe('simplifyify --help', function() {
  it('should show help if called without any args', function(done) {
    helper.run('', function(err, stdout) {
      if (err) {
        return done(err);
      }

      expect(stdout).to.match(/^Usage: simplifyify \[options\] <files\.\.\.\>/);
      helper.assert.noFilesWereCreated();
      done();
    });
  });

  it('should show help if called --help', function(done) {
    helper.run('--help', function(err, stdout) {
      if (err) {
        return done(err);
      }

      expect(stdout).to.match(/^Usage: simplifyify \[options\] <files\.\.\.\>/);
      helper.assert.noFilesWereCreated();
      done();
    });
  });

  it('should show help if called -h', function(done) {
    helper.run('--help', function(err, stdout) {
      if (err) {
        return done(err);
      }

      expect(stdout).to.match(/^Usage: simplifyify \[options\] <files\.\.\.\>/);
      helper.assert.noFilesWereCreated();
      done();
    });
  });
});

describe('simplifyify --version', function() {
  it('should output the version number if called --version', function(done) {
    helper.run('--version', function(err, stdout) {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal(version);
      helper.assert.noFilesWereCreated();
      done();
    });
  });

  it('should output the version number if called -V', function(done) {
    helper.run('-V', function(err, stdout) {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal(version);
      helper.assert.noFilesWereCreated();
      done();
    });
  });
});

describe('failure tests', function() {
  it('should error if called with an unknown option', function(done) {
    helper.run('-x', function(err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.contain('unknown option');
      helper.assert.noFilesWereCreated();
      done();
    });
  });

  it('should error if called without an outfile', function(done) {
    helper.run('lib/index.js', function(err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.equal('No output file/directory was specified');
      helper.assert.noFilesWereCreated();
      done();
    });
  });

  it('should error if the entry file does not exist', function(done) {
    helper.run('some/file/that/does/not/exist.js --outfile dist/', function(err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.equal('No matching entry files were found');
      helper.assert.noFilesWereCreated();
      done();
    });
  });

  it('should error if the entry file glob does not match any files', function(done) {
    helper.run('"lib/**/*-foo-bar.js" --outfile dist/', function(err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.equal('No matching entry files were found');
      helper.assert.noFilesWereCreated();
      done();
    });
  });

  it('should error if all matching files are excluded', function(done) {
    helper.run('"lib/**/*.js" --exclude **/*.js --outfile dist/', function(err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.equal('No matching entry files were found');
      helper.assert.noFilesWereCreated();
      done();
    });
  });

  it('should error if the --standalone param is not given', function(done) {
    helper.run('lib/index.js --outfile dist/ --standalone', function(err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.contain('argument missing');
      helper.assert.noFilesWereCreated();
      done();
    });
  });
});
