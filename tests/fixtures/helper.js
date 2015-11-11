'use strict';

var spawn      = require('child_process').spawn,
    del        = require('del'),
    fs         = require('fs'),
    path       = require('path'),
    expect     = require('chai').expect,
    isWindows  = /^win/.test(process.platform),
    testAppDir = path.join(__dirname, '..', '..', 'test-app');

module.exports = {
  run: run,
  fileContents: fileContents,
  assert: {
    noFilesWereCreated: noFilesWereCreated,
    filesWereCreated: filesWereCreated,
    hasPreamble: hasPreamble,
    hasUmdPreamble: hasUmdPreamble,
    isMinified: isMinified,
    notMinified: notMinified,
    hasSourceMap: hasSourceMap,
    noSourceMap: noSourceMap,
    hasCoverage: hasCoverage,
    noCoverage: noCoverage
  }
};

beforeEach(function(done) {
  // Clear the output files before each test
  del(['dist', 'lib/**/*.bundle.*'], {cwd: testAppDir})
    .then(function() {
      done();
    })
    .catch(done);
});

/**
 * Runs Simplifyify with the given args
 *
 * @param {string} args
 * @param {function} callback
 * @returns {ChildProcess}
 */
function run(args, callback) {
  var exited = false, stdout = '', stderr = '';

  // Run simplifyify
  args = ['bin/simplifyify'].concat(args ? args.split(' ') : []);
  var simplifyify = spawn('node', args);

  // Capture stdout and stderr
  simplifyify.stdout.on('data', function(data) {
    stdout += data.toString();
  });
  simplifyify.stderr.on('data', function(data) {
    stderr += data.toString();
  });

  // Handle exits (successful or failure)
  simplifyify.on('exit', onExit);
  simplifyify.on('error', onExit);

  function onExit(code) {
    // onExit can sometimes fire multiple times, so ignore duplicates
    if (exited) {
      return;
    }
    exited = true;

    var err = null;
    if (code > 0) {
      err = new Error('Exit Code: ' + code);
    }
    else if (code === 0 && stderr) {
      err = new Error('Simplifyify exited with 0, but also wrote to stderr.\n\n' + stderr);
    }
    else if (code instanceof Error) {
      err = code;
    }

    if (isWindows) {
      // Replace Windows path separators with POSIX separators
      stdout = stdout.replace(/\\/g, '/');
      stderr = stderr.replace(/\\/g, '/');
    }

    callback(err, stdout.trim(), stderr.trim());
  }

  return simplifyify;
}

/**
 * Calls the given function for the given file(s), passing the contents of the file.
 *
 * @param {string|string[]} files
 * @param {function} fn
 */
function fileContents(files, fn) {
  files = Array.isArray(files) ? files : [files];
  files.forEach(function(file) {
    var contents = fs.readFileSync(path.join('test-app/dist', file)).toString();

    if (file.substr(-4) === '.map') {
      // Parse source-map files, and return a POJO instead of a string
      contents = JSON.parse(contents);

      if (isWindows) {
        // Replace Windows path separators with POSIX separators
        contents.sources = contents.sources.map(function(source) {
          return source.replace(/\\/g, '/');
        });
      }
    }
    fn(contents);
  });
}

/**
 * Returns the contents of the given directory.
 *
 * @param {string} [dir] - The directory to list. Defaults to "../test-app/dist".
 */
function ls(dir) {
  try {
    var contents = [];

    dir = dir || path.join(testAppDir, 'dist');
    fs.readdirSync(dir).forEach(function(name) {
      var fullName = path.join(dir, name);
      if (fs.statSync(fullName).isDirectory()) {
        ls(fullName).forEach(function(nested) {
          contents.push(name + '/' + nested);   // Don't use path.join() here, because of Windows
        });
      }
      else {
        contents.push(name);
      }
    });

    return contents;
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      // The directory doesn't exist, so return an empty list
      return [];
    }
    throw e;
  }
}

/**
 * Asserts that the "../test-app/dist" folder is empty.
 */
function noFilesWereCreated() {
  var outfiles = ls();
  try {
    expect(outfiles).to.have.same.members([]);
  }
  catch (e) {
    console.error('Expected: []\n\nActual: %s', JSON.stringify(outfiles, null, 2));
    throw e;
  }
}

/**
 * Asserts that the given files were created, and no others.
 *
 * @param {string[]}  files - The files to check for
 * @param {string}    [dir] - The directory to check (defaults to "../test-app/dist")
 */
function filesWereCreated(files, dir) {
  var outfiles = ls(dir);
  try {
    expect(outfiles).to.have.same.members(files);
  }
  catch (e) {
    console.error('Expected: %s\n\nActual: %s',
      JSON.stringify(files, null, 2), JSON.stringify(outfiles, null, 2));
    throw e;
  }
}

/**
 * Asserts that the given file contents contain the Browserify preamble
 *
 * @param {string} contents
 */
function hasPreamble(contents) {
  expect(contents).to.match(/^\(function \w\(\w,\w,\w\)\{function /);
}

/**
 * Asserts that the given file contents contain the Browserify UMD preamble
 *
 * @param {string} contents
 */
function hasUmdPreamble(contents) {
  expect(contents).to.match(/^\(function\(\w\)\{if\(typeof exports==="object"/);
}

/**
 * Asserts that the given file contents contain an external source map
 *
 * @param {string} contents
 */
function hasSourceMap(contents) {
  expect(contents).to.match(/\/\/\# sourceMappingURL=.*\.map\n$/);
}

/**
 * Asserts that the given file contents DO NOT contain a source map
 *
 * @param {string} contents
 */
function noSourceMap(contents) {
  expect(contents).not.to.match(/\/\/\# sourceMap/);
}

/**
 * Asserts that the given file contents are minified
 *
 * @param {string}  contents
 * @param {boolean} stripComments - Whether the contents should include comments or not
 */
function isMinified(contents, stripComments) {
  // Single-quotes become double-quotes, and newline is removed
  expect(contents).to.match(/"use strict";\S+/);

  if (stripComments) {
    // All comments are removed
    expect(contents).not.to.match(/\/\//);
  }
  else {
    // Non-important comments are removed
    expect(contents).not.to.match(/\* @param \{string\}/);
    expect(contents).not.to.match(/\/\/ This is NOT an important comment/);

    // Important comments are preserved
    expect(contents).to.match(/This is an important comment/);
  }
}

/**
 * Asserts that the given file contents ARE NOT minified
 *
 * @param {string} contents
 */
function notMinified(contents) {
  // Single-quotes and newline are preserved
  expect(contents).to.match(/'use strict';\r?\n\s+/);

  // Non-important comments are preserved
  expect(contents).to.match(/\* @param \{string\}/);
  expect(contents).to.match(/\/\/ This is NOT an important comment/);

  // Important comments are also preserved
  expect(contents).to.match(/This is an important comment/);
}

/**
 * Asserts that the given file contents contain code-coverage instrumentation
 *
 * @param {string} contents
 */
function hasCoverage(contents) {
  // Check for __cov_ wrappers
  expect(contents).to.match(/__cov(_[a-zA-Z0-9$]+)+\.__coverage__/);
}

/**
 * Asserts that the given file contents DO NOT contain code-coverage instrumentation
 *
 * @param {string} contents
 */
function noCoverage(contents) {
  expect(contents).not.to.match(/__cov_/);
}

