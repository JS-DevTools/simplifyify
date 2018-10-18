"use strict";

const mkdirp = require("mkdirp-promise");
const path = require("path");
const fs = require("fs");

module.exports = {
  ensureFileExists,
  touchFile,
  statFile,
  readFile,
  writeFile,
  deleteFile,
  appendToFileName,
  isTypeScript,
  deepClone,
};

/**
 * Ensures that the given file path exists, since Browserify throws errors if they don't.
 *
 * @param {string} file - The absolute file path
 * @returns {Promise}
 */
function ensureFileExists (file) {
  return Promise.resolve()
    .then(() => {
      // Try to access the file
      return statFile(file);
    })
    .catch((error) => {
      if (error.code === "ENOENT") {
        // The file doesn't exist, so create it
        return touchFile(file);
      }
      else {
        throw error;
      }
    });
}

/**
 * Asynchronously adds a newline to the end of a file, to trigger any file-modification watchers
 *
 * @param {string} file - The absolute file path
 * @returns {Promise<fs.Stats>} - Resolves with an fs.Stats object
 */
function touchFile (file) {
  return new Promise((resolve, reject) => {
    fs.appendFile(file, "\n", (err, stats) => {
      if (err) {
        if (err.code === "ENOENT") {
          mkdirp(path.dirname(file))
            .then(() => {
              return touchFile(file);
            })
            .then((stats2) => {
              resolve(stats2);
            });
        }
        else {
          reject(err);
        }
      }
      else {
        resolve(stats);
      }
    });
  });
}

/**
 * Asynchronously gets the status of a file
 *
 * @param {string} file - The absolute file path
 * @returns {Promise<fs.Stats>} - Resolves with an fs.Stats object
 */
function statFile (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(stats);
      }
    });
  });
}

/**
 * Asynchronously reads the contents of a file
 *
 * @param {string} file - The absolute file path
 * @returns {Promise<string>} - Resolves with the contents of the file, as a UTF8 string
 */
function readFile (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: "utf8" }, (err, data) => {
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
 * Asynchronously writes the given data to the specified file.
 * The file and any parent directories are created if necessary.
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
 * Asynchronously deletes a file
 *
 * @param {string} file - The absolute file path
 * @returns {Promise} - Resolves when the file has been deleted
 */
function deleteFile (file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
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
 * Determines whether the specified file has a ".ts" or ".tsx" extension
 */
function isTypeScript (file) {
  let ext = path.extname(file).toLowerCase();
  return ext === ".ts" || ext === ".tsx";
}

/**
 * A simple recursive cloning function for simple JavaScript values.
 *
 * @param {*} original
 * @returns {*}
 */
function deepClone (original) {
  let clone;

  if (original) {
    if (typeof original === "object") {
      if (original instanceof RegExp) {
        return original;
      }
      else if (original instanceof Date) {
        return new Date(original.getTime());
      }
      else if (Array.isArray(original)) {
        clone = [];
      }
      else {
        clone = {};
      }
    }
    else {
      return original;
    }
  }
  else {
    return original;
  }

  let keys = Object.keys(original);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let value = original[key];

    clone[key] = deepClone(value);
  }

  return clone;
}
