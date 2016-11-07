'use strict';

const fs = require('fs');
const path = require('path');
const uglify = require('uglify-js');
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

  if (options.global === undefined) {
    // Apply uglifyify to ALL modules in the bundle, even third-party ones
    options.global = true;
  }

  if (options.exts === undefined) {
    // Uglify can minify JavaScript and JSON files
    options.exts = ['.js', '.json'];
  }

  if (options.output === undefined) {
    options.output = {
      // Keep important comments when minifying
      comments: /^!|^\*!|@preserve|@license|@cc_on/,
    };
  }

  // PHASE 1 - Minify each module individually
  browserify.transform(uglifyify, options);

  // Change the options a bit for PHASE 2
  let postProcessingOptions = util.cloneObj(options);
  let bundleFile = path.resolve(browserify.files.outputFile);
  let mapFile;

  // Don't mangle again, since that was already done in PHASE 1
  postProcessingOptions.mangle = false;
  postProcessingOptions.mangleProperties = false;

  // If the bundle has a sourcemap, then UglifyJS needs to modify it
  if (browserify.files.mapFile) {
    mapFile = path.resolve(browserify.files.mapFile);
    postProcessingOptions.inSourceMap = mapFile;
    postProcessingOptions.outSourceMap = mapFile;
    postProcessingOptions.sourceMapUrl = path.basename(mapFile);
  }

  // PHASE 2 - Minify the entire bundle file
  browserify.postProcessing = function () {
    return phase2()
      .then(overwriteBundle)
      .then(overwriteSourcemap);
  };

  // Minify the entire bundle using UglifyJS
  function phase2 () {
    return new Promise(resolve => {
      let minified = uglify.minify(bundleFile, postProcessingOptions);
      resolve(minified);
    });
  }

  // Overwrite the bundle file from PHASE 1
  function overwriteBundle (minified) {
    return new Promise((resolve, reject) => {
      fs.writeFile(bundleFile, minified.code, err => err ? reject(err) : resolve(minified));
    });
  }

  // Overwrite the sourcemap file from PHASE 1
  function overwriteSourcemap (minified) {
    return new Promise((resolve, reject) => {
      if (!mapFile) {
        // There is no sourcemap, so we don't need to do anything
        return resolve();
      }

      // Replace the absolute path with the relative path
      let map = JSON.parse(minified.map);
      map.file = path.basename(bundleFile);

      // Overwrite the file
      fs.writeFile(mapFile, JSON.stringify(map), err => err ? reject(err) : resolve(minified));
    });
  }
}
