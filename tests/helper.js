'use strict';

var exec   = require('child_process').exec,
    rimraf = require('rimraf'),
    fs     = require('fs'),
    path   = require('path'),
    expect = require('chai').expect;

module.exports = {
  run: run,
  fileContents: fileContents,
  assert: {
    noFilesWereCreated: noFilesWereCreated,
    filesWereCreated: filesWereCreated,
    hasPreamble: hasPreamble,
    hasUmdPreamble: hasUmdPreamble,
    isMinified: isMinified,
    notMinified: notMinified,
    hasSourceMap: hasSourceMap,
    noSourceMap: noSourceMap,
    hasCoverage: hasCoverage,
    noCoverage: noCoverage
  }
};

beforeEach(function(done) {
  // Clear the output directory before each test
  rimraf(path.join(__dirname, '../test-app/dist'), done);

  // Increase the test timeout, since some tests have to allow time for multiple Browserify builds
  this.currentTest.timeout(5000);
  this.currentTest.slow(2000);
});

/**
 * Runs Simplifyify with the given args
 *
 * @param {string} args
 * @param {function} callback
 * @returns {ChildProcess}
 */
function run(args, callback) {
  // Run Simplifyify
  return exec('node bin/simplifyify ' + args, function(err, stdout, stderr) {
    stdout = stdout.toString().trim();
    stderr = stderr.toString().trim();

    if (stderr && !err) {
      console.warn('Simplifyify exited with 0, but also wrote to stderr.\n\n' + stderr);
    }

    callback(err, stdout, stderr);
  });
}

/**
 * Calls the given function for the given file(s), passing the contents of the file.
 *
 * @param {string|string[]} files
 * @param {function} fn
 */
function fileContents(files, fn) {
  files = Array.isArray(files) ? files : [files];
  files.forEach(function(file) {
    var contents = fs.readFileSync(path.join('test-app/dist', file)).toString();
    if (file.substr(-4) === '.map') {
      contents = JSON.parse(contents);
    }
    fn(contents);
  });
}

/**
 * Returns the contents of the given directory.
 *
 * @param {string} [dir] - The directory to list. Defaults to "../test-app/dist".
 */
function ls(dir) {
  try {
    var contents = [];

    dir = dir || path.join(__dirname, '../test-app/dist');
    fs.readdirSync(dir).forEach(function(name) {
      var fullName = path.join(dir, name);
      if (fs.statSync(fullName).isDirectory()) {
        ls(fullName).forEach(function(nested) {
          contents.push(path.join(name, nested));
        });
      }
      else {
        contents.push(name);
      }
    });

    return contents;
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      // The directory doesn't exist, so return an empty list
      return [];
    }
    throw e;
  }
}

/**
 * Asserts that the "../test-app/dist" folder is empty.
 */
function noFilesWereCreated() {
  var outfiles = ls();
  expect(outfiles).to.have.same.members([]);
}

/**
 * Asserts that the given files were created, and no others.
 *
 * @param {string[]} files
 */
function filesWereCreated(files) {
  var outfiles = ls();
  expect(outfiles).to.have.same.members(files);
}

/**
 * Asserts that the given file contents contain the Browserify preamble
 *
 * @param {string} contents
 */
function hasPreamble(contents) {
  expect(contents).to.match(/^\(function \w\(\w,\w,\w\)\{function /);
}

/**
 * Asserts that the given file contents contain the Browserify UMD preamble
 *
 * @param {string} contents
 */
function hasUmdPreamble(contents) {
  expect(contents).to.match(/^\(function\(\w\)\{if\(typeof exports==="object"/);
}

/**
 * Asserts that the given file contents contain an external source map
 *
 * @param {string} contents
 */
function hasSourceMap(contents) {
  expect(contents).to.match(/\/\/\# sourceMappingURL=.*\.map\n$/);
}

/**
 * Asserts that the given file contents DO NOT contain a source map
 *
 * @param {string} contents
 */
function noSourceMap(contents) {
  expect(contents).not.to.match(/\/\/\# sourceMap/);
}

/**
 * Asserts that the given file contents are minified
 *
 * @param {string} contents
 */
function isMinified(contents) {
  expect(contents).to.match(/"use strict";\S+/);
}

/**
 * Asserts that the given file contents ARE NOT minified
 *
 * @param {string} contents
 */
function notMinified(contents) {
  expect(contents).to.match(/'use strict';\n\s+/);
}

/**
 * Asserts that the given file contents contain code-coverage instrumentation
 *
 * @param {string} contents
 */
function hasCoverage(contents) {
  expect(contents).to.match(/__cov(_[a-zA-Z0-9$]+)+\.__coverage__/);
}

/**
 * Asserts that the given file contents DO NOT contain code-coverage instrumentation
 *
 * @param {string} contents
 */
function noCoverage(contents) {
  expect(contents).not.to.match(/__cov_/);
}

