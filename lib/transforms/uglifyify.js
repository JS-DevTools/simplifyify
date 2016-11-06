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
 * @param {Browserify} bundler - The Browserify or Watchify instance
 * @param {object} [options] - The Uglifyify options, if any
 */
function applyUglifyify (bundler, options) {
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
  bundler.transform(uglifyify, options);

  // Change the options a bit for PHASE 2
  let postProcessingOptions = util.cloneObj(options);
  let outputFile = path.resolve(bundler.files.outputFile);
  let mapFile;

  // Don't mangle again, since that was already done in PHASE 1
  postProcessingOptions.mangle = false;
  postProcessingOptions.mangleProperties = false;

  // If the bundle has a sourcemap, then UglifyJS needs to modify it
  if (bundler.files.mapFile) {
    mapFile = path.resolve(bundler.files.mapFile);
    postProcessingOptions.inSourceMap = mapFile;
    postProcessingOptions.outSourceMap = mapFile;
    postProcessingOptions.sourceMapUrl = path.basename(mapFile);
  }

  // PHASE 2 - Minify the entire bundle file
  bundler.postProcessing = function () {
    let minified = uglify.minify(outputFile, postProcessingOptions);

    // Overwrite the file(s) from PHASE 1
    fs.writeFileSync(outputFile, minified.code);

    if (mapFile) {
      // Replace the absolute path with the relative path
      let map = JSON.parse(minified.map);
      map.file = path.basename(outputFile);
      fs.writeFileSync(mapFile, JSON.stringify(map));
    }
  };
}
