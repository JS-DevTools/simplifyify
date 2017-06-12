'use strict';

module.exports = resolve;

/**
 * Resolves a relative path to an absolute path
 *
 * @param {string} cwd - The current directory path (absolute)
 * @param {string} path - The relative path to resolve
 * @returns {string}
 */
function resolve (cwd, path) {
  //! This is an important comment
  // This is NOT an important comment
  return cwd + path;
}
