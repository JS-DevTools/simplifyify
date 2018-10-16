'use strict';

const Browserify = require('browserify');
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
 * created, depending on {@link Options.debug}, {@link Options.minify}, and {@link Options.coverage}.
 *
 * @param {FileSet} mainFiles - The main input & output files (not the minified or coverage files)
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 */
function writeBundles (mainFiles, events, options) {
  let bundles = [];

  // Read the Browserify transforms from the project manifest (package.json file)
  let manifestPath = path.join(path.dirname(mainFiles.entryFile), 'package.json');
  let transforms = new Transforms(manifestPath);

  // Determine whether to enable TypeScript
  options.typescript = transforms.tsify || util.isTypeScript(mainFiles.entryFile);

  // If no output options are specified, then default to --bundle
  if (!options.bundle && !options.minify && !options.coverage) {
    options.bundle = true;
  }

  if (options.bundle) {
    bundles.push(createMainBundle(mainFiles, transforms, events, options));
  }

  if (options.minify) {
    bundles.push(createMinifiedBundle(mainFiles, transforms, events, options));
  }

  if (options.coverage) {
    bundles.push(createCoverageBundle(mainFiles, transforms, events, options));
  }

  /**
   * Build each bundle one-at-a-time, rather than all of them simultaneously.
   * This dramatically lowers the total build time, especially on large apps.
   *
   * @param {number} index - The bundle to build (from the {@link bundles} array)
   **/
  function writeBundle (index) {
    if (bundles[index]) {
      // Write this bundle
      bundle(bundles[index]);

      // Write the next bundle when this one finishes
      bundles[index].once('end', () => {
        writeBundle(index + 1);
      });
    }
  }

  writeBundle(0);
}

/**
 * Returns a Browserify instance that outputs the main (non-minified) bundle for the given entry file.
 *
 * @param {FileSet} mainFiles - The input & output files
 * @param {Transforms} transforms - The Browserify transforms, and their options
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function createMainBundle (mainFiles, transforms, events, options) {
  let browserify = newify(mainFiles, transforms, events, options);
  transforms.apply(browserify, { typescript: options.typescript });
  return browserify;
}

/**
 * Returns a Browserify instance that outputs the minified bundle for the given entry file.
 *
 * @param {FileSet} mainFiles - The input & output files
 * @param {Transforms} transforms - The Browserify transforms, and their options
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function createMinifiedBundle (mainFiles, transforms, events, options) {
  let minifiedFiles = new FileSet();

  if (options.bundle || options.coverage) {
    // We're creating multiple output files, so append ".min" to the minified file
    minifiedFiles.entryFile = mainFiles.entryFile;
    minifiedFiles.outputFile = util.appendToFileName(mainFiles.outputFile, '.min');
    minifiedFiles.standalone = mainFiles.standalone;
    if (options.debug) {
      minifiedFiles.mapFile = minifiedFiles.outputFile + '.map';
    }
  }
  else {
    // We're ONLY creating a minified file, so this is the main output file
    minifiedFiles = mainFiles;
  }

  let browserify = newify(minifiedFiles, transforms, events, options);
  transforms.apply(browserify, { minify: true, typescript: options.typescript });
  return browserify;
}

/**
 * Returns a Browserify instance that outputs the code-coverage bundle for the given entry file.
 *
 * @param {FileSet} mainFiles - The input & output files
 * @param {Transforms} transforms - The Browserify transforms, and their options
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function createCoverageBundle (mainFiles, transforms, events, options) {
  let coverageFiles = new FileSet();

  if (options.bundle || options.minify) {
    // We're creating multiple output files, so append ".coverage" to the code-coverage file
    coverageFiles.entryFile = mainFiles.entryFile;
    coverageFiles.outputFile = util.appendToFileName(mainFiles.outputFile, '.coverage');
    coverageFiles.standalone = mainFiles.standalone;
  }
  else {
    // We're ONLY creating a code-coverage file, so this is the main output file
    coverageFiles = mainFiles;

    // Don't produce source maps for code-coverage files (Istanbul doesn't support source maps)
    coverageFiles.mapFile = '';
  }

  let browserify = newify(coverageFiles, transforms, events, options);
  transforms.apply(browserify, { minify: true, coverage: true, typescript: options.typescript });
  return browserify;
}

/**
 * Creates a new Browserify or Watchify instance
 *
 * @param {FileSet} fileSet - The input & output files for this bundle
 * @param {Transforms} transforms - The Browserify transforms, and their options
 * @param {EventEmitter} events - Browserify events will be propagated to this EventEmitter
 * @param {Options} options - Bundling options
 * @returns {Browserify}
 */
function newify (fileSet, transforms, events, options) {
  // We always set these options
  let browserifyOptions = {
    entries: fileSet.entryFile,
    standalone: fileSet.standalone || undefined,
    debug: !!fileSet.mapFile,
  };

  // These options are only needed for Watchify
  if (options.watch) {
    browserifyOptions.cache = {};
    browserifyOptions.packageCache = {};
  }

  // Create the Browserify instance
  let browserify = new Browserify(browserifyOptions);

  // Propagate events
  browserify.on('error', err => {
    events.emit('error', err, fileSet);
  });
  browserify.on('end', () => {
    events.emit('end', fileSet);
  });
  browserify.on('log', msg => {
    events.emit('log', msg, fileSet);
  });
  browserify.on('update', file => {
    events.emit('update', file.toString(), fileSet);
  });

  if (options.watch) {
    // Enable Watchify
    browserify = watchify(browserify);

    // Re-bundle when a file changes
    browserify.on('update', () => {
      bundle(browserify);
    });
  }

  // Remember the input/output files for this browserify
  browserify.files = fileSet;

  // Some transforms (e.g. uglifyify) require post-processing of the bundle file
  browserify.postProcessing = () => Promise.resolve();

  return browserify;
}

/**
 * Writes the output file (and possibly its .map file) for the given Browserify object
 *
 * @param {Browserify} browserify - The Browserify or Watchify instance to bundle
 */
function bundle (browserify) {
  let stream = browserify.bundle();
  stream.on('error', browserify.emit.bind(browserify, 'error'));

  Promise.resolve()
    .then(() => {
      if (browserify.files.mapFile) {
        // Create the map file, if necessary, since Exorcist expects it to already exist
        return util.ensureFileExists(browserify.files.mapFile);
      }
    })
    .then(() => {
      if (browserify.files.mapFile) {
        // Add Exorcist to the pipeline, to extract the sourcemap to a separate file
        let dirname = path.dirname(browserify.files.mapFile);
        stream = stream.pipe(exorcist(browserify.files.mapFile, null, null, dirname));
      }

      // Create the output file, if necessary, since Browserify expects it to already exist
      return util.ensureFileExists(browserify.files.outputFile);
    })
    .then(() => {
      // Pipe the Browserify output to the output file
      stream.pipe(fs.createWriteStream(browserify.files.outputFile));
    })
    .then(() => {
      return new Promise((resolve) => stream.on('end', resolve));
    })
    .then(() => {
      // The "end" event sometimes gets called before the file(s) have
      // been fully-written to disk.  So we wait a bit to allow I/O to finish.
      return new Promise((resolve) => setTimeout(resolve, 100));
    })
    .then(() => {
      // Perform any post-processing on the output file(s), such as minification
      return browserify.postProcessing();
    })
    .then(() => {
      browserify.emit('end');
    })
    .catch(e => {
      browserify.emit('error', e);
    });
}
