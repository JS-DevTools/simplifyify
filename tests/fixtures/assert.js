'use strict';

var del         = require('del'),
    touch       = require('touch'),
    fs          = require('fs'),
    path        = require('path'),
    expect      = require('chai').expect,
    isWindows   = /^win/.test(process.platform),
    testAppsDir = path.resolve(__dirname, '../test-apps');

/**
 * Asserts that the given folder is empty.
 *
 * @param {string}    dir - The directory to check
 */
exports.directoryIsEmpty = function(dir) {
  var outfiles = ls(dir);
  try {
    expect(outfiles).to.have.same.members([]);
  }
  catch (e) {
    console.error('Expected: []\n\nActual: %s', JSON.stringify(outfiles, null, 2));
    throw e;
  }
}

/**
 * Asserts that the directory contains the given files, and no others.
 *
 * @param {string}    [dir] - The directory to check
 * @param {string[]}  files - The files to check for
 */
exports.directoryContents = function(dir, files) {
  if (arguments.length === 1) {
    dir = '.';
    files = dir;
  }
  files = Array.isArray(files) ? files : [files];

  var outfiles = ls(dir);
  try {
    expect(outfiles).to.have.same.members(files);
  }
  catch (e) {
    console.error('Expected: %s\n\nActual: %s',
      JSON.stringify(files, null, 2), JSON.stringify(outfiles, null, 2));
    throw e;
  }
}

/**
 * Calls the given function for the given file(s), passing the contents of the file.
 *
 * @param {string} [dir]
 * @param {string|string[]} files
 * @param {function} fn
 */
exports.fileContents = function(dir, files, fn) {
  if (typeof files === 'function') {
    fn = files;
    files = dir;
    dir = '.';
  }
  dir = resolve(dir);
  files = Array.isArray(files) ? files : [files];

  files.forEach(function(file) {
    var contents = fs.readFileSync(path.join(dir, file)).toString();

    if (file.substr(-4) === '.map') {
      // Parse source-map files, and return a POJO instead of a string
      contents = JSON.parse(contents);

      if (isWindows) {
        // Replace Windows path separators with POSIX separators
        contents.sources = contents.sources.map(function(source) {
          return source.replace(/\\/g, '/');
        });
      }
    }
    fn(contents);
  });
}


/**
 * Asserts that the given file contents contain the Browserify preamble
 *
 * @param {string} contents
 */
exports.hasPreamble = function(contents) {
  expect(contents).to.match(/^\(function \w\(\w,\w,\w\)\{function /);
}

/**
 * Asserts that the given file contents contain the Browserify UMD preamble
 *
 * @param {string} contents
 */
exports.hasUmdPreamble = function(contents) {
  expect(contents).to.match(/^\(function\(\w\)\{if\(typeof exports==="object"/);
}

/**
 * Asserts that the given file contents contain an external source map
 *
 * @param {string} contents
 */
exports.hasSourceMap = function(contents) {
  expect(contents).to.match(/\/\/\# sourceMappingURL=.*\.map\n$/);
}

/**
 * Asserts that the given file contents DO NOT contain a source map
 *
 * @param {string} contents
 */
exports.noSourceMap = function(contents) {
  expect(contents).not.to.match(/\/\/\# sourceMap/);
}

/**
 * Asserts that the given file contents are minified
 *
 * @param {string}  contents
 * @param {boolean} stripComments - Whether the contents should include comments or not
 */
exports.isMinified = function(contents, stripComments) {
  // Single-quotes become double-quotes, and newline is removed
  expect(contents).to.match(/"use strict";\S+/);

  if (stripComments) {
    // All comments are removed
    expect(contents).not.to.match(/\/\//);
  }
  else {
    // Non-important comments are removed
    expect(contents).not.to.match(/\* @param \{string\}/);
    expect(contents).not.to.match(/\/\/ This is NOT an important comment/);

    // Important comments are preserved
    expect(contents).to.match(/This is an important comment/);
  }
}

/**
 * Asserts that the given file contents ARE NOT minified
 *
 * @param {string} contents
 */
exports.notMinified = function(contents) {
  // Single-quotes and newline are preserved
  expect(contents).to.match(/'use strict';\r?\n\s+/);

  // Non-important comments are preserved
  expect(contents).to.match(/\* @param \{string\}/);
  expect(contents).to.match(/\/\/ This is NOT an important comment/);

  // Important comments are also preserved
  expect(contents).to.match(/This is an important comment/);
}

/**
 * Asserts that the given file contents contain code-coverage instrumentation
 *
 * @param {string} contents
 */
exports.hasCoverage = function(contents) {
  // Check for __cov_ wrappers
  expect(contents).to.match(/__cov(_[a-zA-Z0-9$]+)+\.__coverage__/);
}

/**
 * Asserts that the given file contents DO NOT contain code-coverage instrumentation
 *
 * @param {string} contents
 */
exports.noCoverage = function(contents) {
  expect(contents).not.to.match(/__cov_/);
}

/**
 * Resolves a path, relative to the "test-apps" folder
 */
function resolve(fileOrFolder) {
  if (path.isAbsolute(fileOrFolder)) {
    return fileOrFolder;
  }
  else {
    return path.resolve(testAppsDir, fileOrFolder);
  }
}

/**
 * Returns the contents of the given directory.
 *
 * @param {string} [dir] - The directory to list
 */
function ls(dir) {
  try {
    var contents = [];
    dir = resolve(dir);

    fs.readdirSync(dir).forEach(function(name) {
      var fullName = path.join(dir, name);
      if (fs.statSync(fullName).isDirectory()) {
        ls(fullName).forEach(function(nested) {
          contents.push(name + '/' + nested);   // Don't use path.join() here, because of Windows
        });
      }
      else if (['.DS_Store', 'Thumbs.db'].indexOf(name) === -1) {
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
