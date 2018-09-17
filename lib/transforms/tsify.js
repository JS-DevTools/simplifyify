'use strict';

const path = require('path');
const cache = require('../fs-cache');
const tsify = require('tsify');

module.exports = applyTSify;

/**
 * Adds the TSify plugin to the given Browserify or Watchify instance.
 *
 * @param {Browserify} browserify - The Browserify or Watchify instance
 * @param {object} [options] - The TSify options, if any
 */
function applyTSify (browserify, options) {
  if (!options) {
    // No TypeScript options were set in package.json, so look for a tsconfig.json file
    let tsConfigPath = path.join(path.dirname(browserify.files.entryFile), 'tsconfig.json');
    tsConfigPath = cache.findFile(tsConfigPath);

    if (tsConfigPath) {
      // Configure TSify to use the tsconfig.json file
      options = { project: tsConfigPath };
    }
    else {
      // Configure TSify with default options
      options = {
        project: {
          compilerOptions: {
            target: 'esnext',
            module: 'commonjs',
            moduleResolution: 'node',
            resolveJsonModule: true,
            esModuleInterop: true,
            jsx: 'react',
          },

          // An empty files array causes TSify to use the Browserify entry file(s)
          files: [],

          // Don't transpile stuff in node_modules
          exclude: [
            'node_modules'
          ],
        },
      };
    }
  }

  browserify.plugin(tsify, options);
}
