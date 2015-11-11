'use strict';

var expandGlobs  = require('./expand-globs'),
    writeBundles = require('./write-bundles'),
    EventEmitter = require('events').EventEmitter;

module.exports = simplifyify;

/**
 * @typedef {{
 *  outfile: string,
 *  exclude: string,
 *  standalone: string,
 *  debug: boolean,
 *  minify: boolean,
 *  test: boolean,
 *  watch: boolean
 * }} Options
 */

/**
 * The Simplifyify API
 *
 * @param {string|string[]} globs - One or more file paths and/or glob patterns
 * @param {Options} [options] -  Simplifyify CLI options
 * @returns {EventEmitter}
 */
function simplifyify(globs, options) {
  options = options || {};

  var events = new EventEmitter();
  process.nextTick(simplifyifyAsync);
  return events;

  /**
   * Do everything asynchronously, even parameter validation.
   */
  function simplifyifyAsync() {
    try {
      // Validate the entry files
      if (!globs || globs.length === 0) {
        events.emit('error', new Error('No entry files were specified'));
        return;
      }

      if (!Array.isArray(globs)) {
        globs = [globs];
      }

      // Expand the glob(s) into a list of entry files and output files
      var fileSets = expandGlobs(globs, options);
      if (fileSets.length === 0) {
        events.emit('error', new Error('No matching entry files were found'));
        return;
      }

      fileSets.forEach(function(fileSet) {
        writeBundles(fileSet, events, options);
      });
    }
    catch (e) {
      events.emit('error', e);
    }
  }
}
