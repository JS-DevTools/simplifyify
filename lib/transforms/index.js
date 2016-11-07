'use strict';

const ono = require('ono');
const util = require('../util');
const cache = require('../fs-cache');
const applyIstanbul = require('./istanbul');
const applyUglifyify = require('./uglifyify');
const applyBannerify = require('./bannerify');

module.exports = Transforms;

/**
 * Provides easy access to the Browserify transforms from the project manifest.
 *
 * @param {string} startingDir - The directory to start searching for the manifest file
 * @constructor
 */
function Transforms (startingDir) {
  /**
   * The entire project manifest
   * @type {object}
   */
  this.manifest = readProjectManifest(startingDir);

  /**
   * The Uglifyify transform options
   * @type {object}
   */
  this.uglifyify = getTransformOptions(this.manifest, 'uglifyify');

  /**
   * The Istanbul transform options
   * @type {object}
   */
  this.istanbul = getTransformOptions(this.manifest, 'istanbul');

  /**
   * The Bannerify transform options
   *
   * NOTE: Bannerify is a plugin, not a transform, so it can't be configured
   * via the package.json file.
   *
   * @type {object}
   */
  this.bannerify = { file: 'banner.txt' };

  /**
   * All other Browserify transforms from the project manifest
   * @type {array}
   */
  this.others = omitTransformOptions(this.manifest, ['uglifyify', 'istanbul', 'bannerify']);
}

/**
 * Configures the given Browserify or Watchify instance to use these transforms.
 *
 * @param {Browserify} browserify - The Browserify or Watchify instance
 * @param {object}  [options]
 * @param {boolean} [options.minify] - Whether to include the uglifyify transform
 * @param {boolean} [options.test] - Whether to include the istanbul transform
 */
Transforms.prototype.apply = function applyTransforms (browserify, options) {
  try {
    options = options || {};

    // Add any user-defined transforms first
    this.others.forEach(transform => {
      browserify.transform(require(transform[0]), transform[1]);
    });

    // Then minify
    if (options.minify) {
      applyUglifyify(browserify, this.uglifyify);
    }

    // Add code-coverage AFTER uglifyify, so it doesn't get mangled
    if (options.test) {
      applyIstanbul(browserify, this.istanbul);
    }
  }
  catch (e) {
    throw ono(e, 'Error adding Browserify transforms');
  }
};

/**
 * Sets Browserify options, based on the transforms that are being used.
 *
 * @param {object} browserifyOptions - The existing Browserify/Watchify options
 * @returns {object}
 */
Transforms.prototype.setBrowserifyOptions = function setBrowserifyOptions (browserifyOptions) {
  // Inject the banner text into the Browserify prelude
  applyBannerify(this.manifest, browserifyOptions, this.bannerify);
};

/**
 * Reads the project manifest (package.json file) and returns
 * it as a normalized object.
 *
 * @param {string} manifestPath - The path of the manifest file
 */
function readProjectManifest (manifestPath) {
  // Find the manifest file by crawling up the directory tree
  manifestPath = cache.findFile(manifestPath);

  // Parse the manifest
  let manifest = {};
  if (manifestPath) {
    manifest = cache.readJsonFile(manifestPath);
  }

  // Normalize the manifest
  manifest.browserify = manifest.browserify || {};
  manifest.browserify.transform = manifest.browserify.transform || [];

  return manifest;
}

/**
 * Returns the specified transform's options, if any.
 *
 * @param {object} manifest - The project manifest (package.json file)
 * @param {string} name - The name of the transform whose options are returned
 * @returns {object|undefined}
 */
function getTransformOptions (manifest, name) {
  let options;
  manifest.browserify.transform.some(transform => {
    if (Array.isArray(transform) && transform[0] === name) {
      options = util.cloneObj(transform[1]);
    }
  });
  return options;
}

/**
 * Returns all Browserify transform options, except the omitted ones
 *
 * @param {object} manifest - The project manifest (package.json file)
 * @param {string[]} omit - The names of the transforms to omit
 * @returns {array}
 */
function omitTransformOptions (manifest, omit) {
  let transforms = [];

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

    // Add the transform, unless it's one of the omitted ones
    if (omit.indexOf(name) === -1) {
      transforms.push([name, config]);
    }
  });

  return transforms;
}
