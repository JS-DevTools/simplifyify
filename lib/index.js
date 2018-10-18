"use strict";

const expandGlobs = require("./expand-globs");
const writeBundles = require("./write-bundles");
const EventEmitter = require("events").EventEmitter;

module.exports = simplifyify;

/**
 * @typedef {{
 *  outfile: string,
 *  exclude: string,
 *  standalone: string,
 *  bundle: boolean,
 *  debug: boolean,
 *  minify: boolean,
 *  coverage: boolean,
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
function simplifyify (globs, options) {
  options = options || {};

  let events = new EventEmitter();
  simplifyifyAsync(globs, options, events);
  return events;
}

/**
 * Do everything asynchronously, even parameter validation.
 *
 * @param {string|string[]} globs - One or more file paths and/or glob patterns
 * @param {Options} options -  Simplifyify CLI options
 * @param {EventEmitter} events - Emits Browserify events
 */
function simplifyifyAsync (globs, options, events) {
  Promise.resolve()
    .then(() => {
      // Validate the entry files
      if (!globs || globs.length === 0) {
        events.emit("error", new Error("No entry files were specified"));
        return;
      }

      if (!Array.isArray(globs)) {
        globs = [globs];
      }

      // Expand the glob(s) into a list of entry files and output files
      return expandGlobs(globs, options);
    })
    .then((fileSets) => {
      if (fileSets.length === 0) {
        events.emit("error", new Error("No matching entry files were found"));
        return;
      }

      for (let fileSet of fileSets) {
        // Do this synchronously, so that files like package.json, bundle.txt, etc.
        // are only read once, and cached versions are used for subsequent bundles
        writeBundles(fileSet, events, options);
      }
    })
    .catch((error) => {
      events.emit("error", error);
    });
}
