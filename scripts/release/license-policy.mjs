// Notice-only is an audited choice, never inferred from an ecosystem prefix.
// Unknown/custom/exception-bearing expressions remain source-review obligations.
const permissive = new Set(['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD', 'Apache-2.0', 'Zlib', 'BSL-1.0', 'Unlicense', 'CC0-1.0']);
export function noticeOnlyLicense(expression, choice) {
  if (typeof expression !== 'string') return false;
  const tokens = expression.match(/\(|\)|[^\s()]+/g) ?? [];
  let i = 0;
  function atom() {
    if (tokens[i] === '(') {
      i++; const value = or();
      if (tokens[i++] !== ')') throw Error('unbalanced');
      return value;
    }
    const token = tokens[i++];
    if (!token || ['AND', 'OR', ')'].includes(token)) throw Error('invalid');
    return permissive.has(token) && (choice === undefined || token === choice);
  }
  function and() { let value = atom(); while (tokens[i] === 'AND') { i++; const next = atom(); value = value && next; } return value; }
  function or() { let value = and(); while (tokens[i] === 'OR') { i++; const next = and(); value = value || next; } return value; }
  try { const value = or(); return i === tokens.length && value; } catch { return false; }
}
