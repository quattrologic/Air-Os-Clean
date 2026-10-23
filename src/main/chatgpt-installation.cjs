'use strict';
const fs = require('node:fs/promises');

// A candidate is NOT proof of OpenAI identity or OS compatibility. No launching
// until those checks and the supported native activation mechanism are verified.
const MAC_CANDIDATE = '/Applications/ChatGPT.app';
function createChatGPTInstallationProbe({platform = process.platform, lstat = fs.lstat, realpath = fs.realpath} = {}) {
  return Object.freeze({async inspect() {
    if (platform !== 'darwin') return {status: 'unavailable', reason: 'platform-not-implemented'};
    let entry;
    try {
      entry = await lstat(MAC_CANDIDATE);
    } catch (error) {
      if (error.code === 'ENOENT') return {status: 'not-found', scope: 'system-applications'};
      throw new Error('Der ChatGPT-Installationspfad konnte nicht geprüft werden.');
    }
    if (!entry.isDirectory() || entry.isSymbolicLink()) return {status: 'rejected', reason: 'not-a-local-bundle-directory'};
    let resolved;
    try { resolved = await realpath(MAC_CANDIDATE); }
    catch { throw new Error('Der ChatGPT-Installationspfad konnte nicht geprüft werden.'); }
    if (resolved !== MAC_CANDIDATE) return {status: 'rejected', reason: 'redirected-path'};
    return {status: 'candidate-found', path: MAC_CANDIDATE, identityVerified: false};
  }});
}
module.exports = {createChatGPTInstallationProbe};
