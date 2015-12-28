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

var uglifyifyOptions = {
  global: true,
  exts: ['.js', '.json'],
  output: {
    // Keep important comments when minifying
    comments: /^!|^\*!|@preserve|@license|@cc_on/
  }
};

var istanbulOptions = {
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
function writeBundles(mainFiles, events, options) {
  var bundlers = [];

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
  function writeBundle(index) {
    if (bundlers[index]) {
      // Write this bundle
      bundle(bundlers[index]);

      // Write the next bundle when this one finishes
      bundlers[index].once('end', function() {
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
function createMainBundler(mainFiles, events, options) {
  return newify(mainFiles, events, options);
}

/**
 * Creates a Browserify instance that outputs the minified bundle for the given entry file.
 *
 * @param {FileSet} mainFiles - The input & output files
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function createMinifiedBundler(mainFiles, events, options) {
  var minifiedFiles = new FileSet();

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

  var bundler = newify(minifiedFiles, events, options);
  bundler.transform(uglifyify, uglifyifyOptions);
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
function createTestBundler(mainFiles, events, options) {
  var testFiles = new FileSet();

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

  var bundler = newify(testFiles, events, options);
  bundler.transform(uglifyify, uglifyifyOptions);
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

  // Remember the input/output files for this bundler
  b.files = fileSet;

  return b;
}

/**
 * Writes the output file (and possibly its .map file) for the given Browserify object
 *
 * @param {Browserify} b - The Browserify object to bundle
 */
function bundle(b) {
  var stream = b.bundle();
  stream.on('end', b.emit.bind(b, 'end'));
  stream.on('error', b.emit.bind(b, 'error'));

  if (b.files.mapFile) {
    util.ensureFileExists(b.files.mapFile);
    var dirname = path.dirname(b.files.mapFile);
    stream = stream.pipe(exorcist(b.files.mapFile, null, null, dirname));
  }

  util.ensureFileExists(b.files.outputFile);
  stream.pipe(fs.createWriteStream(b.files.outputFile));
}
