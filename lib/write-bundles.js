'use strict';

const browserify = require('browserify');
const watchify = require('watchify');
const exorcist = require('exorcist');
const uglify = require('uglify-js');
const uglifyify = require('uglifyify');
const istanbul = require('browserify-istanbul');
const fs = require('fs');
const path = require('path');
const FileSet = require('./file-set');
const util = require('./util');
const ono = require('ono');

module.exports = writeBundles;

let istanbulOptions = {
  ignore: ['**/*.json', '**/*.html', '**/*.md', '**/*.txt'],
  defaultIgnore: false
};

/**
 * Writes Browserify bundles for the given entry file.
 * At least one bundle is created (the outputFile), but additional ones may be
 * created, depending on {@link Options.debug}, {@link Options.minify}, and {@link Options.test}.
 *
 * @param {FileSet} mainFiles - The main input & output files (not the minified or test files)
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 */
function writeBundles (mainFiles, events, options) {
  let bundlers = [];

  // If no output options are specified, then default to --bundle
  if (!options.bundle && !options.minify && !options.test) {
    options.bundle = true;
  }

  if (options.bundle) {
    bundlers.push(createMainBundler(mainFiles, events, options));
  }

  if (options.minify) {
    bundlers.push(createMinifiedBundler(mainFiles, events, options));
  }

  if (options.test) {
    bundlers.push(createTestBundler(mainFiles, events, options));
  }

  /**
   * Build each bundle one-at-a-time, rather than all of them simultaneously.
   * This dramatically lowers the total build time, especially on large apps.
   *
   * @param {number} index - The bundle to build (from the {@link bundles} array)
   **/
  function writeBundle (index) {
    if (bundlers[index]) {
      // Write this bundle
      bundle(bundlers[index]);

      // Write the next bundle when this one finishes
      bundlers[index].once('end', () => {
        writeBundle(index + 1);
      });
    }
  }

  writeBundle(0);
}

/**
 * Creates a Browserify instance that outputs the main (non-minified) bundle for the given entry file.
 *
 * @param {FileSet} mainFiles - The input & output files
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function createMainBundler (mainFiles, events, options) {
  let bundler = newify(mainFiles, events, options);
  addProjectTransforms(bundler);
  return bundler;
}

/**
 * Creates a Browserify instance that outputs the minified bundle for the given entry file.
 *
 * @param {FileSet} mainFiles - The input & output files
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function createMinifiedBundler (mainFiles, events, options) {
  let minifiedFiles = new FileSet();

  if (options.bundle || options.test) {
    // We're creating multiple output files, so append ".min" to the minified file
    minifiedFiles.entryFile = mainFiles.entryFile;
    minifiedFiles.outputFile = util.appendToFileName(mainFiles.outputFile, '.min');
    if (options.debug) {
      minifiedFiles.mapFile = minifiedFiles.outputFile + '.map';
    }
  }
  else {
    // We're ONLY creating a minified file, so this is the main output file
    minifiedFiles = mainFiles;
  }

  let bundler = newify(minifiedFiles, events, options);
  addProjectTransforms(bundler);
  addUglifyTransforms(bundler);
  return bundler;
}

/**
 * Creates a Browserify instance that outputs the test bundle (with code-coverage instrumentation)
 * for the given entry file.
 *
 * @param {FileSet} mainFiles - The input & output files
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function createTestBundler (mainFiles, events, options) {
  let testFiles = new FileSet();

  if (options.bundle || options.minify) {
    // We're creating multiple output files, so append ".test" to the test file
    testFiles.entryFile = mainFiles.entryFile;
    testFiles.outputFile = util.appendToFileName(mainFiles.outputFile, '.test');
  }
  else {
    // We're ONLY creating a test file, so this is the main output file
    testFiles = mainFiles;

    // Don't produce source maps for test files (Istanbul doesn't support source maps anyway)
    testFiles.mapFile = '';
  }

  let bundler = newify(testFiles, events, options);
  addProjectTransforms(bundler);
  addUglifyTransforms(bundler);
  bundler.transform(istanbul(istanbulOptions));
  return bundler;
}

/**
 * Creates a new Browserify or Watchify instance
 *
 * @param {FileSet} fileSet - The input & output files for this bundle
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function newify (fileSet, events, options) {
  let bundler = browserify({
    entries: fileSet.entryFile,
    standalone: options.standalone || undefined,
    debug: !!fileSet.mapFile,
    cache: {},
    packageCache: {}
  });

  // Propagate events
  bundler.on('error', err => {
    events.emit('error', err, fileSet);
  });
  bundler.on('end', () => {
    events.emit('end', fileSet);
  });
  bundler.on('log', msg => {
    events.emit('log', msg, fileSet);
  });
  bundler.on('update', file => {
    events.emit('update', file.toString(), fileSet);
  });

  if (options.watch) {
    // Enable Watchify
    bundler = watchify(bundler);

    // Re-bundle when a file changes
    bundler.on('update', () => {
      bundle(bundler, fileSet);
    });
  }

  // Remember the input/output files for this bundler
  bundler.files = fileSet;

  return bundler;
}

/**
 * Adds Browserify transforms from the project's package.json file, if any
 *
 * @param {Browserify} bundler - The Browserify object to transform
 */
function addProjectTransforms (bundler) {
  try {
    // Find the package.json file by traversing up from the entry file path
    let startingDir = path.dirname(bundler.files.entryFile);
    let packageJson = util.findJsonFile(startingDir, 'package.json');

    // Does the package.json have a browserify.transform field?
    if (packageJson && packageJson.browserify && packageJson.browserify.transform) {
      packageJson.browserify.transform.forEach(transform => {
        // Each transform can be a string (just the transform name)
        // or an array (the transform name and its options)
        let name, options;
        if (Array.isArray(transform)) {
          name = transform[0];
          options = transform[1];
        }
        else {
          name = transform;
          options = undefined;
        }

        // Add the transform
        bundler.transform(require(name), options);
      });
    }
  }
  catch (e) {
    throw ono(e, 'Error reading Browserify transforms for', bundler.files.entryFile);
  }
}

/**
 * Adds Browserify transforms to minify the bundle.
 *
 * Minification is done in two phases, both using UglifyJS. The first phase occurs as a
 * Browserify transform, which minifies each module individually. This allows Uglify to
 * eliminate dead code paths within each module. The second phase occurs after Browserify
 * is finished, and minifies the entire bundle file.
 */
function addUglifyTransforms (bundler) {
  // Minify each module individually
  bundler.transform(uglifyify, {
    global: true,
    exts: ['.js', '.json'],
    output: {
      // Keep important comments when minifying
      comments: /^!|^\*!|@preserve|@license|@cc_on/
    },
  });
}

/**
 * Writes the output file (and possibly its .map file) for the given Browserify object
 *
 * @param {Browserify} bundler - The Browserify object to bundle
 */
function bundle (bundler) {
  let stream = bundler.bundle();
  stream.on('error', bundler.emit.bind(bundler, 'error'));
  stream.on('end', bundler.emit.bind(bundler, 'end'));

  if (bundler.files.mapFile) {
    util.ensureFileExists(bundler.files.mapFile);
    let dirname = path.dirname(bundler.files.mapFile);
    stream = stream.pipe(exorcist(bundler.files.mapFile, null, null, dirname));
  }

  util.ensureFileExists(bundler.files.outputFile);
  stream.pipe(fs.createWriteStream(bundler.files.outputFile));
}
