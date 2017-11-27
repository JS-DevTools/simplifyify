'use strict';

const spawn = require('child_process').spawn;
const del = require('del');
const path = require('path');
const isWindows = /^win/.test(process.platform);
const cliPath = path.resolve(__dirname, '../../bin/simplifyify');
const testAppsDir = path.resolve(__dirname, '../test-apps');

beforeEach('Delete previous test files', (done) => {
  // Clear the output files before each test
  del(['*/dist', '**/*.bundle.*'], { cwd: testAppsDir })
    .then(function () {
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
exports.run = function run (args, callback) {
  let exited = false, stdout = '', stderr = '';

  // Run simplifyify
  args = [cliPath].concat(args ? args.split(' ') : []);
  let simplifyify = spawn('node', args, { cwd: testAppsDir });

  // Capture stdout and stderr
  simplifyify.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  simplifyify.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  // Handle exits (successful or failure)
  simplifyify.on('exit', onExit);
  simplifyify.on('error', onExit);

  function onExit (code) {
    // onExit can sometimes fire multiple times, so ignore duplicates
    if (exited) {
      return;
    }
    exited = true;

    // TEMPORARY HACK to workaround a deprecation warning in Node 7.
    // TODO: Remove this code once all dependencies have been updated to eliminate this warning
    if (stderr && process.version.substr(0, 3) === 'v7.' &&
    /^\(node:\d+\) DeprecationWarning: Using Buffer without `new` will soon stop working/.test(stderr)) {
      stderr = '';
    }

    let err = null;
    if (code > 0 || stderr) {
      err = new Error(stderr || 'Simplifyify exited with code ' + code);
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
