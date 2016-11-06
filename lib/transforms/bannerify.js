'use strict';

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const moment = require('moment');
const util = require('../util');

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
    let startingDir = path.dirname(browserifyOptions.entries);
    let bannerFile = util.findFile(startingDir, bannerifyOptions.file);
    if (bannerFile) {
      bannerifyOptions.template = fs.readFileSync(bannerFile, 'utf8');
    }
  }

  if (bannerifyOptions.template) {
    // Compile the banner template
    banner = compile(bannerifyOptions.template, manifest);

    if (!/^\s*(\/\/|\/\*)/.test(banner)) {
      // Convert the banner to a comment block
      banner = '/*!\n * ' + banner.trim().replace(/\n/g, '\n * ') + '\n */\n';
    }
  }

  if (banner) {
    // We need to inject the banner into the Browserify prelude
    let preludePath = require.resolve('browser-pack/_prelude.js');
    let prelude = fs.readFileSync(preludePath, { encoding: 'utf8' });
    browserifyOptions.prelude = banner + prelude;
    browserifyOptions.preludePath = preludePath;
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
