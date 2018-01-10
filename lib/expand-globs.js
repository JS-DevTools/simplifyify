'use strict';

const glob = require('glob');
const path = require('path');
const FileSet = require('./file-set');
const util = require('./util');

module.exports = expandGlobs;

/**
 * Expands the given list of file paths and/or globs, and returns an array of {@link FileSet} objects
 * that map input files to their corresponding output files.
 *
 * @param {string[]} globs - Entry file paths and/or glob patterns
 * @param {Options} options - Simplifyify CLI options
 * @returns {FileSet[]}
 */
function expandGlobs (globs, options) {
  let matches = [];

  let globOptions = {
    strict: true,   // throw errors if unable to read directory contents
    nodir: true,    // only match files, not directories
    ignore: options.exclude ? [options.exclude] : []
  };

  let outfileIsADirectory = isDirectory(options.outfile);

  globs.forEach(pattern => {
    let baseDir;

    if (outfileIsADirectory) {
      baseDir = getBaseDir(pattern);
    }

    // Find all files that match this glob pattern
    let entryFiles = glob.sync(pattern, globOptions);
    entryFiles.forEach(entryFile => {
      let fileSet = new FileSet();
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

      if (options.standalone) {
        fileSet.standalone = getStandalone(entryFile, pattern, options.standalone);
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
 * @param {string} pattern - A glob pattern, such as "dir/subdir/*.js"
 * @returns {string}
 */
function getBaseDir (pattern) {
  // Some examples:
  //  - *.js                          =>  .
  //  - dir/**/*.js                   =>  dir
  //  - dir/subdir/main-*.js          =>  dir/subdir
  //  - dir/subdir/index.js           =>  dir/subdir
  //  - dir/subdir/index.(js|coffee)  =>  dir/subdir

  let wildcard = pattern.indexOf('*');
  if (wildcard >= 0) {
    pattern = pattern.substr(0, wildcard + 1);
  }
  return path.dirname(pattern);
}

/**
 * Determines whether the given output filename is a directory.
 *
 * @param {string} pattern - A file path, a directory path, or a pattern, such as "dist/*.bundle.js"
 * @returns {boolean}
 */
function isDirectory (pattern) {
  if (pattern) {
    let basename = path.basename(pattern);
    if (basename.includes('*')) {
      // The pattern includes a filename pattern (e.g. "dist/*.bundle.js"),
      // which counts as a directory path
      return true;
    }
    else if (!basename.includes('.')) {
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
 * @param {string} file - The source file path and name (e.g. "lib/dir/subdir/my-file.js")
 * @param {string} baseDir - The directory to calculate the relative path from (e.g. "lib")
 * @param {string} namePattern - The output file path and pattern (e.g. "dest/*.bundle.js")
 * @returns {string} - The main output file path and name (e.g. "dest/dir/subdir/my-file.bundle.js")
 */
function rename (file, baseDir, namePattern) {
  let fileExtName = path.extname(file);                                       // .js
  let fileBaseName = path.basename(file, fileExtName);                        // my-file
  let relativeDir = path.dirname(path.relative(baseDir, file));               // dir/subdir

  let patternFileName = path.basename(namePattern);                           // *.bundle.js
  let patternDir;
  if (!patternFileName.includes('*')) {
    patternDir = namePattern;                                                 // dest
  }
  else {
    patternDir = getBaseDir(namePattern);                                     // dest
    fileExtName = patternFileName.substr(patternFileName.indexOf('*') + 1);   // .bundle.js
  }

  let outputDir = path.join(patternDir, relativeDir);                         // dest/dir/subdir
  return path.join(outputDir, fileBaseName + fileExtName);                    // dest/dir/subdir/my-file.bundle.js
}

/**
 * Returns the output file name, based on the the entry file name, the base directory,
 * and the output path/pattern.
 *
 * @param {string} file - The source file path and name (e.g. "my-module/sub-module.js")
 * @param {string} filePattern - The pattern that got the file (e.g. "my-module/*.js")
 * @param {string} namePattern - The standalone option pattern (e.g. "my-module-*")
 * @returns {string} - The UMD standalone module name (e.g. "my-module-sub-module")
 */
function getStandalone (file, filePattern, standalonePattern) {
  let starIndex = filePattern.indexOf('*');

  if (starIndex === -1) {
    return standalonePattern;
  }

  let regExpString = Array.from(filePattern)
    .map((character, index) =>
      index === starIndex
        // replace the star with a capture
        ? '(.*)'
        // replace the character with a unicode escape
        : `\\u${`000${character.charCodeAt(0).toString(16)}`.substr(-4)}`)
    .join('');
  let globRegExp = new RegExp(regExpString);
  let match = file.match(globRegExp);
  let standaloneName = standalonePattern.replace('*', match ? match[1] : '');

  return standaloneName;
}
