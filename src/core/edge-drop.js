'use strict';
// GENERATED from pinned Apache-2.0 Edge-Drop originals. See third_party/edge-drop/NOTICE.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airEdgeDrop=api;})(typeof window==='object'?window:null,function(){
// electron/store/signature.ts
/**
 * Stable, content-based key used for item deduplication and for correlating
 * staged temp artifacts with the history entries that own them.
 *
 * Single source of truth: the ItemStore dedup index and the staged-temp
 * registry MUST agree on identity, otherwise lifecycle cleanup would either
 * delete files that are still owned (data loss) or leak them forever.
 */
                                                  

function contentSignature(data          )         {
  switch (data.kind) {
    case 'text':
      return `text|${data.text}`
    case 'image':
      return data.bytes && data.bytes > 0 ? `image|${data.width}x${data.height}|${data.bytes}` : `image|${data.imageId}`
    case 'image-collection':
      return `image-collection|${data.images.map((i) => `${i.width}x${i.height}|${i.bytes || i.imageId}`).join(',')}`
    case 'files':
      return `files|${data.paths.join('\n')}`
  }
}

// shared/linkText.ts
/**
 * What counts as a copied link, and the page title a browser may copy with it.
 *
 * Shared by main (capture), the preload (drag-in) and the renderer, so a link
 * is recognized the same way wherever it comes from. Pure string work: no
 * network, no DOM.
 */

/** Links with a scheme or www.: anything without spaces. */
const SCHEME_LINK = /^(?:https?:\/\/|www\.)[^\s]+$/i
const MAILTO = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i
const TEL = /^tel:\+?[\d\s().-]{5,}$/i

/**
 * Real top-level domains a bare "example.com/page" may end in. Kept to common
 * ones so ordinary text ("Node.js", "e.g.", "v1.2") never becomes a link.
 */
