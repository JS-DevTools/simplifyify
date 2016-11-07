# Change Log
All notable changes will be documented in this file.
`simplifyify` adheres to [Semantic Versioning](http://semver.org/).


## [v3.1.0](https://github.com/BigstickCarpet/simplifyify/tree/v3.1.0) (2016-11-06)

#### New Feature: [bannerify](https://www.npmjs.com/package/bannerify) support
Just add a `banner.txt` file to your project, and it'll automatically be added to your output bundle(s). The `banner.txt` file can contain [Lodash templates](https://lodash.com/docs/4.16.6#template), which have access to the full [lodash](https://lodash.com/docs/4.16.6) library as well as [moment-js](http://momentjs.com/) for date/time formatting.  See [this example](https://github.com/BigstickCarpet/simplifyify/blob/master/test/test-apps/hello/banner.txt).

#### Better performance
File i/o operations have been optimized in this release. Files that are likely to be needed by multiple entry files are cached so they only need to be read once.  Other file i/o operations that were previously synchronous are now asynchronous.


[Full Changelog](https://github.com/BigstickCarpet/simplifyify/compare/v3.0.0...v3.1.0)


## [v3.0.0](https://github.com/BigstickCarpet/simplifyify/tree/v3.0.0) (2016-11-02)

#### Major changes in this release:

##### 1) Dropped support for Node 0.x
Simplifyify now requires Node 4.0 or greater, which is in-line with the [Node.js LTS schedule](https://github.com/nodejs/LTS). Many other dev tools, including some that `simplifyify` depends on, have also started dropping support for Node 0.x.  Time to upgrade, folks.

##### 2) Better minification
Simplifyify has always used [uglifyify](https://www.npmjs.com/package/uglifyify) under the hood to minify each module individually, but now it _also_ uses [UglifyJS](https://github.com/mishoo/UglifyJS2#uglifyjs-2) to minify the entire bundle file. This [2-phase process](https://github.com/BigstickCarpet/simplifyify/blob/5ab81a30242b585bee21915fe899714404a4e81a/lib/add-transforms.js#L91-L159) produces the [smallest output possible](https://github.com/hughsk/uglifyify#motivationusage).

##### 3) Configure Uglifyify and Istanbul options
You can now specify custom options for the built-in Uglifyify and Istanbul transforms via the [`browserify.transform`](https://github.com/substack/node-browserify#browserifytransform) in your `package.json`. See [this example](https://github.com/BigstickCarpet/simplifyify#browserify-transforms) in the ReadMe.

[Full Changelog](https://github.com/BigstickCarpet/simplifyify/compare/v2.0.4...v3.0.0)


## [v2.0.0](https://github.com/BigstickCarpet/simplifyify/tree/v2.0.0) (2015-12-28)

#### Major changes in this release:

##### 1) Support for Browserify transforms
Simplifyify will now check your `package.json` file to see if you have a [browserify.transform](https://github.com/substack/node-browserify#browserifytransform) field.  If so, then it will automatically add those transforms.  No need to specify them on the command line.  See [the readme](https://github.com/BigstickCarpet/simplifyify#browserify-transforms) for more details.

##### 2) You choose whether the "default" bundle gets created
In previous versions, Simplifyify _always_ created an unminified bundle.  This makes sense if you don't specify _any_ output options.  But if you _do_ specify output options (such as `--test` or `--minify`), then you may not have expected it to _also_ create an unminified bundle.  So, in this version, there is now a `--bundle` option that you must use to explicitly specify that you want an unminified bundle.  Otherwise, only the bundle(s) that you explicitly specify will be created.

[Full Changelog](https://github.com/BigstickCarpet/simplifyify/compare/v1.6.0...v2.0.0)
