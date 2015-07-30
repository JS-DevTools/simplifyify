'use strict';

var browserify = require('browserify'),
    watchify   = require('watchify'),
    exorcist   = require('exorcist'),
    uglifyify  = require('uglifyify'),
    istanbul   = require('browserify-istanbul'),
    fs         = require('fs'),
    path       = require('path'),
    FileSet    = require('./file-set'),
    util       = require('./util');

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
function writeBundles(mainFiles, events, options) {
  var bundles = [];
  var bundleFiles = [];

  // Create the main bundle
  var mainBundle = newify(mainFiles, events, options);
  bundles.push(mainBundle);
  bundleFiles.push(mainFiles);

  if (options.minify) {
    // The files for the minified bundle
    var minifiedFiles = new FileSet();
    minifiedFiles.entryFile = mainFiles.entryFile;
    minifiedFiles.outputFile = util.appendToFileName(mainFiles.outputFile, '.min');
    if (options.debug) {
      minifiedFiles.mapFile = minifiedFiles.outputFile + '.map';
    }
    bundleFiles.push(minifiedFiles);

    // Create the minified bundle
    var minifiedBundle = newify(minifiedFiles, events, options);
    addMinifyTransform(minifiedBundle);
    bundles.push(minifiedBundle);
  }

  if (options.test) {
    // The files for the test bundle
    var testFiles = new FileSet();
    testFiles.entryFile = mainFiles.entryFile;
    testFiles.outputFile = util.appendToFileName(mainFiles.outputFile, '.test');
    bundleFiles.push(testFiles);

    // Create the test bundle
    var testBundle = newify(testFiles, events, options);
    addCoverageTransform(testBundle);
    addMinifyTransform(testBundle);
    bundles.push(testBundle);
  }

  // Build each bundle one-at-a-time, rather than all of them simultaneously.
  // This dramatically lowers the total build time, especially on large apps.
  function writeBundle(index) {
    if (bundles[index]) {
      // Write this bundle
      bundle(bundles[index], bundleFiles[index]);

      // Write the next bundle when this one finishes
      bundles[index].once('end', function() {
        writeBundle(index + 1);
      });
    }
  }

  writeBundle(0);
}

/**
 * Creates a new Browserify or Watchify instance
 *
 * @param {FileSet} fileSet - The input & output files for this bundle
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function newify(fileSet, events, options) {
  var b = browserify({
    entries: fileSet.entryFile,
    standalone: options.standalone || undefined,
    debug: !!fileSet.mapFile,
    cache: {},
    packageCache: {}
  });

  // Propagate events
  b.on('error', function(err) {
    events.emit('error', err, fileSet);
  });
  b.on('end', function() {
    events.emit('end', fileSet);
  });
  b.on('log', function(msg) {
    events.emit('log', msg, fileSet);
  });
  b.on('update', function(file) {
    events.emit('update', file.toString(), fileSet);
  });

  if (options.watch) {
    // Enable Watchify
    b = watchify(b);

    // Re-bundle when a file changes
    b.on('update', function() {
      bundle(b, fileSet);
    });
  }

  return b;
}

/**
 * Uses the Uglifyify transform to minify the given Browserify bundle
 *
 * @param {Browserify} b = The Browserify object to transform
 */
function addMinifyTransform(b) {
  b.transform(uglifyify, {global: true, exts: ['.js', '.json']});
}

/**
 * Uses the Istanbul transform to add code-coverage instrumentation the given Browserify bundle
 *
 * @param {Browserify} b = The Browserify object to transform
 */
function addCoverageTransform(b) {
  b.transform(istanbul({
    ignore: ['**/*.html', '**/*.md', '**/*.txt'],
    defaultIgnore: true
  }));
}

/**
 * Writes the output file (and possibly its .map file) for the given Browserify object
 *
 * @param {Browserify} b - The Browserify object to bundle
 * @param {FileSet} fileSet - The input & output files for this bundle
 */
function bundle(b, fileSet) {
  var stream = b.bundle();
  stream.on('end', b.emit.bind(b, 'end'));

  if (fileSet.mapFile) {
    util.ensureFileExists(fileSet.mapFile);
    var dirname = path.dirname(fileSet.mapFile);
    stream = stream.pipe(exorcist(fileSet.mapFile, null, null, dirname));
  }

  util.ensureFileExists(fileSet.outputFile);
  stream.pipe(fs.createWriteStream(fileSet.outputFile));
}
