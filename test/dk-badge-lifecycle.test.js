const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const source = readFileSync('src/js/dk-badge.js', 'utf8');

function createEnvironment(node = null) {
	const listeners = new Map();
	const intervals = [];
	const timeouts = [];
	const storage = () => {
		const values = new Map();
		return {
			getItem: (key) => values.get(key) ?? null,
			setItem: (key, value) => values.set(key, value),
			removeItem: (key) => values.delete(key)
		};
	};

	const document = {
		hidden: false,
		location: 'https://example.test/page',
		querySelector: () => node,
		getElementById: () => null,
		addEventListener(type, callback) {
			const callbacks = listeners.get(type) || [];
			callbacks.push(callback);
			listeners.set(type, callbacks);
		},
		dispatchEvent(event) {
			for (const callback of listeners.get(event.type) || []) callback(event);
		}
	};

	class CustomEvent {
		constructor(type, options) {
			this.type = type;
			this.detail = options.detail;
		}
	}

	class PerformanceObserver {
		constructor(callback) {
			this.callback = callback;
			this.disconnectCalls = 0;
		}

		observe() {}

		disconnect() {
			this.disconnectCalls += 1;
		}
	}

	const context = {
		CustomEvent,
		PerformanceObserver,
		clearInterval() {},
		clearTimeout(id) {
			timeouts[id - 1].cleared = true;
		},
		document,
		localStorage: storage(),
		navigator: {userAgent: 'test'},
		performance: {getEntries: () => [], now: () => 10_000},
		sessionStorage: storage(),
		setInterval(callback) {
			intervals.push(callback);
			return intervals.length;
		},
		setTimeout(callback) {
			timeouts.push({callback, cleared: false});
			return timeouts.length;
		},
		window: {scrollBy() {}}
	};

	vm.runInNewContext(`${source}\nglobalThis.DKBadge = DKBadge;`, context);

	return {
		DKBadge: context.DKBadge,
		document,
		intervals,
		listeners,
		timeouts
	};
}

test('initializes in calculation-only mode without a DOM container', () => {
	const {DKBadge, intervals} = createEnvironment();
	const badge = new DKBadge({renderUI: false});

	assert.doesNotThrow(() => badge.init());
	assert.equal(intervals.length, 1);
});

test('does nothing when UI rendering is requested without a DOM container', () => {
	const {DKBadge, intervals, listeners} = createEnvironment();
	const badge = new DKBadge();

	assert.doesNotThrow(() => badge.init());
	assert.equal(intervals.length, 0);
	assert.equal(listeners.size, 0);
});

test('removal prevents calculation from restarting after visibility changes', () => {
	const node = {innerHTML: '', querySelector: () => null};
	const {DKBadge, document, intervals, listeners, timeouts} = createEnvironment(node);
	const badge = new DKBadge({renderUI: false});

	badge.init();
	const observer = badge.performanceObserver;
	badge.removeBadge();

	assert.equal(observer.disconnectCalls, 1);
	assert.equal(timeouts[0].cleared, true);
	document.hidden = true;
	listeners.get('visibilitychange')[0]({type: 'visibilitychange'});
	document.hidden = false;
	listeners.get('visibilitychange')[0]({type: 'visibilitychange'});
	assert.equal(intervals.length, 1);
});

test('initialization is idempotent while the badge is active', () => {
	const node = {innerHTML: '', querySelector: () => null};
	const {DKBadge, intervals, listeners, timeouts} = createEnvironment(node);
	const badge = new DKBadge({renderUI: false});

	badge.init();
	badge.init();

	assert.equal(intervals.length, 1);
	assert.equal(timeouts.length, 1);
	assert.equal(listeners.get('visibilitychange').length, 1);
});

test('uses English labels by default and falls back to English', () => {
	for (const options of [{}, {locale: 'de'}]) {
		const {DKBadge} = createEnvironment();
		const badge = new DKBadge(options);

		assert.equal(badge.locale, 'en');
		assert.equal(badge.labels.details, 'Details');
		assert.equal(badge.labels.weightUnit, 'kB');
		assert.equal(badge.labels.desktop, 'Desktop');
	}
});

test('uses French labels when requested', () => {
	const {DKBadge} = createEnvironment();
	const badge = new DKBadge({locale: 'fr'});

	assert.equal(badge.locale, 'fr');
	assert.equal(badge.labels.intro, 'Votre navigation sur ce site a émis environ');
	assert.equal(badge.labels.details, 'Détails');
	assert.equal(badge.labels.desktop, 'Ordinateur');
});

test('custom labels override the selected locale', () => {
	const {DKBadge} = createEnvironment();
	const badge = new DKBadge({locale: 'fr', labels: {details: 'En savoir plus'}});

	assert.equal(badge.labels.details, 'En savoir plus');
	assert.equal(badge.labels.weight, 'Poids');
});

test('localizes the displayed device type', () => {
	const elements = new Map();
	const node = {
		querySelector(selector) {
			if (!elements.has(selector)) elements.set(selector, {innerHTML: ''});
			return elements.get(selector);
		}
	};
	const {DKBadge} = createEnvironment(node);
	const badge = new DKBadge({locale: 'fr'});
	badge.deviceType = 'Desktop';

	badge.update();

	assert.equal(elements.get('[data-dk-badge-device]').innerHTML, 'Ordinateur');
});

test('matches dkalculate-core website results for each device type', () => {
	// dkalculate-core website engine with meta-referential commit e2323a5.
	const expectedResults = {
		Mobile: 0.118206842853051,
		Desktop: 0.16754370532208693,
		Tablet: 0.31053123188965137
	};

	for (const [deviceType, expected] of Object.entries(expectedResults)) {
		const {DKBadge} = createEnvironment();
		const badge = new DKBadge({renderUI: false});

		assert.ok(Math.abs(badge.calculate(1_332_432, 10, deviceType) - expected) < 1e-12);
	}
});
