'use strict';

var cli = require('../fixtures/cli');
var assert = require('../fixtures/assert');
var expect = require('chai').expect;
var version = require('../../package').version;

describe('simplifyify --help', function () {
  it('should show help if called without any args', function (done) {
    cli.run('', function (err, stdout) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stdout).to.match(/^Usage: simplifyify \[options\] <files\.\.\.\>/);
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should exit with a nonzero if called without any args', function (done) {
    cli.run('', function (err) {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.code).to.equal(1);
      done();
    });
  });

  it('should show help if called with --help', function (done) {
    cli.run('--help', function (err, stdout) {
      expect(stdout).to.match(/^Usage: simplifyify \[options\] <files\.\.\.\>/);
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should exit with zero if called with --help', function (done) {
    cli.run('--help', function (err) {
      expect(err).to.be.null;
      done();
    });
  });

  it('should show help if called with -h', function (done) {
    cli.run('--help', function (err, stdout) {
      expect(stdout).to.match(/^Usage: simplifyify \[options\] <files\.\.\.\>/);
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should exit with zero if called with -h', function (done) {
    cli.run('--help', function (err) {
      expect(err).to.be.null;
      done();
    });
  });
});

describe('simplifyify --version', function () {
  it('should output the version number if called --version', function (done) {
    cli.run('--version', function (err, stdout) {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal(version);
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should output the version number if called -V', function (done) {
    cli.run('-V', function (err, stdout) {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal(version);
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });
});

describe('failure tests', function () {
  it('should error if called with an unknown option', function (done) {
    cli.run('-x', function (err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.contain('unknown option');
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should error if the entry file does not exist', function (done) {
    cli.run('some/file/that/does/not/exist.js --outfile dist/', function (err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.equal('No matching entry files were found');
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should error if the entry file glob does not match any files', function (done) {
    cli.run('"lib/**/*-foo-bar.js" --outfile dist/', function (err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.equal('No matching entry files were found');
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should error if all matching files are excluded', function (done) {
    cli.run('"lib/**/*.js" --exclude **/*.js --outfile dist/', function (err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.equal('No matching entry files were found');
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should error if the --standalone param is not given', function (done) {
    cli.run('lib/index.js --outfile dist/ --standalone', function (err, stdout, stderr) {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.contain('argument missing');
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });
});
