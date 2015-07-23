Simplifyify
============================
#### A simplified Browserify and Watchify CLI

[![Build Status](https://img.shields.io/travis/BigstickCarpet/simplifyify.svg)](https://travis-ci.org/BigstickCarpet/simplifyify)
[![Codacy Score](http://img.shields.io/codacy/e7d74b7748674054be73556c87475c49.svg)](https://www.codacy.com/public/jamesmessinger/simplifyify)
[![Code Climate Score](https://img.shields.io/codeclimate/github/BigstickCarpet/simplifyify.svg)](https://codeclimate.com/github/BigstickCarpet/simplifyify)
[![Dependencies](https://img.shields.io/david/BigstickCarpet/simplifyify.svg)](https://david-dm.org/BigstickCarpet/simplifyify)
[![Inline docs](http://inch-ci.org/github/BigstickCarpet/simplifyify.svg?branch=master&style=shields)](http://inch-ci.org/github/BigstickCarpet/simplifyify)

[![npm](http://img.shields.io/npm/v/simplifyify.svg)](https://www.npmjs.com/package/simplifyify)
[![License](https://img.shields.io/npm/l/simplifyify.svg)](LICENSE)

I constantly find myself using the same Browserify plug-ins and transforms on every project, and I always end up writing pretty much the same Gulp script over and over again.  Simplifyify is the solution to that problem.

Features
--------------------------
* Supports [globs](https://github.com/isaacs/node-glob#glob-primer), even on Windows
* Builds separate Browserify bundles for each entry file
* One command outputs all the files you need &mdash; unminified, minified, source maps, coverage
* Writes _external_ source-maps (`.map`) using [exorcist](https://www.npmjs.com/package/exorcist)
* Outputs a minified copy of the bundle (`.min.js`) using [uglifyify](https://www.npmjs.com/package/uglifyify)
* Outputs a test bundle with code-coverage instrumentation (`.test.js`) using [istanbul](https://www.npmjs.com/package/istanbul)
* Fast, differential re-builds as files change, via [watchify](https://www.npmjs.com/package/watchify)


Related Projects
--------------------------
* [globify](https://www.npmjs.com/package/globify) - Run browserify and watchify with globs - even on Windows
* [sourcemapify](https://www.npmjs.com/package/sourcemapify) - Sourcemap plugin for Browserify


Installation
--------------------------
Install using [npm](https://docs.npmjs.com/getting-started/what-is-npm):

```bash
npm install simplifyify
```


Usage
--------------------------
```bash
Usage: simplifyify [options] <files...>

Options:

  -o, --outfile <filespec>  The output file or directory.
                            May include a filename pattern (e.g. "*.bundle.js")

  -u, --exclude <filespec>  File path or glob pattern to exclude.
                            Don't forget to put quotes around glob patterns

  -s, --standalone <name>   Export as a named UMD bundle
                            For example: my.cool.package

  -d, --debug               Output source maps for debugging (.map)

  -m, --minify              Output a minified copy of the bundle (.min.js)

  -v, --test                Output a bundle with code-coverage instrumentation for testing (.test.js)

  -w, --watch               Watch source file(s) and rebuild the bundle(s) automatically

Arguments:

  <files...>                One or more entry-file paths and/or glob patterns.
                            Don't forget to put quotes around glob patterns.
                            A separate Browserify bundle will be created
                            for each entry file.
```


Examples
--------------------------
#### One entry file -> multiple output files

```bash
simplifyify src/index.js --outfile dist/bundle.js --debug --minify --test
```

This command will output the main bundle file (unminified) and its source-map, a minified bundle and its source-map, and a test bundle with code-coverage instrumentation:

```
dist/bundle.js
dist/bundle.js.map
dist/bundle.min.js
dist/bundle.min.js.map
dist/bundle.test.js
```

#### Multiple entry files -> multiple output files each

```bash
simplifyify "src/module-*.js" --outfile "dist/*.bundle.js" --minify --debug
```

This command will output **four** files for each entry file: an unminified bundle and its source-map, and a minified bundle and its source-map.  Also notice that `.bundle` is appended to each file name due to the naming pattern in the `--outfile` argument.

```
dist/module-one.bundle.js
dist/module-one.bundle.js.map
dist/module-one.bundle.min.js
dist/module-one.bundle.min.js.map

dist/module-two.bundle.js
dist/module-two.bundle.js.map
dist/module-two.bundle.min.js
dist/module-two.bundle.min.js.map
```


Contributing
--------------------------
I welcome any contributions, enhancements, and bug-fixes.  [File an issue](https://github.com/BigstickCarpet/simplifyify/issues) on GitHub and [submit a pull request](https://github.com/BigstickCarpet/simplifyify/pulls).

#### Building
To build the project locally on your computer:

1. __Clone this repo__<br>
`git clone https://github.com/bigstickcarpet/simplifyify.git`

2. __Install dependencies__<br>
`npm install`

3. __Run the build script__<br>
`npm run build`

4. __Run the tests__<br>
`npm test`



License
--------------------------
Simplifyify is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.