const TLDS = new Set([
  'com', 'net', 'org', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'io', 'co', 'ai', 'app', 'dev', 'me', 'tv',
  'in', 'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'ru', 'br', 'it', 'es', 'nl', 'se', 'no', 'fi', 'dk', 'pl',
  'ch', 'at', 'be', 'ie', 'nz', 'za', 'sg', 'hk', 'tw', 'kr', 'id', 'my', 'ph', 'vn', 'th', 'tr', 'ae', 'sa', 'il',
  'eg', 'ng', 'ke', 'pk', 'bd', 'lk', 'np', 'mx', 'ar', 'cl', 'pe', 'eu', 'asia', 'xyz', 'online', 'site', 'tech',
  'store', 'shop', 'blog', 'news', 'live', 'link', 'page', 'cloud', 'email', 'so', 'gg', 'ly', 'to', 'fm', 'sh',
  'md', 'py', 'rs', 'cc', 'ws', 'one', 'zip', 'mov', 'design', 'studio', 'art', 'wiki', 'top', 'icu', 'pro', 'gl', 'gd', 'is'
])
/** TLDs that are also common file extensions ("notes.md", "logo.ai"): need a path to count. */
const NEEDS_PATH = new Set(['md', 'py', 'rs', 'sh', 'pl', 'cc', 'zip', 'mov', 'ai', 'so', 'app', 'is', 'to', 'gd'])
const BARE_LINK = /^((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+)([a-z]{2,24})(:\d{2,5})?([/?#][^\s]*)?$/i

/** True when the whole text is one link (scheme, www., mailto:, tel:, or a bare domain). */
function isLinkText(text        )          {
  const t = typeof text === 'string' ? text.trim() : ''
  if (!t || t.length > 8192) return false
  if (SCHEME_LINK.test(t) || MAILTO.test(t) || TEL.test(t)) return true
  const m = BARE_LINK.exec(t)
  if (!m) return false
  const tld = m[2].toLowerCase()
  if (!TLDS.has(tld)) return false
  if (NEEDS_PATH.has(tld) && !m[4]) return false
  return true
}

/* ------------------------------------------------------------------ */
/* Page title copied with the link                                     */
/* ------------------------------------------------------------------ */

const ENTITIES                         = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" }

function decodeEntities(s        )         {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+|#39);/gi, (all, name        ) => {
    const n = name.toLowerCase()
    if (n.startsWith('#x')) {
      const code = parseInt(n.slice(2), 16)
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : all
    }
    if (n.startsWith('#')) {
      const code = parseInt(n.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : all
    }
    return ENTITIES[n] ?? all
  })
}

/** Scheme, www., case of the host and a trailing slash don't make two links different. */
function sameLink(a        , b        )          {
  const norm = (s        ) => s.trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '').replace(/\/+(?=$|[?#])/, '').toLowerCase()
  return norm(a) === norm(b)
}

const TITLE_MAX = 200

/**
 * The page title a browser put on the clipboard next to the link (Edge
 * "friendly links" and other apps copy `<a href="link">Page title</a>`).
 * Only an anchor pointing at this same link counts, and only text that isn't
 * itself a link. Undefined when there is none.
 */
function linkTitleFromHtml(html                    , link        )                     {
  if (!html || typeof html !== 'string' || html.length > 200000 || !link) return undefined
  const re = /<a\b[^>]*?\bhref\s*=\s*(["'])([\s\S]*?)\1[^>]*>([\s\S]*?)<\/a\s*>/gi
  let m                        
  let guard = 0
  while ((m = re.exec(html)) && guard++ < 50) {
    const href = decodeEntities(m[2])
    if (!sameLink(href, link)) continue
    const text = decodeEntities(m[3].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
    if (!text || sameLink(text, link) || isLinkText(text)) continue
    const chars = Array.from(text)
    return chars.length > TITLE_MAX ? chars.slice(0, TITLE_MAX - 1).join('').trimEnd() + '…' : text
  }
  return undefined
}

// shared/itemMeta.ts
/**
 * The user's note on a clipboard item: one line of plain text that says what
 * it is ("Office Wi-Fi password", "Invoice for Acme, March"), so search finds
 * it later and the card is recognizable.
 *
 * It lives at the top level of the item (not inside `data`, so dedup, touch
 * and the DTO keep it unchanged). The main process normalizes every write
 * through these functions, so whatever the renderer sends, only clean values
 * are ever stored. A note also keeps the item: history limit, auto-delete,
 * clear-on-restart and the Clear button leave it alone (see isKept).
 */

const NOTE_MAX = 120

                                
                                                                          
                      
 

/** Cut a string to `max` characters without splitting a surrogate pair. */
function clip(value        , max        )         {
  const chars = Array.from(value)
  return chars.length > max ? chars.slice(0, max).join('') : value
}

/**
 * One line of plain text: control characters and runs of whitespace become a
 * single space, trimmed, at most NOTE_MAX characters. Empty -> undefined.
 */
function normalizeNote(value         )                     {
  if (typeof value !== 'string') return undefined
  const flat = value.replace(/[\u0000-\u001f\u007f\s]+/g, ' ').trim()
  const out = clip(flat, NOTE_MAX).trim()
  return out || undefined
}

/** Two notes as one (merging cards): both, once each, joined with " · ". */
function joinNotes(a                    , b                    )                     {
  if (!a || !b) return normalizeNote(a ?? b)
  if (a.toLowerCase() === b.toLowerCase()) return normalizeNote(a)
  return normalizeNote(`${a} · ${b}`)
}

/**
 * The note for an item saved before notes replaced labels and tags: the
 * label, then the tags as words ("Wifi password · home network").
 */
function noteFromLegacy(label         , tags         )                     {
  const words = Array.isArray(tags)
    ? tags.filter((t)              => typeof t === 'string').map((t) => t.replace(/^#+/, '').trim()).filter(Boolean).join(' ')
    : ''
  return joinNotes(normalizeNote(label), normalizeNote(words))
}

/** Kept items survive every automatic or bulk removal: pinned, or noted. */
function isKept(item                                     )          {
  return !!item.pinned || !!item.note
}

// src/lib/search.ts
/**
 * Shelf search: every word typed must appear somewhere in the item, in any
 * order, across what it holds (text, file names) and the user's note.
 *
 *   "acme invoice"  finds a note "Invoice for Acme, March"
 *   "wifi office"   finds "Office Wi-Fi password"
 *
 * Matching ignores case and accents ("resume" finds "Résumé"), and a word
 * also matches with punctuation and spaces taken out on both sides, so
 * "wifi" finds "Wi-Fi" and "e-mail" finds "email".
 */

/** Lowercase, accents removed. */
function foldText(s        )         {
  return s.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase()
}

/** Only the letters and digits of a folded string. */
function packText(s        )         {
  return s.replace(/[^\p{L}\p{N}]+/gu, '')
}

                             
                         
              
                                                                             
                
 

/** The words of a query ([] for an empty one). */
function queryWords(query        )               {
  return foldText(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ word, packed: packText(word) }))
}

                             
                
                
 

/** An item's searchable text, folded once. */
function searchText(parts                                   )             {
  const folded = foldText(parts.filter(Boolean).join('\n'))
  return { folded, packed: packText(folded) }
}

/** True when every word is found in the text. */
function matchesWords(text            , words                       )          {
  for (const w of words) {
    if (text.folded.includes(w.word)) continue
    if (w.packed && text.packed.includes(w.packed)) continue
    return false
  }
  return true
}

// electron/preload/internalDragGuard.ts
/**
 * Internal-drag boomerang guard — pure state machine.
 *
 * PROBLEM
 * -------
 * When Edge-Drop exports an item via a native OS drag and the user drops it
 * back onto our own window, Windows delivers that drop ASYNCHRONOUSLY after
 * the OLE loop returns — sometimes well over a second later on loaded
 * systems. Without protection the delivered files re-enter item:add-files
 * as a fresh import (self-drop duplication).
 *
 * INVARIANT (physics, not timing)
 * -------------------------------
 * There is exactly one mouse. After one of OUR drags starts, the FIRST drop
 * event observed is ours — no human can start dragging a file from Explorer
 * into us before finishing the current gesture. Therefore:
 *
 *   armed  : from our dragstart until the first drop is consumed
 *   drop   : while armed => ours => swallow + consume back to idle
 *   dragEnd: begins 'releasing' — a grace window (GUARD_AUTO_IDLE_MS) that
 *            still swallows late-deferred deliveries, then self-heals to
 *            idle so external imports can never be permanently blocked.
 *
 * The 'armed' phase intentionally has NO timer: Chromium synthesizes
 * dragend reliably (including Esc-cancel), and a mid-gesture expiry would
 * unprotect the boomerang. Worst case if dragend were never fired (crash-
 * level defect): ONE external import gets swallowed, then the machine
 * self-heals via that very consume.
 *
 * Pure reducer + explicit events so every transition is unit-testable.
 */

                                                       

                             
                   
                                                      
                       
 

/** Grace window after dragEnd that still swallows deferred deliveries. */
const GUARD_AUTO_IDLE_MS = 1500

                        
                   
                                    
                    
                                 

const IDLE             = { phase: 'idle', fireAt: null }

function reduceGuard(state            , event            )             {
  switch (event.type) {
    case 'arm':
      // Re-arming at any time (redundant dragstart, new gesture) yields a
      // clean armed phase and cancels any pending release.
      return { phase: 'armed', fireAt: null }

    case 'drop':
      // First drop while armed/releasing is OURS by the single-mouse
      // invariant: consume it and return to idle. Drops while idle are not
      // routed through the reducer at all (external imports flow normally).
      return IDLE

    case 'dragEnd':
      if (state.phase !== 'armed') return state
      return { phase: 'releasing', fireAt: event.now + GUARD_AUTO_IDLE_MS }

    case 'tick':
      if (state.phase !== 'releasing' || state.fireAt === null) return state
      if (event.now >= state.fireAt) return IDLE
      return state

    default:
      return state
  }
}

/** Convenience predicate used by the drop listener. */
function isGuarded(state            )          {
  return state.phase !== 'idle'
}

return Object.freeze({contentSignature,isLinkText,linkTitleFromHtml,NOTE_MAX,normalizeNote,joinNotes,noteFromLegacy,isKept,foldText,queryWords,searchText,matchesWords,GUARD_AUTO_IDLE_MS,reduceGuard,isGuarded});
});
