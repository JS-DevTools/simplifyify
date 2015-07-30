'use strict';

var glob    = require('glob'),
    path    = require('path'),
    FileSet = require('./file-set'),
    util    = require('./util');

module.exports = expandGlobs;

/**
 * Expands the given list of file paths and/or globs, and returns an array of {@link FileSet} objects
 * that map input files to their corresponding output files.
 *
 * @param {string[]} globs - Entry file paths and/or glob patterns
 * @param {Options} options
 * @returns {FileSet[]}
 */
function expandGlobs(globs, options) {
  var matches = [];

  var globOptions = {
    strict: true,   // throw errors if unable to read directory contents
    nodir: true,    // only match files, not directories
    ignore: options.exclude ? [options.exclude] : []
  };

  var outfileIsADirectory = isDirectory(options.outfile);

  globs.forEach(function(pattern) {
    if (outfileIsADirectory) {
      var baseDir = getBaseDir(pattern);
    }

    // Find all files that match this glob pattern
    var entryFiles = glob.sync(pattern, globOptions);
    entryFiles.forEach(function(entryFile) {
      var fileSet = new FileSet();
      fileSet.entryFile = entryFile;

      if (outfileIsADirectory) {
        fileSet.outputFile = rename(entryFile, baseDir, options.outfile);
      }
      else if (options.outfile) {
        fileSet.outputFile = options.outfile;
      }
      else {
        fileSet.outputFile = util.appendToFileName(entryFile, '.bundle');
      }

      if (options.debug) {
        fileSet.mapFile = fileSet.outputFile + '.map';
      }

      matches.push(fileSet);
    });
  });

  return matches;
}

/**
 * Determines the base directory of the given glob pattern.
 * This is used to determine the relative paths of matched files.
 *
 * @param {string} pattern
 * @returns {string}
 */
function getBaseDir(pattern) {
  // Some examples:
  //  - *.js                          =>  .
  //  - dir/**/*.js                   =>  dir
  //  - dir/subdir/main-*.js          =>  dir/subdir
  //  - dir/subdir/index.js           =>  dir/subdir
  //  - dir/subdir/index.(js|coffee)  =>  dir/subdir

  var wildcard = pattern.indexOf('*');
  if (wildcard >= 0) {
    pattern = pattern.substr(0, wildcard + 1);
  }
  return path.dirname(pattern);
}

/**
 * Determines whether the given output filename is a directory.
 *
 * @param {string} pattern
 */
function isDirectory(pattern) {
  if (pattern) {
    var basename = path.basename(pattern);
    if (basename.indexOf('*') >= 0) {
      // The pattern includes a filename pattern (e.g. "dist/*.min.js"),
      // which counts as a directory path
      return true;
    }
    else if (basename.indexOf('.') === -1) {
      // The pattern has no file extension, so assume it's a directory
      return true;
    }
  }

  return false;
}

/**
 * Returns the output file name, based on the the entry file name, the base directory,
 * and the output path/pattern.
 *
 * @param {string} file - The source file path and name (e.g. "lib/subdir/my-file.js")
 * @param {string} baseDir - The directory to calculate the relative path from (e.g. "lib")
 * @param {string} namePattern - The output file path and pattern (e.g. "dest/*.min.js")
 * @returns {string} - The main output file path and name (e.g. "dest/subdir/my-file.min.js")
 */
function rename(file, baseDir, namePattern) {
  var fileExtName = path.extname(file);                                       // .js
  var fileBaseName = path.basename(file, fileExtName);                        // my-file
  var relativeDir = path.dirname(path.relative(baseDir, file));               // subdir

  var patternFileName = path.basename(namePattern);                           // *.min.js
  var patternDir;
  if (patternFileName.indexOf('*') === -1) {
    patternDir = namePattern;                                                 // dest
  }
  else {
    patternDir = getBaseDir(namePattern);                                     // dest
    fileExtName = patternFileName.substr(patternFileName.indexOf('*') + 1);   // .min.js
  }

  var outputDir = path.join(patternDir, relativeDir);                         // dest/subdir
  return path.join(outputDir, fileBaseName + fileExtName);                    // dest/subdir/my-file.min.js
}
