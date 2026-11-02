'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rootDir = path.join(__dirname, '..');

test('notch assets are loaded by the desktop and shipped with Electron', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const pack = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  assert.match(html, /href="air-notch\.css"/);
  assert.match(html, /src="air-notch\.js"/);
  assert.ok(pack.build.files.includes('air-notch.js'));
  assert.ok(pack.build.files.includes('air-notch.css'));
  assert.match(fs.readFileSync(path.join(rootDir, 'app.js'), 'utf8'), /id="air-notch-enabled"/);
  new vm.Script(fs.readFileSync(path.join(rootDir, 'air-notch.js'), 'utf8'));
});

test('notch timer, music bridge and visibility work without native system APIs', () => {
  const callbacks = {};
  const dispatched = [];
  const classNames = new Set();
  let now = Date.now();
  let interval;

  function element(dataset = {}) {
    const events = {};
    const attrs = {};
    const classes = new Set();
    return {
      dataset, events, attrs,
      hidden: false, disabled: false, textContent: '',
      classList: {
        toggle(name, active) {
          const enabled = active === undefined ? !classes.has(name) : !!active;
          if (enabled) classes.add(name); else classes.delete(name);
        },
        contains(name) { return classes.has(name); }
      },
      setAttribute(name, value) { attrs[name] = value; },
      hasAttribute(name) { return Object.prototype.hasOwnProperty.call(attrs, name); },
      addEventListener(name, fn) { events[name] = fn; },
      focus() {}
    };
  }

  const trigger = element();
  const panel = element();
  panel.hidden = true;
  const musicButtons = ['previous', 'toggle', 'next'].map(action => element({ notchMusic: action }));
  const presets = [5, 10, 25].map(minutes => element({ notchMinutes: String(minutes) }));
  const timerToggle = element({ notchTimer: 'toggle' });
  const controls = new Map([
    ['.air-notch-trigger', trigger],
    ['#air-notch-panel', panel],
    ['.air-notch-countdown', element()],
    ['.air-notch-timer-status', element()],
    ['[data-notch-timer="toggle"]', timerToggle],
    ['.air-notch-track-title', element()],
    ['.air-notch-track-artist', element()],
    ['.air-notch-indicator', element()],
    ['.air-notch-trigger-label', element()],
    ['.air-notch-time', element()],
    ['.air-notch-event-title', element()],
    ['.air-notch-event-time', element()],
    ['[data-notch-music="toggle"]', musicButtons[1]]
  ]);
  const notch = {
    hidden: false,
    innerHTML: '',
    events: {},
    classList: {
      toggle(name, active) {
        if (active) classNames.add(name); else classNames.delete(name);
      }
    },
    setAttribute() {},
    addEventListener(name, fn) { this.events[name] = fn; },
    querySelector(selector) {
      assert.ok(controls.has(selector), 'Unexpected selector: ' + selector);
      return controls.get(selector);
    },
    querySelectorAll(selector) {
      if (selector === '[data-notch-music]') return musicButtons;
      if (selector === '[data-notch-minutes]') return presets;
      throw new Error('Unexpected selector: ' + selector);
    }
  };

  const document = {
    querySelector(selector) {
      if (selector === '.menubar') return { insertAdjacentElement(_position, child) { assert.equal(child, notch); } };
      return null;
    },
    createElement(tag) { assert.equal(tag, 'section'); return notch; },
    addEventListener(name, fn) { callbacks[name] = fn; }
  };
  const window = {
    addEventListener(name, fn) { callbacks[name] = fn; },
    dispatchEvent(event) { dispatched.push(event); }
  };
  const localStorage = { getItem() { return '[]'; } };
  class TestClock extends Date {
    static now() { return now; }
  }
  class FakeCustomEvent {
    constructor(type, data) { this.type = type; this.detail = data.detail; }
  }
  const source = fs.readFileSync(path.join(rootDir, 'air-notch.js'), 'utf8');
  vm.runInNewContext(source, {
    document, window, localStorage, Date: TestClock, CustomEvent: FakeCustomEvent,
    setInterval(callback) { interval = callback; }
  });

  assert.equal(notch.hidden, false);
  assert.equal(controls.get('.air-notch-countdown').textContent, '05:00');
  trigger.events.click();
  assert.equal(panel.hidden, false);
  assert.equal(trigger.attrs['aria-expanded'], 'true');

  callbacks['air-os:music-state']({ detail: { available: true, title: 'Demo Track', artist: 'Lokale Datei', playing: true } });
  assert.equal(controls.get('.air-notch-track-title').textContent, 'Demo Track');
  assert.equal(musicButtons[1].textContent, '❚❚');
  notch.events.click({ target: { closest: () => musicButtons[2] } });
  assert.equal(dispatched.at(-1).detail.action, 'next');

  notch.events.click({ target: { closest: () => presets[1] } });
  assert.equal(controls.get('.air-notch-countdown').textContent, '10:00');
  notch.events.click({ target: { closest: () => timerToggle } });
  now += 601000;
  interval();
  assert.equal(controls.get('.air-notch-timer-status').textContent, 'Zeit abgelaufen');
  assert.equal(timerToggle.textContent, 'Fertig');
  assert.ok(classNames.has('is-timer-done'));
  notch.events.click({ target: { closest: () => timerToggle } });
  assert.equal(controls.get('.air-notch-countdown').textContent, '10:00');
  assert.equal(controls.get('.air-notch-timer-status').textContent, 'Bereit');

  window.airNotch.setEnabled(false);
  assert.equal(notch.hidden, true);
  assert.equal(panel.hidden, true);
});
