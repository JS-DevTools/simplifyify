'use strict';

var resolve = require('./resolve');
var cwd = getCurrentDirectory();

module.exports = {
  resolve: resolve.bind(null, cwd),
};

/**
 * Gets the current directory in the web browser.
 *
 * @returns {string}
 */
function getCurrentDirectory () {
  var path = location.href;
  var segments = path.split('/');
  var lastSegment = segments[segments.length - 1];

  if (/\.\w+$/.test(lastSegment)) {
    // The URL is a file path (e.g. "http://example.com/dir/index.html")
    // So return all but the last segment (e.g. "http://example.com/dir/")
    segments.pop();
    return segments.join('/') + '/';
  }
  else {
    // The URL is a directory path (e.g. "http://example.com/dir")
    if (path[path.length - 1] === '/') {
      return path;
    }
    else {
      return path + '/';
    }
  }
}
