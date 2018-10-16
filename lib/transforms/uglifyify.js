'use strict';

const path = require('path');
const uglify = require('uglify-es');
const uglifyify = require('uglifyify');
const util = require('../util');

module.exports = applyUglifyify;

/**
 * Adds the Uglifyify transform to the given Browserify or Watchify instance.
 *
 * Minification is done in two phases, both using UglifyJS:
 *
 *  PHASE 1 - The first phase occurs as a Browserify transform, which minifies each module
 *            individually. This allows Uglify to eliminate dead code paths within each module.
 *
 *  PHASE 2 - The second phase occurs after Browserify is finished, and minifies the entire
 *            bundle file. This allows Uglify to achieve the smallest possible file size.
 *
 * @param {Browserify} browserify - The Browserify or Watchify instance
 * @param {object} [options] - The Uglifyify options, if any
 */
function applyUglifyify (browserify, options) {
  options = options || {};
  let hasSourcemap = !!browserify.files.mapFile;
  let bundlePath = path.resolve(browserify.files.outputFile);
  let sourcemapPath = hasSourcemap && path.resolve(browserify.files.mapFile);

  if (options.global === undefined) {
    // Apply uglifyify to ALL modules in the bundle, even third-party ones
    options.global = true;
  }

  if (options.exts === undefined) {
    // Apply uglifyify to all JavaScript, JSON, or TypeScript files
    options.exts = ['.js', '.json', '.es6', '.esm', '.jsm', '.jsx', '.ts', '.tsx'];
  }

  if (options.output === undefined) {
    options.output = {
      // Keep important comments when minifying
      comments: /^!|^\*!|@preserve|@license|@cc_on/,
    };
  }

  // PHASE 1 - Minify each module individually
  browserify.transform(uglifyify, util.deepClone(options));

  // PHASE 2 - Minify the entire bundle file
  browserify.postProcessing = function () {
    return Promise.all(
      [
        util.readFile(bundlePath),
        hasSourcemap && util.readFile(sourcemapPath),
      ])
      .then(phase2)
      .then(overwriteBundle)
      .then(overwriteSourcemap);
  };

  // Minify the entire bundle using UglifyJS
  function phase2 (code) {
    return Promise.resolve()
      .then(() => {
        let bundleCode = code[0];
        let sourcemapCode = code[1];

        // For PHASE 2, we don't need to perform additional mangling, compressing,
        // comment-removal, etc., since that has already been done in PHASE 1
        options = {
          mangle: false,
          compress: false,
          output: Object.assign({}, options.output, {
            comments: true,
          }),
        };

        // If the bundle has a sourcemap, then UglifyJS needs to modify it
        if (hasSourcemap) {
          options.sourceMap = {
            content: sourcemapCode,
            url: path.basename(sourcemapPath),
            filename: path.basename(bundlePath),
          };
        }

        let minified = uglify.minify(bundleCode, options);

        if (minified.error) {
          throw minified.error;
        }
        else {
          return minified;
        }
      });
  }

  // Overwrite the bundle file from PHASE 1
  function overwriteBundle (minified) {
    return util.writeFile(bundlePath, minified.code)
      .then(() => minified);
  }

  // Overwrite the sourcemap file from PHASE 1
  function overwriteSourcemap (minified) {
    if (hasSourcemap) {
      // Parse the sourcemap so we format it using JSON.stringify()
      let map = JSON.parse(minified.map);

      return util.writeFile(sourcemapPath, JSON.stringify(map, null, 2));
    }
  }
}
