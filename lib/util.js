'use strict';

const mkdirp = require('mkdirp');
const touch = require('touch');
const path = require('path');
const fs = require('fs');

module.exports = {
  ensureFileExists,
  readFile,
  writeFile,
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
 * Asynchronously reads the contents of a file
 *
 * @param {string} file - The absolute file path
 * @returns {Promise<string>} - Resolves with the contents of the file, as a UTF8 string
 */
function readFile (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

/**
 * Asynchronously writes the given data to the specified file
 *
 * @param {string} file - The absolute file path
 * @param {string} data - The data to write to the file
 * @returns {Promise} - Resolves after the file has been written
 */
function writeFile (file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
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
