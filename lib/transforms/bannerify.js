'use strict';

const _ = require('lodash');
const path = require('path');
const moment = require('moment');
const through = require('through2');
const util = require('../util');

module.exports = applyBannerify;

/**
 * Adds the Bannerify transform to the given Browserify or Watchify instance.
 *
 * @param {Browserify} bundler - The Browserify or Watchify instance
 * @param {object} [options] - The Bannerify options, if any
 * @returns {object}
 */
function applyBannerify (bundler, manifest, options) {
  options = options || { file: 'banner.txt' };

  if (options.file) {
    // Read the banner file ONCE, and cache the results
    let startingDir = path.dirname(bundler.files.entryFile);
    options.template = util.findFile(startingDir, options.file);
    delete options.file;
  }

  if (options.template) {
    // Compile the banner file ONCE, and cache the results
    options.banner = compile(options.template, manifest);
    delete options.template;
  }

  if (options.banner) {
    bundler.plugin(bannerify, options);
  }
  return options;
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

/**
 * This function emulates the "bannerify" Browserify plugin (https://github.com/zemirco/bannerify).
 * We don't use the real plugin due to bugs (https://github.com/zemirco/bannerify/issues)
 * that haven't been fixed.
 *
 * @param {Browserify} bundler - The Browserify or Watchify instance
 * @param {object} options - The Bannerify options
 * @returns {object}
 */
function bannerify (bundler, options) {
  bundler.on('bundle', () => {
    let written = false;
    bundler.pipeline.get('wrap').push(through(function (chunk, enc, next) {
      if (!written) {
        this.push(new Buffer(options.banner));
        written = true;
      }
      this.push(chunk);
      next();
    }));
  });
}
