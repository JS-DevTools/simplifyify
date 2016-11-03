'use strict';

const fs = require('fs');
const path = require('path');
const ono = require('ono');
const uglify = require('uglify-js');
const uglifyify = require('uglifyify');
const istanbul = require('browserify-istanbul');

module.exports = addTransforms;

/**
 * Adds Browserify transforms.
 *
 * @param {Browserify} bundler - The Browserify or Watchify instance
 * @param {object} manifest - The project manifest (package.json file)
 * @param {object} [options]
 * @param {boolean} [options.minify] - Whether to add the uglifyify transform
 * @param {boolean} [options.test] - Whether to add the istanbul transform
 */
function addTransforms (bundler, manifest, options) {
  try {
    options = options || {};
    manifest.browserify = manifest.browserify || {};
    manifest.browserify.transform = manifest.browserify.transform || [];

    // Add any user-defined transforms first
    addTransformsFromManifest(bundler, manifest);

    // Then minify
    if (options.minify) {
      addUglifyifyTransform(bundler, manifest);
    }

    // Add code-coverage instrumentation last, so it's not mangled by uglify
    if (options.test) {
      addIstanbulTransform(bundler, manifest);
    }
  }
  catch (e) {
    throw ono(e, 'Error adding Browserify transforms');
  }
}

/**
 * Adds any Browserify transforms that are specified in the project manifest.
 *
 * @param {Browserify} bundler - The Browserify or Watchify instance
 * @param {object} manifest - The project manifest (package.json file)
 */
function addTransformsFromManifest (bundler, manifest) {
  manifest.browserify.transform.forEach(transform => {
    // Each transform can be a string (just the transform name)
    // or an array (the transform name and its config)
    let name, config;
    if (Array.isArray(transform)) {
      name = transform[0];
      config = transform[1];
    }
    else {
      name = transform;
      config = undefined;
    }

    // Add the transform, unless it's one of the ones that we handle separately
    if (name !== 'uglifyify' && name !== 'istanbul') {
      bundler.transform(require(name), config);
    }
  });
}

/**
 * Adds the Istanbul transform, which adds code-coverage instrumentation.
 *
 * @param {Browserify} bundler - The Browserify or Watchify instance
 * @param {object} manifest - The project manifest (package.json file)
 */
function addIstanbulTransform (bundler, manifest) {
  let options = getTransformOptions('istanbul', manifest) || {
    // Replace Istanbul's default "ignore" list with our own
    defaultIgnore: false,
    ignore: [
      '**/node_modules/**', '**/bower_components/**',
      '**/*.json', '**/*.html', '**/*.md', '**/*.txt'
    ],
  };

  bundler.transform(istanbul(options));
}

/**
 * Adds the Uglifyify transform to minify the bundle.
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
 * @param {object} manifest - The project manifest (package.json file)
 */
function addUglifyifyTransform (bundler, manifest) {
  let options = getTransformOptions('uglifyify', manifest) || {};

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
  let postProcessingOptions = cloneObj(options);
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

/**
 * Returns the specified transform's options from the manifest file, if any.
 *
 * @param {string} name - The name of the transform whose options are returned
 * @param {object} manifest - The project manifest (package.json file), to search for options
 * @returns {object|undefined}
 */
function getTransformOptions (name, manifest) {
  let options;
  manifest.browserify.transform.some(transform => {
    if (Array.isArray(transform) && transform[0] === name) {
      options = cloneObj(transform[1]);
    }
  });
  return options;
}

/**
 * A simple recursive cloning function for JSON data
 *
 * @param {object|array} obj
 * @returns {object|array}
 */
function cloneObj (obj) {
  let clone = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach(key => {
    let value = obj[key];
    if (value && typeof value === 'object') {
      value = cloneObj(value);
    }
    clone[key] = value;
  });
  return clone;
}
