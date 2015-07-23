'use strict';

/**
 * Says something to somebody.
 * @param {string} what - What to say
 * @param {string} [who] - Who to say goodbye to
 */
module.exports = function say(what, who) {
  console.log('%s, %s!', what, who);
};

