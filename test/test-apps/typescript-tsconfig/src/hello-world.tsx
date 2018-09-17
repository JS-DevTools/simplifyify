import * as React from 'react';
import say from './say';

/**
 * Says hello.
 *
 * @param {string} [name] - Who to say hello to
 */
export function Hello(name: string = 'world') {
  // This is NOT an important comment
  let hello = say('hello', name);
  return <div>{hello}</div>;
}
