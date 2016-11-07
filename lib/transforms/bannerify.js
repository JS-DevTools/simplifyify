'use strict';

const _ = require('lodash');
const path = require('path');
const moment = require('moment');
const cache = require('../fs-cache');

module.exports = applyBannerify;

/**
 * The "bannerify" Browserify plug-in does not work properly with sourcemaps,
 * so instead, we emulate the "bannerify" behavior, but inject the banner into
 * the Browserify prelude, which doesn't mess up the sourcemap.
 *
 * @param {object} manifest - The project manifest (package.json file)
 * @param {object} browserifyOptions - The existing Browserify options
 * @param {object} [bannerifyOptions] - The Bannerify options, if any
 */
function applyBannerify (manifest, browserifyOptions, bannerifyOptions) {
  let banner;

  if (bannerifyOptions.file) {
    // Read the banner template from a file
    let bannerPath = path.join(path.dirname(browserifyOptions.entries), bannerifyOptions.file);
    bannerPath = cache.findFile(bannerPath);
    if (bannerPath) {
      bannerifyOptions.template = cache.readTextFile(bannerPath);
    }
  }

  if (bannerifyOptions.template) {
    // Compile the banner template
    banner = compile(bannerifyOptions.template, manifest).trim();

    if (!/^\s*(\/\/|\/\*)/.test(banner)) {
      // Convert the banner to a comment block
      banner = '/*!\n * ' + banner.replace(/\n/g, '\n * ') + '\n */';
    }
  }

  if (banner) {
    // We need to inject the banner into the Browserify prelude
    browserifyOptions.preludePath = require.resolve('browser-pack/_prelude.js');
    let prelude = cache.readTextFile(browserifyOptions.preludePath);

    if (browserifyOptions.standalone) {
      // For UMD, the banner has to come AFTER the prelude; otherwise, the banner would
      // occur in the middle of a `return` statement, and the exports would be lost
      browserifyOptions.prelude = `${prelude}\n${banner}`;
    }
    else {
      // For non-UMD bundles, the banner can safely come before the prelude
      browserifyOptions.prelude = `${banner}\n${prelude}`;
    }
  }
}

/**
 * Compiles the banner template against the project manifest
 *
 * @param {string} template - The template, which can include <%= placeholders %>
 * @param {object} manifest - The project manifest (package.json file), which is available to the template
 * @returns {string}
 */
function compile (template, manifest) {
  return _.template(template)({
    moment,
    pkg: manifest,
  });
}
