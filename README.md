Simplifyify
============================
#### A simplified Browserify and Watchify CLI

[![Build Status](https://api.travis-ci.org/BigstickCarpet/simplifyify.svg?branch=master)](https://travis-ci.org/BigstickCarpet/simplifyify)
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/BigstickCarpet/simplifyify?svg=true&branch=master&failingText=Windows%20build%20failing&passingText=Windows%20build%20passing)](https://ci.appveyor.com/project/BigstickCarpet/simplifyify)

[![Coverage Status](https://coveralls.io/repos/github/BigstickCarpet/simplifyify/badge.svg?branch=master)](https://coveralls.io/github/BigstickCarpet/simplifyify?branch=master)
[![Codacy Score](https://api.codacy.com/project/badge/Grade/e7d74b7748674054be73556c87475c49)](https://www.codacy.com/public/jamesmessinger/simplifyify)
[![Inline docs](http://inch-ci.org/github/BigstickCarpet/simplifyify.svg?branch=master&style=shields)](http://inch-ci.org/github/BigstickCarpet/simplifyify)
[![Dependencies](https://david-dm.org/BigstickCarpet/simplifyify.svg)](https://david-dm.org/BigstickCarpet/simplifyify)

[![npm](http://img.shields.io/npm/v/simplifyify.svg)](https://www.npmjs.com/package/simplifyify)
[![License](https://img.shields.io/npm/l/simplifyify.svg)](LICENSE)

I constantly find myself using the same Browserify plug-ins and transforms on every project, and I always end up writing pretty much the same Gulp script over and over again.  Simplifyify is the solution to that problem.

Features
--------------------------
- Supports [globs](https://github.com/isaacs/node-glob#glob-primer), even on Windows
- Supports Browserify [transforms](#browserify-transforms), such as Babel, CoffeeScript, TypeScript, etc.
- Has a programmatic [API](#api), for use with build tools like Grunt, Gulp, Broccoli, etc.
- Bundle everything into one big file, or create different bundles for each part of your app (see [examples below](#examples))
- Add a banner with version, date, license, etc. via [browserify-banner](https://www.npmjs.com/package/browserify-banner)
- One command creates all the files you need:
    - `--bundle` bundles your code and nothing else. Useful during development
    - `--debug` creates _external_ source-maps (`.map`) using [exorcist](https://www.npmjs.com/package/exorcist)
    - `--minify` shrinks your code using [uglifyify](https://www.npmjs.com/package/uglifyify) _and_ [Uglify-ES](https://github.com/mishoo/UglifyJS2/tree/harmony)
    - `--test` adds code-coverage instrumentation using [istanbul](https://www.npmjs.com/package/istanbul)
    - `--watch` uses [watchify](https://www.npmjs.com/package/watchify) for _fast_ differential re-builds as files change


Related Projects
--------------------------
* [globify](https://www.npmjs.com/package/globify) - Run browserify and watchify with globs - even on Windows
* [sourcemapify](https://www.npmjs.com/package/sourcemapify) - Sourcemap plugin for Browserify
* [browserify-banner](https://www.npmjs.com/package/browserify-banner) - Add a comment (and/or code) to the top of your Browserify bundle


Installation
--------------------------
Install using [npm](https://docs.npmjs.com/getting-started/what-is-npm):

```bash
npm install simplifyify
```


Usage
--------------------------
```
Usage: simplifyify [options] <source-files...>

Options:

  -b, --bundle              Create a non-minified bundle (*.js) for each source file.
                            This is the default if no other output option is set.

  -m, --minify              Create a minified bundle (*.min.js) for each source file.

  -v, --test                Create a bundle with code-coverage instrumentation
                            (*.test.js) for each source file.

  -d, --debug               Create a source map (*.js.map) for each bundle

  -w, --watch               Watch source file(s) and rebuild the bundle(s) automatically

  -o, --outfile <filespec>  The output file or directory.
                            May include a filename pattern (e.g. "*.bundle.js")

  -u, --exclude <filespec>  File path or glob pattern to exclude.
                            Don't forget to put quotes around glob patterns

  -s, --standalone <name>   Export as a named UMD bundle (e.g. "my.cool.module")
                            May include a wildcard (e.g. "MyLib.*")

Arguments:

  <source-files...>         One or more file paths and/or glob patterns.
                            Don't forget to put quotes around glob patterns.
                            A separate Browserify bundle will be created
                            for each source file.
```


Examples
--------------------------
#### One entry file --> one output file
In the simplest usage, you can use Simplifyify to bundle all of your code into a single file:

```bash
simplifyify src/index.js

src/index.js --> src/index.bundle.js                # <-- unminified code
```

By default, the output file is at the same path as the entry file, but with a `.bundle.js` extension.  You can customize this using the `--outfile` argument:

```bash
simplifyify src/index.js --outfile dist/my-package.js

src/index.js --> dist/my-package.js                 # <-- unminified code
```

If you want the bundled code to be minified, then add the `--minify` flag:

```bash
simplifyify src/index.js --outfile dist/my-package.js --minify

src/index.js --> dist/my-package.js                 # <-- minified code
```

What if you also want a source map (`.map`) file?  Just add the `--debug` flag.

```bash
simplifyify src/index.js --outfile dist/my-package.js --minify --debug

src/index.js --> dist/my-package.js                 # <-- minified code
src/index.js --> dist/my-package.js.map             # <-- source map
```



#### One entry file --> multiple output files
Simplifyify can output multiple bundles of your code in a single command.  Let's say you want to create an unminified bundle for development (with a source map), a minified bundle for production (with a source map), and a test bundle (with code-coverage instrumentation) for testing:

```bash
simplifyify src/index.js --outfile dist/my-package.js --bundle --debug --minify --test

src/index.js --> dist/my-package.js                 # <-- unminified code
src/index.js --> dist/my-package.js.map             # <-- source map
src/index.js --> dist/my-package.min.js             # <-- minified code
src/index.js --> dist/my-package.min.js.map         # <-- source map
src/index.js --> dist/my-package.test.js            # <-- code-coverage
```



#### Multiple entry files --> multiple output files _for each_
In many applications, it doesn't make sense for _all_ of your code to be bundled into one huge file.  Maybe you want to create separate bundles for each folder, or for each component or section of your app.  Simplifyify makes this easy.  It will create separate bundles for each entry file that you specify.  For example:

```bash
simplifyify src/store.js src/cart.js src/checkout.js --outfile dist --bundle --minify --debug

src/store.js --> dist/store.js                      # <-- unminified code
src/store.js --> dist/store.js.map                  # <-- source map
src/store.js --> dist/store.min.js                  # <-- minified code
src/store.js --> dist/store.min.js.map              # <-- source map
src/cart.js --> dist/cart.js                        # <-- unminified code
src/cart.js --> dist/cart.js.map                    # <-- source map
src/cart.js --> dist/cart.min.js                    # <-- minified code
src/cart.js --> dist/cart.min.js.map                # <-- source map
src/checkout.js --> dist/checkout.js                # <-- unminified code
src/checkout.js --> dist/checkout.js.map            # <-- source map
src/checkout.js --> dist/checkout.min.js            # <-- minified code
src/checkout.js --> dist/checkout.min.js.map        # <-- source map
```

Specifying each entry file can quickly become cumbersome though.  That's where [globs](https://github.com/isaacs/node-glob#glob-primer) come in.  You can specify one or more globs, and Simplifyify will create a separate bundle for each file that matches the glob pattern.  For example:

```bash
simplifyify "src/*/index.js" --outfile "dist/*.bundle.js" --bundle --minify --debug

src/store/index.js --> dist/store/index.bundle.js               # <-- unminified code
src/store/index.js --> dist/store/index.bundle.js.map           # <-- source map
src/store/index.js --> dist/store/index.bundle.min.js           # <-- minified code
src/store/index.js --> dist/store/index.bundle.min.js.map       # <-- source map
src/cart/index.js --> dist/cart/index.bundle.js                 # <-- unminified code
src/cart/index.js --> dist/cart/index.bundle.js.map             # <-- source map
src/cart/index.js --> dist/cart/index.bundle.min.js             # <-- minified code
src/cart/index.js --> dist/cart/index.bundle.min.js.map         # <-- source map
src/checkout/index.js --> dist/checkout/index.bundle.js         # <-- unminified code
src/checkout/index.js --> dist/checkout/index.bundle.js.map     # <-- source map
src/checkout/index.js --> dist/checkout/index.bundle.min.js     # <-- minified code
src/checkout/index.js --> dist/checkout/index.bundle.min.js.map # <-- source map
```

> **TIP:** Don't forget to put quotes around your glob patterns! Otherwise, some shells (e.g. Bash) will try to expand them themselves, which may or may not work



Browserify Transforms
--------------------------
Simplifyify honors the [`browserify.transform`](https://github.com/substack/node-browserify#browserifytransform) field in your `package.json` file.  For example, the following configuration would use [Babelify](https://github.com/babel/babelify) to transform your ES6 code to ES5:

```json
{
  "name": "my-package",
  "version": "1.2.3",
  "browserify": {
    "transform": ["babelify"]
  },
  "devDependencies": {
    "babelify": "^7.2.0",
  }
}
```

You can also specify options for your transforms.  The exact options depend on the transform you're using.  Here's an example that configures [Babelify](https://github.com/babel/babelify) and also modifies Simplifyify's default config for [uglifyify](https://www.npmjs.com/package/uglifyify):

```json
{
  "name": "my-package",
  "version": "1.2.3",
  "browserify": {
    "transform": [
        ["babelify", {
          "presets": ["es2015"]
        }],
        ["uglifyify", {
          "mangle": true,
          "compress": {
            "sequences": true,
            "dead_code": true,
            "booleans": true,
            "conditionals": true,
            "if_return": false,
            "drop_console": false,
            "keep_fnames": true
          },
          "output": {
            "comments": false
          }
        }]
    ]
  },
  "devDependencies": {
    "babelify": "^7.2.0",
  }
}
```



API
--------------------------
Simplifyify also has a programmatic API, so you can use it directly in your build scripts (Gulp, Grunt, Broccoli, etc.)

[Here's the API definition](https://github.com/BigstickCarpet/simplifyify/blob/6709bb5bbf59b327b4ced3e833078de8db006b5a/lib/index.js#L9-L28), and [here's a full example](https://github.com/BigstickCarpet/simplifyify/blob/6709bb5bbf59b327b4ced3e833078de8db006b5a/bin/simplifyify.js#L71-L102). Just pass an array of strings (file paths and/or glob patterns) and an options param.  You get back an [`EventEmitter`](https://nodejs.org/api/events.html#events_class_events_eventemitter), which fires all the Browserify &amp; Watchify events.

```javascript
var simplifyify = require("simplifyify");

gulp.task("browserify", function(done) {
  simplifyify("lib/*.module.js",
    {
        outfile: "dist/*.bundle.js",
        debug: true,
        minify: true
    })
    .on("end", function() {
        // Finished successfully!
        done();
    })
    .on("error", function(err) {
        // Something went wrong
        done(err);
    });
});
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

3. __Run the tests__<br>
`npm test`



License
--------------------------
Simplifyify is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

