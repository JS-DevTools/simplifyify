'use strict';

var mkdirp = require('mkdirp');
var touch = require('touch');
var path = require('path');
var fs = require('fs');
var ono = require('ono');

module.exports = {
  ensureFileExists: ensureFileExists,
  appendToFileName: appendToFileName,
  findFile: findFile,
  findJsonFile: findJsonFile
};

/**
 * Ensures that the given file path exists, since Browserify throws errors if they don't.
 *
 * @param {string} file - The absolute file path
 */
function ensureFileExists (file) {
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
function appendToFileName (file, append) {
  var ext = path.extname(file);
  return file.substr(0, file.length - ext.length) + append + ext;
}

/**
 * Searches for the given file name, starting in the given directory
 * and crawling up from there.
 *
 * @param {string} startingDir - The directory to start at
 * @param {string} fileName - The file to search for
 * @returns {string} - The full path of the file, or undefined if not found
 */
function findFile (startingDir, fileName) {
  var fullPath = path.join(startingDir, fileName);
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  else {
    var parentDir = path.dirname(startingDir);
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
  var filePath;
  try {
    filePath = findFile(startingDir, fileName);
    if (filePath) {
      var json = fs.readFileSync(filePath, { encoding: 'utf8' });
      if (json) {
        return JSON.parse(json);
      }
      else {
        return {};
      }
    }
  }
  catch (e) {
    throw ono(e, 'Error reading', filePath);
  }
}
