'use strict';

const ono = require('ono');
const util = require('../util');
const applyIstanbul = require('./istanbul');
const applyUglifyify = require('./uglifyify');
const applyBannerify = require('./bannerify');

module.exports = Transforms;

/**
 * Provides easy access to the Browserify transforms from the project manifest.
 *
 * @param {object} manifest - The project manifest (package.json file)
 * @constructor
 */
function Transforms (manifest) {
  manifest.browserify = manifest.browserify || {};
  manifest.browserify.transform = manifest.browserify.transform || [];

  /**
   * The entire project manifest
   * @type {object}
   */
  this.manifest = manifest;

  /**
   * The Uglifyify transform options
   * @type {object}
   */
  this.uglifyify = getTransformOptions(manifest, 'uglifyify');

  /**
   * The Istanbul transform options
   * @type {object}
   */
  this.istanbul = getTransformOptions(manifest, 'istanbul');

  /**
   * The Bannerify transform options
   * @type {object}
   */
  this.bannerify = getTransformOptions(manifest, 'bannerify');

  /**
   * All other Browserify transforms from the project manifest
   * @type {array}
   */
  this.others = omitTransformOptions(manifest, ['uglifyify', 'istanbul', 'bannerify']);
}

/**
 * Configures the given Browserify or Watchify instance to use these transforms.
 *
 * @param {Browserify} bundler - The Browserify or Watchify instance
 * @param {object}  [options]
 * @param {boolean} [options.minify] - Whether to include the uglifyify transform
 * @param {boolean} [options.test] - Whether to include the istanbul transform
 */
Transforms.prototype.apply = function applyTransforms (bundler, options) {
  try {
    options = options || {};

    // Add any user-defined transforms first
    this.others.forEach(transform => {
      bundler.transform(require(transform[0]), transform[1]);
    });

    // Then minify
    if (options.minify) {
      applyUglifyify(bundler, this.uglifyify);
    }

    // Add code-coverage AFTER uglifyify, so it doesn't get mangled
    if (options.test) {
      applyIstanbul(bundler, this.istanbul);
    }
  }
  catch (e) {
    throw ono(e, 'Error adding Browserify transforms');
  }
};

/**
 * Returns initialization options for Browserify or Watchify, based on the
 * transforms that are being used.
 *
 * @param {object} browserifyOptions - The existing Browserify/Watchify options
 * @returns {object}
 */
Transforms.prototype.getBrowserifyOptions = function applyBrowserifyOptions (browserifyOptions) {
  return applyBannerify(this.manifest, browserifyOptions, this.bannerify);
};

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
