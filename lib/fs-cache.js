"use strict";

const fs = require("fs");
const path = require("path");

const cache = {/*
    filePath: {
      exists: true|false,
      contents: string|object,
    }
*/};

/**
 * Caches file contents so we don't have to find and read the same files
 * for every entry file.
 */
module.exports = {
  findFile,
  readTextFile,
  readJsonFile,
};

/**
 * Searches for the given file name, starting in the given directory
 * and crawling up from there.
 *
 * @param {string} startingPath - The file path to start at
 * @returns {string|undefined}
 */
function findFile (startingPath) {
  let cached = cacheFile(startingPath);

  if (cached.exists) {
    return startingPath;
  }

  let fileName = path.basename(startingPath);
  let startingDir = path.dirname(startingPath);
  let parentDir = path.dirname(startingDir);
  if (parentDir !== startingDir) {
    return findFile(path.join(parentDir, fileName));
  }
}

/**
 * Returns the contents of the specified file as a string.
 *
 * @param {string} filePath
 * @returns {string}
 */
function readTextFile (filePath) {
  let cached = cacheFile(filePath);
  return cached.contents;
}

/**
 * Returns the contents of the specified file as a JSON object.
 *
 * @param {string} filePath
 * @returns {object}
 */
function readJsonFile (filePath) {
  let cached = cacheFile(filePath);
  if (!cached.contents) {
    cached.contents = {};
  }
  else if (typeof cached.contents === "string") {
    cached.contents = JSON.parse(cached.contents);
  }
  return cached.contents;
}

/**
 * Caches the given file, and returns the cached file.
 *
 * @param {string} filePath
 * @returns {object}
 */
function cacheFile (filePath) {
  let cached = cache[filePath];

  if (cached) {
    return cached;
  }

  cached = {};
  try {
    cached.contents = fs.readFileSync(filePath, "utf8");
    cached.exists = true;
  }
  catch (e) {
    cached.exists = false;
    cached.contents = undefined;
  }

  return cache[filePath] = cached;
}
