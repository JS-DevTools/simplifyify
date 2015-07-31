'use strict';

/**
 * Says something to somebody.
 *
 * @param {string} what - What to say
 * @param {string} [who] - Who to say goodbye to
 */
module.exports = function say(what, who) {
  //! This is an important comment
  // This is NOT an important comment
  console.log('%s, %s!', what, who);
};

