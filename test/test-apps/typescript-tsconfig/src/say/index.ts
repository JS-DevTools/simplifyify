/**
 * Says something to somebody.
 *
 * @param {string} [what] - What to say
 * @param {string} [who] - Who to say it to
 */
export default function say(what: string, who: string): string {
  //! This is an important comment
  // This is NOT an important comment
  return `${what} ${who}`;
}
