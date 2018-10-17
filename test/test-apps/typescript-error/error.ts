// This is a syntax error because the "to" parameter doesn't have a type
// and the "noImplicitAny" option is enabled in tsconfig.json
function say(what: string, to): string {
  return `${what}, ${to}`;
}
