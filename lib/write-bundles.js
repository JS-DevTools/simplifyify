'use strict';

var browserify = require('browserify'),
    watchify   = require('watchify'),
    exorcist   = require('exorcist'),
    uglifyify  = require('uglifyify'),
    istanbul   = require('browserify-istanbul'),
    fs         = require('fs'),
    path       = require('path'),
    mkdirp     = require('mkdirp'),
    touch      = require('touch'),
    FileSet    = require('./file-set');

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
  // Write the main bundle file(s)
  var mainBundle = newify(mainFiles, events, options);
  bundle(mainBundle, mainFiles);

  if (options.minify) {
    var minifiedFiles = new FileSet();
    minifiedFiles.entryFile = mainFiles.entryFile;
    minifiedFiles.outputFile = appendToFileName(mainFiles.outputFile, '.min');
    if (options.debug) {
      minifiedFiles.mapFile = minifiedFiles.outputFile + '.map';
    }

    // Write the minified bundle file(s)
    var minifiedBundle = newify(minifiedFiles, events, options);
    minify(minifiedBundle);
    bundle(minifiedBundle, minifiedFiles);
  }

  if (options.test) {
    var testFiles = new FileSet();
    testFiles.entryFile = mainFiles.entryFile;
    testFiles.outputFile = appendToFileName(mainFiles.outputFile, '.test');

    // Write the minified bundle file(s)
    var testBundle = newify(testFiles, events, options);
    testify(testBundle);
    minify(testBundle);
    bundle(testBundle, testFiles);
  }
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
function minify(b) {
  b.transform(uglifyify, {global: true, exts: ['.js', '.json']});
}

/**
 * Uses the Istanbul transform to add code-coverage instrumentation the given Browserify bundle
 *
 * @param {Browserify} b = The Browserify object to transform
 */
function testify(b) {
  b.transform(istanbul);
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
    ensureFileExists(fileSet.mapFile);
    var dirname = path.dirname(fileSet.mapFile);
    stream = stream.pipe(exorcist(fileSet.mapFile, null, null, dirname));
  }

  ensureFileExists(fileSet.outputFile);
  stream.pipe(fs.createWriteStream(fileSet.outputFile));
}

/**
 * Ensures that the given file path exists, since Browserify throws errors if they don't.
 *
 * @param {string} file
 */
function ensureFileExists(file) {
  var dir = path.dirname(file);
  mkdirp.sync(dir);
  touch.sync(file);
}

/**
 * Appends the given string to the given file name, without affecting the file extension.
 *
 * @param {string} file - The original file path and/or name  (e.g. "dest/subdir/my-file.js")
 * @param {string} append - The string to append to the file name (e.g. ".min")
 * @returns {string}
 */
function appendToFileName(file, append) {
  var ext = path.extname(file);
  return file.substr(0, file.length - ext.length) + append + ext;
}
