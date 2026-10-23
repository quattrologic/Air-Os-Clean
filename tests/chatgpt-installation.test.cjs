'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createChatGPTInstallationProbe} = require('../src/main/chatgpt-installation.cjs');

// Platform/filesystem doubles on Linux; not native macOS/Windows validation.
function fixture(overrides = {}) {
  const calls = [];
  return {calls, probe: createChatGPTInstallationProbe({
    platform: 'darwin',
    lstat: async path => { calls.push(path); return {isDirectory: () => true, isSymbolicLink: () => false}; },
    realpath: async path => path,
    ...overrides
  })};
}
test('macOS installation candidate is explicitly unverified, with only one fixed path inspected', async () => {
  const {probe, calls} = fixture();
  assert.deepEqual(await probe.inspect(), {status: 'candidate-found', path: '/Applications/ChatGPT.app', identityVerified: false});
  assert.deepEqual(calls, ['/Applications/ChatGPT.app']);
  assert.equal(probe.launch, undefined); // Cannot accidentally start an unverified candidate.
});
test('missing system installation is scoped, not a claim that no user installation exists', async () => {
  const {probe} = fixture({lstat: async () => { throw Object.assign(new Error('missing'), {code: 'ENOENT'}); }});
  assert.deepEqual(await probe.inspect(), {status: 'not-found', scope: 'system-applications'});
});
test('a file or symlink masquerading as a bundle is rejected before resolving', async () => {
  for (const [directory, symlink] of [[false, false], [false, true], [true, true]]) {
    const {probe} = fixture({
      lstat: async () => ({isDirectory: () => directory, isSymbolicLink: () => symlink}),
      realpath: async () => { assert.fail('must not resolve unsuitable entry'); }
    });
    assert.deepEqual(await probe.inspect(), {status: 'rejected', reason: 'not-a-local-bundle-directory'});
  }
});
test('canonical redirection to another bundle or location is rejected', async () => {
  for (const path of ['/Applications/Safari.app', '/Volumes/Other/ChatGPT.app']) {
    assert.deepEqual(await fixture({realpath: async () => path}).probe.inspect(), {status: 'rejected', reason: 'redirected-path'});
  }
});
test('permission, I/O and disappearing-path errors are not reported as missing installation; retry works', async () => {
  for (const code of ['EACCES', 'EIO']) {
    await assert.rejects(fixture({lstat: async () => { throw Object.assign(new Error('private details'), {code}); }}).probe.inspect(), /^Error: Der ChatGPT-Installationspfad konnte nicht geprüft werden\.$/);
  }
  let missing = true;
  const {probe} = fixture({realpath: async path => { if (missing) throw Object.assign(new Error('gone'), {code: 'ENOENT'}); return path; }});
  await assert.rejects(probe.inspect(), /konnte nicht geprüft/);
  missing = false;
  assert.equal((await probe.inspect()).status, 'candidate-found');
});
test('Windows and other platforms report unimplemented integration without filesystem probes', async () => {
  for (const platform of ['win32', 'linux', 'freebsd']) {
    const {probe, calls} = fixture({platform});
    assert.deepEqual(await probe.inspect(), {status: 'unavailable', reason: 'platform-not-implemented'});
    assert.deepEqual(calls, []);
  }
});
