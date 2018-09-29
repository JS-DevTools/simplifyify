'use strict';

const ono = require('ono');
const util = require('../util');
const cache = require('../fs-cache');
const applyTSify = require('./tsify');
const applyIstanbul = require('./istanbul');
const applyUglifyify = require('./uglifyify');
const applyBanner = require('./banner');

/**
 * Provides easy access to the Browserify transforms from the project manifest.
 */
class Transforms {
  /**
   * @param {string} startingDir - The directory to start searching for the manifest file
   */
  constructor (startingDir) {
    /**
     * The entire project manifest
     * @type {object}
     */
    this.manifest = readProjectManifest(startingDir);

    /**
     * The TSify (TypeScript) transform options
     * @type {object}
     */
    this.tsify = getBrowserifyOptions(this.manifest, 'plugins', 'tsify');

    /**
     * The Uglifyify transform options
     * @type {object}
     */
    this.uglifyify = getBrowserifyOptions(this.manifest, 'transform', 'uglifyify');

    /**
     * The Istanbul transform options
     * @type {object}
     */
    this.istanbul = getBrowserifyOptions(this.manifest, 'transform', 'browserify-istanbul');

    /**
     * The Banner transform options
     * @type {object}
     */
    this.banner = getBrowserifyOptions(this.manifest, 'plugins', 'browserify-banner');

    /**
     * All other Browserify transforms from the project manifest
     * @type {array}
     */
    this.otherTransforms = omitBrowserifyOptions(this.manifest, 'transform', [
      'uglifyify', 'browserify-istanbul']);

    /**
     * All other Browserify plugins from the project manifest
     * @type {array}
     */
    this.otherPlugins = omitBrowserifyOptions(this.manifest, 'plugins', [
      'tsify', 'browserify-banner']);
  }

  /**
   * Configures the given Browserify or Watchify instance to use these transforms.
   *
   * @param {Browserify} browserify - The Browserify or Watchify instance
   * @param {object}  [options]
   * @param {boolean} [options.minify] - Whether to include the uglifyify transform
   * @param {boolean} [options.coverage] - Whether to include the istanbul transform
   */
  apply (browserify, options) {
    try {
      options = options || {};

      // Add any user-defined transforms first
      for (let [name, config] of this.otherTransforms) {
        browserify.transform(require(name), config);
      }

      // Then any user-defined plugins
      for (let [name, config] of this.otherPlugins) {
        browserify.transform(require(name), config);
      }

      // Transpile TypeScript
      if (options.typescript) {
        applyTSify(browserify, this.tsify);
      }

      // Then minify
      if (options.minify) {
        applyUglifyify(browserify, this.uglifyify);
      }

      // Add code-coverage AFTER uglifyify, so it doesn't get mangled
      if (options.coverage) {
        applyIstanbul(browserify, this.istanbul);
      }

      // Add the banner last
      applyBanner(browserify, this.manifest, this.banner);
    }
    catch (e) {
      throw ono(e, 'Error adding Browserify transforms');
    }
  }
}

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
  manifest.browserify.plugins = manifest.browserify.plugins || [];

  return manifest;
}

/**
 * Returns the specified transform's or plugin's options from the project manifest (package.json).
 * If no options are set, then undefined is returned.
 *
 * @param {object} manifest - The project manifest (package.json file)
 * @param {string} type - "transform" or "plugins"
 * @param {string} name - The name of the transform/plugin whose options are returned
 * @returns {object|undefined}
 */
function getBrowserifyOptions (manifest, type, name) {
  for (let tuple of manifest.browserify[type]) {
    if (Array.isArray(tuple)) {
      let [_name, config] = tuple;

      if (_name === name) {
        return util.deepClone(config);
      }
    }
  }
}

/**
 * Returns all Browserify transform/plugin options, except the omitted ones
 *
 * @param {object} manifest - The project manifest (package.json file)
 * @param {string} type - "transform" or "plugins"
 * @param {string[]} omit - The names of the transforms to omit
 * @returns {array}
 */
function omitBrowserifyOptions (manifest, type, omit) {
  let included = [];

  for (let tuple of manifest.browserify[type]) {
    let name, config;

    // Each transform can be a string (just the transform name)
    // or an array (the transform name and its options)
    if (Array.isArray(tuple)) {
      [name, config] = tuple;
    }
    else {
      name = tuple;
      config = undefined;
    }

    // Add the transform, unless it's one of the omitted ones
    if (!omit.includes(name)) {
      included.push([name, config]);
    }
  }

  return included;
}

module.exports = Transforms;
