'use strict';

var resolve = require('./resolve');
var cwd = process.cwd() + '/';

module.exports = {
  resolve: resolve.bind(null, cwd),
};
