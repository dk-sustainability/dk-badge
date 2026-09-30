# DK Badge

[![npm version](https://img.shields.io/npm/v/%40d-k%2Fdk-badge)](https://www.npmjs.com/package/@d-k/dk-badge)
[![GitHub release](https://img.shields.io/github/v/release/dk-sustainability/dk-badge?include_prereleases)](https://github.com/dk-sustainability/dk-badge/releases)
![Beta](https://img.shields.io/badge/status-beta-orange)

A lightweight, client-side badge that estimates the carbon footprint of a user's browsing session without sending data to an external service.

[Installation](#installation) · [Options](#options) · [Methods](#methods) · [Events](#events) · [Changelog](#changelog) · [License](#license)

## How it works

### Calculation

- The badge estimates CO2e emissions from server, network, and device usage and life cycles during the user's session. **Data and formulas &copy; DK**.
- Wi-Fi and 4G usage is estimated with a 90/10 split because browsers do not currently provide a reliable way to identify the active connection type.
- Server location is estimated at 47.5% in France and 52.5% in the rest of the world. This distribution can be configured when most resources are served from a known region.
- Audience location is estimated at 45% in France and 55% in the rest of the world. This distribution can be configured when audience statistics are available.
- The detected device type (mobile, tablet, or desktop) is included in the calculation.
- Session duration and the total size of loaded resources are included in the calculation.
- Factors and units are synchronized with the latest DK calculation engine.

### User experience and technical behavior

- The first calculation runs 500 ms after the initial page load is detected.
- It then runs every five seconds after the previous calculation and whenever the `PerformanceObserver` detects newly loaded resources, such as lazy-loaded images.
- Calculation pauses while the tab is hidden to limit unnecessary processing and better represent active browsing time.
- Session duration and loaded resource size are saved to `sessionStorage` every second.
- Some resources may not be detected because of technical restrictions such as CORS or a missing `Timing-Allow-Origin` header. Accuracy can therefore vary depending on server configuration and resource origins.
- No data is sent anywhere: all calculations run locally in the user's browser.

### Design

- The badge provides three styles: `full`, `compact`, and `footer`.
- It uses a system font by default to avoid loading an entire font file for a small component. CSS variables can be used to match the host website's visual identity.
- The default colors follow the DK visual identity and can also be customized with CSS variables.

## Installation

### Manual installation

#### Download from GitHub

```bash
git clone https://github.com/dk-sustainability/dk-badge.git
```

OR

[Download the repository archive](https://github.com/dk-sustainability/dk-badge/archive/refs/heads/main.zip).

#### Setup

Copy `/dist/js/dk-badge.min.js` or `/dist/js/dk-badge.js`.

Copy the CSS file for the required style (`full`, `compact`, or `footer`) from `/dist/css/dk-badge-[STYLE].css`. The combined `/dist/css/dk-badge-all.css` file is also available but is not recommended when only one style is used.

Add the files to your HTML:

```html
<!-- Load these files separately or include them in your bundles. -->
<script src="[PATH-TO-THE-JS-FILE]" defer></script>
<link rel="stylesheet" href="[PATH-TO-THE-CSS-FILE]">

<!-- Initialize the component after DOMContentLoaded. -->
<script defer>
  document.addEventListener('DOMContentLoaded', () => {
    const dkBadge = new DKBadge();
    dkBadge.init();
  });
</script>

<!-- For the footer style, place this element at the end of the footer or just before </body>. -->
<!-- Other styles are not fixed on small screens and can be placed in the mobile content flow. -->
<div data-dk-badge></div>
```

See [Options](#options) for the available configuration.

### npm

This package is not currently designed to be imported directly into a JavaScript bundle. Install it with npm, then follow the [manual installation](#manual-installation) steps using the distribution files from the package.

```bash
npm i @d-k/dk-badge
```

The CSS and JavaScript files are available in `node_modules/@d-k/dk-badge/dist/`.

### CDN

All distribution files are available through [unpkg](https://unpkg.com/):

```html
<script src="https://unpkg.com/@d-k/dk-badge@latest/dist/js/dk-badge.min.js" defer></script>
<!-- Select full, compact, or footer. dk-badge-all.css contains every style. -->
<link rel="stylesheet" href="https://unpkg.com/@d-k/dk-badge@latest/dist/css/dk-badge-all.css">

<!-- Initialize the component after DOMContentLoaded. -->
<script defer>
  document.addEventListener('DOMContentLoaded', () => {
    const dkBadge = new DKBadge();
    dkBadge.init();
  });
</script>

<!-- For the footer style, place this element at the end of the footer or just before </body>. -->
<!-- Other styles are not fixed on small screens and can be placed in the mobile content flow. -->
<div data-dk-badge></div>
```

See [Options](#options) for the available configuration.

## Options

Options are passed to the constructor. The following example includes every available option:

```js
const dkBadge = new DKBadge({
  // Interface language ("en" or "fr").
  // When omitted, the browser language is used, with a fallback to English.
  locale: "en",
  // Override individual labels from the selected translation.
  labels: {
    "intro": "This website has a carbon footprint of",
    "details": "Details",
    "weight": "Weight",
    "time": "Time",
    "device": "Device",
    "unknown": "unknown",
    "CO2unit": "g CO2e",
    "weightUnit": "kB",
    "timeUnit": "sec.",
    "privacy": "no data is collected",
    "emitted": "emitted",
    "close": "Remove the badge"
  },
  // Average PUE of your servers when known and when most resources
  // are served from the same infrastructure.
  pue: 1.69,
  // Audience location distribution. All values are required.
  audienceLocationProportion: {
    "france": 0.5,
    "europe": 0.5,
    "international": 0
  },
  // Server location distribution. All values are required.
  serverLocationProportion: {
    "france": 0.5,
    "international": 0.5
  },
  // Badge style ("compact", "full", or "footer").
  style: "full",
  // Set to false to calculate results without rendering the interface.
  // Attribution with a link to this project remains required.
  renderUI: true,
  // Display a close button. Closing the badge removes it and stops calculation.
  // The choice is stored in localStorage. To show the badge again, remove the
  // "dk-badge" localStorage entry and reload the page. See demo/index.html.
  removable: true
});
```

### CSS customization

Example for a dark interface:

```html
<div data-dk-badge style="
  --dkb-font-family: inherit;
  --dkb-root-font-size: 1rem;
  --dkb-color-primary: #00BC62;
  --dkb-color-text: #CDCCD9;
  --dkb-color-text-light: #7973a8;
  --dkb-color-text-strong: #fff;
  --dkb-color-contrast: #060035;
  --dkb-color-secondary: #0064fa;
"></div>
```

Set `--dkb-root-font-size` to `1.6rem` when the root HTML font size is `10px`.

## Methods

Two methods are available:

- `.init()` &ndash; starts the badge after the DOM and script have loaded.
- `.calculate(3000, 20, "Mobile")` &ndash; runs an independent calculation. Parameters:
  - `{number} size` &ndash; page weight.
  - `{number} time` &ndash; time spent on the page.
  - `{('Desktop'|'Tablet'|'Mobile')} deviceType` &ndash; device type.

## Events

The badge dispatches three events on `document`:

- `dkBadge:calculated` after a calculation completes.
- `dkBadge:updated` after the interface is updated.
- `dkBadge:removed` after the badge is removed.

### Example

```js
document.addEventListener('dkBadge:calculated', (event) => {
  // Log all badge data.
  console.log('dkBadge:calculated', event.detail);

  // Log only the total CO2e result.
  console.log('dkBadge:calculated', event.detail.ges);
});
```

## Changelog

See the [changelog](https://github.com/dk-sustainability/dk-badge/blob/main/changelog.md) for release details.

## Roadmap

- [ ] Use a combination of `pagehide` and visibility events to save values to `sessionStorage` more efficiently.
- [ ] Display a small loader instead of the `unknown` label.
- [x] Publish an npm package.
- [ ] Evaluate whether a web component would be appropriate for the available options.
- [ ] Create a landing page.
- [ ] Create a Cloudflare app.
- [ ] Create a WordPress plugin.
- [ ] Create a browser extension.
- [ ] Measure and document the performance impact of adding the badge.
- [ ] Allow the badge to be moved without significantly increasing its footprint.

## License

Data and formulas: All rights reserved &copy; DK

Code: [Mozilla Public License (MPL) 2.0](https://choosealicense.com/licenses/mpl-2.0/)
