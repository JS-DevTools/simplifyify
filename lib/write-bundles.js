'use strict';

const browserify = require('browserify');
const watchify = require('watchify');
const exorcist = require('exorcist');
const fs = require('fs');
const path = require('path');
const FileSet = require('./file-set');
const Transforms = require('./transforms');
const util = require('./util');

module.exports = writeBundles;

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

  // Read the Browserify transforms from the project manifest (package.json file)
  let startingDir = path.dirname(mainFiles.entryFile);
  let manifest = util.findJsonFile(startingDir, 'package.json');
  let transforms = new Transforms(manifest);

  // If no output options are specified, then default to --bundle
  if (!options.bundle && !options.minify && !options.test) {
    options.bundle = true;
  }

  if (options.bundle) {
    bundlers.push(createMainBundler(mainFiles, transforms, events, options));
  }

  if (options.minify) {
    bundlers.push(createMinifiedBundler(mainFiles, transforms, events, options));
  }

  if (options.test) {
    bundlers.push(createTestBundler(mainFiles, transforms, events, options));
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
 * @param {Transforms} transforms - The Browserify transforms, and their options
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function createMainBundler (mainFiles, transforms, events, options) {
  let bundler = newify(mainFiles, events, options);
  transforms.apply(bundler);
  return bundler;
}

/**
 * Creates a Browserify instance that outputs the minified bundle for the given entry file.
 *
 * @param {FileSet} mainFiles - The input & output files
 * @param {Transforms} transforms - The Browserify transforms, and their options
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function createMinifiedBundler (mainFiles, transforms, events, options) {
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
  transforms.apply(bundler, { minify: true });
  return bundler;
}

/**
 * Creates a Browserify instance that outputs the test bundle (with code-coverage instrumentation)
 * for the given entry file.
 *
 * @param {FileSet} mainFiles - The input & output files
 * @param {Transforms} transforms - The Browserify transforms, and their options
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function createTestBundler (mainFiles, transforms, events, options) {
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
  transforms.apply(bundler, { minify: true, test: true });
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

  // Some transforms (e.g. uglifyify) require post-processing of the bundle file
  bundler.postProcessing = function () { };

  return bundler;
}

/**
 * Writes the output file (and possibly its .map file) for the given Browserify object
 *
 * @param {Browserify} bundler - The Browserify or Watchify instance to bundle
 */
function bundle (bundler) {
  let stream = bundler.bundle();
  stream.on('error', bundler.emit.bind(bundler, 'error'));

  if (bundler.files.mapFile) {
    util.ensureFileExists(bundler.files.mapFile);
    let dirname = path.dirname(bundler.files.mapFile);
    stream = stream.pipe(exorcist(bundler.files.mapFile, null, null, dirname));
  }

  util.ensureFileExists(bundler.files.outputFile);
  stream.pipe(fs.createWriteStream(bundler.files.outputFile));

  stream.on('end', () => {
    // The "end" event sometimes gets called before the file(s) have
    // been fully-written to disk.  So we wait a bit to allow I/O to finish.
    setTimeout(() => {
      // Perform post-processing on the output file(s)
      try {
        bundler.postProcessing();
        bundler.emit('end');
      }
      catch (e) {
        bundler.emit('error', e);
      }
    }, 100);
  });
}
