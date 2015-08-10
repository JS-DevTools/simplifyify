#!/usr/bin/env node
'use strict';

var program     = require('commander'),
    simplifyify = require('../'),
    path        = require('path');

program
  .version(require('../package').version)
  .description('A simplified Browserify CLI')
  .arguments('<files...>')
  // jscs:disable maximumLineLength
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
  })
  .action(function(files, options) {
    simplifyify(files, options)
      .on('update', function(file) {
        // Log that a file change has been detected
        console.log('%s has changed', path.relative(process.cwd(), file));
      })
      .on('log', function(msg) {
        // Log # of bytes written & time taken
        console.log(msg);
      })
      .on('end', function(fileSet) {
        // Log the output files that were writen
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

        // Exit the app with an error code
        if (!program.watch) {
          process.exit(1);
        }
      });
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.outputHelp();
}
