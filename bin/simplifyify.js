#!/usr/bin/env node
'use strict';

let program = require('commander');
let path = require('path');
let manifest = require('../package');
let simplifyify = require('../');

/**
 * Parse command-line arguments
 */
function parseArguments () {
  // jscs:disable maximumLineLength
  program
    .version(manifest.version)
    .description(manifest.description)
    .arguments('<source-files...>')
    .option('-b, --bundle', 'Create a non-minified bundle (*.js) for each source file')
    .option('-m, --minify', 'Create a minified bundle (*.min.js) for each source file')
    .option('-v, --test', 'Create a bundle with code-coverage instrumentation (*.test.js)')
    .option('-d, --debug', 'Create a source map (*.js.map) for each bundle')
    .option('-w, --watch', 'Watch source file(s) and rebuild the bundle(s) automatically')
    .option('-o, --outfile <filespec>', 'The output file or directory. May include a filename pattern (e.g. "*.bundle.js")')
    .option('-u, --exclude <filespec>', 'File path or glob pattern to exclude')
    .option('-s, --standalone <name>', 'Export as a named UMD bundle')
    .on('--help', () => {
      console.log(
        '  Arguments:\n' +
        '\n' +
        '    <source-files...>         One or more file paths and/or glob patterns.\n' +
        '                              Don\'t forget to put quotes around glob patterns.\n' +
        '                              A separate Browserify bundle will be created\n' +
        '                              for each source file.\n' +
        '\n' +
        '  Examples:\n' +
        '\n' +
        '    simplifyify src/index.js --outfile dist/bundle.js --bundle --debug --minify --test\n' +
        '\n' +
        '    Output Files: \n' +
        '      dist/bundle.js\n' +
        '      dist/bundle.js.map\n' +
        '      dist/bundle.min.js\n' +
        '      dist/bundle.min.js.map\n' +
        '      dist/bundle.test.js\n' +
        '\n' +
        '\n' +
        '    simplifyify "src/module-*.js" --outfile "dist/*.bundle.js" --bundle --minify\n' +
        '\n' +
        '    Output Files: \n' +
        '      dist/module-one.bundle.js\n' +
        '      dist/module-one.bundle.min.js\n' +
        '      dist/module-two.bundle.js\n' +
        '      dist/module-two.bundle.min.js\n'
      );
    })
    .parse(process.argv);

  // Show help if no options were given
  if (program.args.length === 0) {
    program.outputHelp();
    process.exit(1);
  }
}

/**
 * Program entry point
 */
function main () {
  parseArguments();

  simplifyify(program.args, program)
    .on('update', (file) => {
      // Log that a file change has been detected
      console.log('%s has changed', path.relative(process.cwd(), file));
    })
    .on('log', (msg) => {
      // Log # of bytes written & time taken
      console.log(msg);
    })
    .on('end', (fileSet) => {
      // Log the output files that were written
      console.log('%s --> %s', fileSet.entryFile, fileSet.outputFile);
      if (fileSet.mapFile) {
        console.log('%s --> %s', fileSet.entryFile, fileSet.mapFile);
      }
    })
    .on('error', (err, fileSet) => {
      // Log an error
      if (fileSet && fileSet.entryFile) {
        console.error('Error bundling %s\n%s', fileSet.entryFile, err);
      }
      else {
        let message = process.env.DEBUG ? err.stack : err.message;
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
