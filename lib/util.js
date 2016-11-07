'use strict';

const mkdirp = require('mkdirp');
const touch = require('touch');
const path = require('path');

module.exports = {
  ensureFileExists,
  appendToFileName,
  cloneObj,
};

/**
 * Ensures that the given file path exists, since Browserify throws errors if they don't.
 *
 * @param {string} file - The absolute file path
 */
function ensureFileExists (file) {
  let dir = path.dirname(file);
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
function appendToFileName (file, append) {
  let ext = path.extname(file);
  return file.substr(0, file.length - ext.length) + append + ext;
}

/**
 * A simple recursive cloning function for JSON data
 *
 * @param {object|array} obj
 * @returns {object|array}
 */
function cloneObj (obj) {
  let clone = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach(key => {
    let value = obj[key];
    if (value && typeof value === 'object') {
      value = cloneObj(value);
    }
    clone[key] = value;
  });
  return clone;
}
