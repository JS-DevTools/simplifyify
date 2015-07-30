'use strict';

module.exports = FileSet;

/**
 * The input & output files for a Browserify bundle
 *
 * @constructor
 */
function FileSet() {
  /**
   * The entry file for a CommonJS module
   * @type {string}
   */
  this.entryFile = '';

  /**
   * The output file for a Browserify bundle
   * @type {string}
   */
  this.outputFile = '';

  /**
   * The source map file for a Browserify bundle
   * @type {string}
   */
  this.mapFile = '';
}
