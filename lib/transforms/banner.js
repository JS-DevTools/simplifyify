"use strict";

const path = require("path");
const cache = require("../fs-cache");
const banner = require("browserify-banner");

module.exports = applyBanner;

/**
 * Adds the Banner transform to the given Browserify or Watchify instance.
 *
 * @param {Browserify} browserify - The Browserify or Watchify instance
 * @param {object} manifest - The project manifest (package.json file)
 * @param {object} [options] - The Banner options, if any
 */
function applyBanner (browserify, manifest, options) {
  options = options || {};

  if (!options.pkg) {
    // Default to the project manifest
    options.pkg = manifest;
  }

  if (!options.file) {
    // If there's a "banner.txt" file, then use it as the banner template
    let bannerPath = path.join(path.dirname(browserify.files.entryFile), "banner.txt");
    bannerPath = cache.findFile(bannerPath);
    if (bannerPath) {
      options.template = cache.readTextFile(bannerPath);
    }
  }

  if (options.file || options.template || options.banner) {
    browserify.plugin(banner, options);
  }
}
