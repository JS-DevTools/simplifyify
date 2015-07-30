'use strict';

var say = require('./say');

/**
 * Says hello.
 *
 * @param {string} [name] - Who to say hello to
 */
module.exports = function hello(name) {
  say('hello', name || 'world');
};
