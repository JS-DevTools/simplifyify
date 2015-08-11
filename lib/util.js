'use strict';

var mkdirp = require('mkdirp'),
    touch  = require('touch'),
    path   = require('path');

module.exports = {
  ensureFileExists: ensureFileExists,
  appendToFileName: appendToFileName
};

/**
 * Ensures that the given file path exists, since Browserify throws errors if they don't.
 *
 * @param {string} file - The absolute file path
 */
function ensureFileExists(file) {
  var dir = path.dirname(file);
  mkdirp.sync(dir);
  touch.sync(file);
}

/**
 * Appends the given string to the given file name, without affecting the file extension.
 *
 * @param {string} file - The original file path and/or name  (e.g. "dest/subdir/my-file.js")
 * @param {string} append - The string to append to the file name (e.g. ".min")
 * @returns {string}
 */
function appendToFileName(file, append) {
  var ext = path.extname(file);
  return file.substr(0, file.length - ext.length) + append + ext;
}
