'use strict';

const cli = require('../fixtures/cli');
const assert = require('../fixtures/assert');
const expect = require('chai').expect;
const version = require('../../package').version;

describe('simplifyify --help', () => {
  it('should show help if called without any args', (done) => {
    cli.run('', (err, stdout) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(stdout).to.match(/^Usage: simplifyify \[options\] <source-files\.\.\.\>/);
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should exit with a nonzero if called without any args', (done) => {
    cli.run('', (err) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.code).to.equal(1);
      done();
    });
  });

  it('should show help if called with --help', (done) => {
    cli.run('--help', (err, stdout) => {
      expect(stdout).to.match(/^Usage: simplifyify \[options\] <source-files\.\.\.\>/);
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should exit with zero if called with --help', (done) => {
    cli.run('--help', (err) => {
      expect(err).to.be.null;
      done();
    });
  });

  it('should show help if called with -h', (done) => {
    cli.run('--help', (err, stdout) => {
      expect(stdout).to.match(/^Usage: simplifyify \[options\] <source-files\.\.\.\>/);
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should exit with zero if called with -h', (done) => {
    cli.run('--help', (err) => {
      expect(err).to.be.null;
      done();
    });
  });
});

describe('simplifyify --version', () => {
  it('should output the version number if called --version', (done) => {
    cli.run('--version', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal(version);
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should output the version number if called -V', (done) => {
    cli.run('-V', (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.equal(version);
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });
});

describe('failure tests', () => {
  it('should error if called with an unknown option', (done) => {
    cli.run('-x', (err, stdout, stderr) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.contain('unknown option');
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should error if the entry file does not exist', (done) => {
    cli.run('some/file/that/does/not/exist.js --outfile dist/', (err, stdout, stderr) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.equal('No matching entry files were found');
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should error if the entry file glob does not match any files', (done) => {
    cli.run('"lib/**/*-foo-bar.js" --outfile dist/', (err, stdout, stderr) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.equal('No matching entry files were found');
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should error if all matching files are excluded', (done) => {
    cli.run('"lib/**/*.js" --exclude **/*.js --outfile dist/', (err, stdout, stderr) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.equal('No matching entry files were found');
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });

  it('should error if the --standalone param is not given', (done) => {
    cli.run('lib/index.js --outfile dist/ --standalone', (err, stdout, stderr) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(stderr).to.contain('argument missing');
      assert.directoryIsEmpty('es5/dist');
      done();
    });
  });
});
