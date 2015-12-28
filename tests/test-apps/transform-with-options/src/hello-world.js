import say from './say';

/**
 * Says hello.
 *
 * @param {string} [name] - Who to say hello to
 */
export default function hello(name) {
  // This is NOT an important comment
  let words = ['hello', name || world];
  say(...words);
}
