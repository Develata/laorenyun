import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const repo = 'ghcr.io/develata/laorenyun';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const digestPattern = /^sha256:[a-f0-9]{64}$/;
export function releaseVersion(tag) {
  assert.match(tag, /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?$/);
  return tag.slice(1);
}
export function verifyInputs({tag, commit, tagCommit, pin, pluginTagCommit, pluginPackage, upstream}) {
  const version = releaseVersion(tag);
  assert.match(commit, /^[a-f0-9]{40}$/);
  assert.equal(commit, tagCommit, 'tag/checkout mismatch');
  assert.equal(pin.repository, 'https://github.com/Develata/dsh-laorenyun');
  assert.match(pin.commit, /^[a-f0-9]{40}$/);
  assert.equal(pin.version, version, 'tag/version mismatch');
  assert.equal(pluginTagCommit, pin.commit, 'plugin release tag missing or incoherent');
  assert.equal(pluginPackage.name, 'dsh-laorenyun');
  assert.equal(pluginPackage.version, version);
  assert.equal(upstream.commit, '0d1f50007f9bca3f52b06e1c3074fa14d5fb0720');
  assert.equal(upstream.version, '0.1.6-alpha.1');
  return {tag, version, commit, plugin: pin.commit, dsh: upstream.commit};
}
export function immutableIdentity(existing, intended) {
  assert.match(intended, digestPattern);
  if (existing !== null) assert.equal(existing, intended, 'immutable image identity differs');
}
export function releaseCompose(compose, digest) {
  assert.match(digest, digestPattern);
  assert.match(compose, /    image: laorenyun:[^\n]+\n    build: \.\n/);
  const text = compose.replace(/    image: laorenyun:[^\n]+\n    build: \.\n/, `    image: ${repo}@${digest}\n`);
  assert.ok(!/^\s*build:/m.test(text));
  assert.ok(text.includes('127.0.0.1:${LAORENYUN_PORT:-3080}:3080'));
  return text;
}
export function sourceProblems(inventory, manifest, files) {
  const problems = [];
  if (manifest.schema !== 1 || manifest.inventorySha256 !== sha256(JSON.stringify(inventory))) problems.push('INVENTORY_MISMATCH');
  if (!digestPattern.test(manifest.imageId ?? '')) problems.push('IMAGE_ID_INVALID');
  const expected = new Map();
  // Conservative policy: deliver exact source for every Debian source package; no inferred System Library exemption.
  for (const p of inventory.os) expected.set(`deb:${p.sourcePackage}@${p.sourceVersion}`, {version:p.sourceVersion});
  for (const p of [...inventory.packages, ...inventory.buildClosure]) expected.set(`npm:${p.name}@${p.version}`, {version:p.version,license:p.license});
  for (const [name, version] of Object.entries(inventory.nativeVersions ?? {})) expected.set(`vips:${name}@${version}`, {version});
  const byId = new Map((manifest.components ?? []).map(x=>[x.id,x]));
  if (byId.size !== (manifest.components ?? []).length) problems.push('DUPLICATE_COMPONENT');
  for (const id of expected.keys()) {
    const c = byId.get(id);
    if (!c || !c.license || !c.sourceIdentity || !c.review || !['source','notice-only'].includes(c.delivery)) {problems.push(`UNREVIEWED:${id}`);continue;}
    if (expected.get(id).license && typeof expected.get(id).license === 'string' && c.license !== expected.get(id).license) problems.push(`LICENSE_MISMATCH:${id}`);
    if (!Array.isArray(c.notices) || !c.notices.length) problems.push(`MISSING_NOTICES:${id}`);
    const required = [...(c.notices ?? [])];
    if (c.delivery === 'source') {
      if (!c.sources?.length || !c.buildMaterial?.length) problems.push(`MISSING_SOURCE_BUILD:${id}`);
      required.push(...(c.sources ?? []), ...(c.buildMaterial ?? []));
    } else if (id.startsWith('deb:') || id.startsWith('vips:') || /GPL|MPL|CDDL|CPL|EPL|unknown|SEE LICENSE/i.test(c.license)) {
      problems.push(`SOURCE_REQUIRED:${id}`);
    }
    for (const f of required) if (!files.has(f) || !/^[a-f0-9]{64}$/.test(manifest.files?.[f] ?? '')) problems.push(`MISSING_MATERIAL:${id}:${f}`);
  }
  if (JSON.stringify(manifest.nativeVersions)!==JSON.stringify(inventory.nativeVersions)) problems.push('NATIVE_INVENTORY_MISMATCH');
  if (!expected.size || !Object.keys(inventory.nativeVersions ?? {}).length) problems.push('EMPTY_INVENTORY');
  if (manifest.reviewStatus !== 'complete') problems.push('SOURCE_REVIEW_INCOMPLETE');
  return [...new Set(problems)].sort();
}
