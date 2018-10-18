"use strict";

/**
 * The input & output files for a Browserify bundle
 */
class FileSet {
  constructor () {
    /**
     * The entry file for a CommonJS module
     * @type {string}
     */
    this.entryFile = "";

    /**
     * The output file for a Browserify bundle
     * @type {string}
     */
    this.outputFile = "";

    /**
     * The source map file for a Browserify bundle
     * @type {string}
     */
    this.mapFile = "";

    /**
     * The UMD standalone module name for a Browserify bundle
     * @type {string}
     */
    this.standalone = "";
  }
}

module.exports = FileSet;
