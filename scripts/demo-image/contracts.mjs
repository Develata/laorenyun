import assert from 'node:assert/strict';
export const imageRepository = 'ghcr.io/develata/laorenyun-demo-private';
export const packagePath = 'users/Develata/packages/container/laorenyun-demo-private';
export const digestPattern = /^sha256:[a-f0-9]{64}$/;
export function commitInput(commit) { assert.match(commit, /^[a-f0-9]{40}$/, 'full commit SHA required'); return commit; }
export function privateVisibility(status, body, allowMissing = false) {
  if (allowMissing && status === 404) return;
  assert.equal(status, 200, 'package visibility could not be verified');
  assert.equal(body.visibility, 'private', 'demo package must be private');
  assert.equal(body.name, 'laorenyun-demo-private', 'unexpected package identity');
}
export function imageTag(commit, run, attempt) {
  commitInput(commit); assert.match(run, /^\d+$/); assert.match(attempt, /^\d+$/);
  return `${imageRepository}:sha-${commit}-${run}-${attempt}`;
}
