'use strict';

const mkdirp = require('mkdirp');
const touch = require('touch');
const path = require('path');
const fs = require('fs');
const ono = require('ono');

module.exports = {
  ensureFileExists,
  appendToFileName,
  findFile,
  findJsonFile,
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
 * Searches for the given file name, starting in the given directory
 * and crawling up from there.
 *
 * @param {string} startingDir - The directory to start at
 * @param {string} fileName - The file to search for
 * @returns {string} - The full contents the file, or undefined if not found
 */
function findFile (startingDir, fileName) {
  let fullPath = path.join(startingDir, fileName);
  if (fs.existsSync(fullPath)) {
    try {
      return fs.readFileSync(fullPath, { encoding: 'utf8' });
    }
    catch (e) {
      throw ono(e, 'Error reading', fullPath);
    }
  }
  else {
    let parentDir = path.dirname(startingDir);
    if (parentDir !== startingDir) {
      return findFile(parentDir, fileName);
    }
  }
}

/**
 * Searches for the given JSON file, starting in the given directory
 * and crawling up from there.
 *
 * @param {string} startingDir - The directory to start at
 * @param {string} fileName - The file to search for
 * @returns {object} - The parsed contents of the JSON file, or undefined if not found
 */
function findJsonFile (startingDir, fileName) {
  let json = findFile(startingDir, fileName);
  if (json) {
    return JSON.parse(json);
  }
  else {
    return {};
  }
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
