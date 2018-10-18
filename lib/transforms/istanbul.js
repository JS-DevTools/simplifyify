"use strict";

const istanbul = require("browserify-istanbul");

module.exports = applyIstanbul;

/**
 * Adds the Istanbul transform to the given Browserify or Watchify instance.
 *
 * @param {Browserify} browserify - The Browserify or Watchify instance
 * @param {object} [options] - The Istanbul options, if any
 */
function applyIstanbul (browserify, options) {
  options = options || {
    // Replace Istanbul's default "ignore" list with our own
    defaultIgnore: false,
    ignore: [
      "**/node_modules/**", "**/bower_components/**",
      "**/*.json", "**/*.html", "**/*.md", "**/*.txt"
    ],
  };

  browserify.transform(istanbul(options));
}
