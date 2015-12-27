'use strict';

var spawn       = require('child_process').spawn,
    del         = require('del'),
    path        = require('path'),
    isWindows   = /^win/.test(process.platform),
    cliPath     = path.resolve(__dirname, '../../bin/simplifyify'),
    testAppsDir = path.resolve(__dirname, '../test-apps');

beforeEach(function(done) {
  // Clear the output files before each test
  del(['*/dist', '**/*.bundle.*'], {cwd: testAppsDir})
    .then(function() {
      done();
    })
    .catch(done);
});

/**
 * Runs Simplifyify with the given args
 *
 * @param {string} args
 * @param {function} callback
 * @returns {ChildProcess}
 */
exports.run = function run(args, callback) {
  var exited = false, stdout = '', stderr = '';

  // Run simplifyify
  args = [cliPath].concat(args ? args.split(' ') : []);
  var simplifyify = spawn('node', args, {cwd: testAppsDir});

  // Capture stdout and stderr
  simplifyify.stdout.on('data', function(data) {
    stdout += data.toString();
  });
  simplifyify.stderr.on('data', function(data) {
    stderr += data.toString();
  });

  // Handle exits (successful or failure)
  simplifyify.on('exit', onExit);
  simplifyify.on('error', onExit);

  function onExit(code) {
    // onExit can sometimes fire multiple times, so ignore duplicates
    if (exited) {
      return;
    }
    exited = true;

    var err = null;
    if (code > 0 || stderr) {
      err = new Error(stderr);
      err.code = code;
    }
    else if (code instanceof Error) {
      err = code;
    }

    if (isWindows) {
      // Replace Windows path separators with POSIX separators
      stdout = stdout.replace(/\\/g, '/');
      stderr = stderr.replace(/\\/g, '/');
    }

    callback(err, stdout.trim(), stderr.trim());
  }

  return simplifyify;
};
