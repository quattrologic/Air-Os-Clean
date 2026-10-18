'use strict';
// Cloud Sync preparation: local-only, opt-in. No network or credential storage.
const crypto = require('node:crypto');
const ALLOWED = new Set(['settings', 'notes', 'calendar']);
const MAX_BYTES = 256 * 1024;
function validateDocument(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid document');
  const { kind, id, data, updatedAt } = input;
  if (!ALLOWED.has(kind)) throw new Error('Unsupported sync category');
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new Error('Invalid document ID');
  if (typeof updatedAt !== 'string' || !Number.isFinite(Date.parse(updatedAt))) throw new Error('Invalid timestamp');
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid data');
  const serialized = JSON.stringify(data);
  if (Buffer.byteLength(serialized, 'utf8') > MAX_BYTES) throw new Error('Document too large');
  const forbidden = /password|passwd|token|secret|credential|private.?key|salt|hash|session|auth/i;
  function check(value, depth = 0) {
    if (depth > 12) throw new Error('Document nesting too deep');
    if (Array.isArray(value)) return value.forEach(v => check(v, depth + 1));
    if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        if (forbidden.test(key)) throw new Error('Sensitive field is not syncable');
        check(child, depth + 1);
      }
    }
  }
  check(data);
  return { kind, id, data: JSON.parse(serialized), updatedAt };
}
function fingerprint(doc) {
  const normalized = validateDocument(doc);
  return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}
function compare(local, remote) {
  if (!local && !remote) return { status: 'empty' };
  if (!local) return { status: 'remote-only', remote: validateDocument(remote) };
  if (!remote) return { status: 'local-only', local: validateDocument(local) };
  const a = validateDocument(local), b = validateDocument(remote);
  if (a.kind !== b.kind || a.id !== b.id) throw new Error('Different documents');
  if (fingerprint(a) === fingerprint(b)) return { status: 'equal' };
  // Never choose a winner based on device clocks. Require explicit conflict resolution.
  return { status: 'conflict', local: a, remote: b };
}
module.exports = { validateDocument, fingerprint, compare, ALLOWED };
