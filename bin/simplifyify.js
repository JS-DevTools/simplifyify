#!/usr/bin/env node
'use strict';

var program     = require('commander'),
    path        = require('path'),
    manifest    = require('../package'),
    simplifyify = require('../');

/**
 * Parse command-line arguments
 */
function parseArguments() {
  // jscs:disable maximumLineLength
  program
    .version(manifest.version)
    .description(manifest.description)
    .arguments('<files...>')
    .option('-o, --outfile <filespec>', 'The output file or directory. May include a filename pattern (e.g. "*.bundle.js")')
    .option('-u, --exclude <filespec>', 'File path or glob pattern to exclude')
    .option('-s, --standalone <name>', 'Export as a named UMD bundle')
    .option('-d, --debug', 'Output source maps for debugging (.map)')
    .option('-m, --minify', 'Output a minified copy of the bundle (.min.js)')
    .option('-v, --test', 'Output a bundle with code-coverage instrumentation for testing (.test.js)')
    .option('-w, --watch', 'Watch source file(s) and rebuild the bundle(s) automatically')
    .on('--help', function() {
      console.log(
        '  Arguments:\n' +
        '\n' +
        '    <files...>                One or more entry-file paths and/or glob patterns.\n' +
        '                              Don\'t forget to put quotes around glob patterns.\n' +
        '                              A separate Browserify bundle will be created\n' +
        '                              for each entry file.\n' +
        '\n' +
        '  Examples:\n' +
        '\n' +
        '    simplifyify src/index.js --outfile dist/bundle.js --debug --minify --test\n' +
        '\n' +
        '    Output Files: \n' +
        '      dist/bundle.js\n' +
        '      dist/bundle.js.map\n' +
        '      dist/bundle.min.js\n' +
        '      dist/bundle.min.js.map\n' +
        '      dist/bundle.test.js\n' +
        '\n' +
        '\n' +
        '    simplifyify "src/module-*.js" --outfile "dist/*.bundle.js" --minify\n' +
        '\n' +
        '    Output Files: \n' +
        '      dist/module-one.bundle.js\n' +
        '      dist/module-one.bundle.min.js\n' +
        '      dist/module-two.bundle.js\n' +
        '      dist/module-two.bundle.min.js\n'
      );
      process.exit(1);
    })
    .parse(process.argv);

  // Show help if no options were given
  if (program.args.length === 0) {
    program.outputHelp();
  }
}

/**
 * Program entry point
 */
function main() {
  parseArguments();

  simplifyify(program.args, program)
    .on('update', function(file) {
      // Log that a file change has been detected
      console.log('%s has changed', path.relative(process.cwd(), file));
    })
    .on('log', function(msg) {
      // Log # of bytes written & time taken
      console.log(msg);
    })
    .on('end', function(fileSet) {
      // Log the output files that were written
      console.log('%s --> %s', fileSet.entryFile, fileSet.outputFile);
      if (fileSet.mapFile) {
        console.log('%s --> %s', fileSet.entryFile, fileSet.mapFile);
      }
    })
    .on('error', function(err, fileSet) {
      // Log an error
      if (fileSet && fileSet.entryFile) {
        console.error('Error bundling %s\n%s', fileSet.entryFile, err);
      }
      else {
        var message = process.env.DEBUG ? err.stack : err.message;
        console.error(message);
      }

      // Exit the app with an error code,
      // unless we're in "Watchify" mode, in which case, we just keep watching
      if (!program.watch) {
        process.exit(2);
      }
    });
}

main();
