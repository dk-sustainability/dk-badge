# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/).

## [0.2.1] - 2026-09-30

### Changed

- Translated the README into English for the npm package page.

## [0.2.0] - 2026-09-30

### Added

- Built-in French and English localization through the `locale` constructor option.
- Automatic browser language detection when the `locale` option is omitted.
- Localized labels, units, and device types displayed by the badge.
- Automatic fallback to English when no supported locale matches.
- Automated tests using the native Node.js test runner.
- Parity tests with the `dkalculate-core` `website` engine for mobile, desktop, and tablet devices.

### Changed

- Updated carbon factors from the `dkalculate-core` meta-referential at commit `e2323a5`.
- Aligned Wi-Fi and 4G consumption units and formulas with `dkalculate-core`.
- Updated device lifecycle impacts, usage durations, and power consumption factors.
- Changed the default server distribution to 47.5% France and 52.5% rest of the world.
- Updated development dependencies.
- Limited the npm package contents to distribution files and their documentation.
- Updated documentation and integration examples.

### Fixed

- Initialization with `renderUI: false` now works without a DOM container.
- Initialization becomes a no-op when UI rendering is requested without a container.
- Removing the badge now cancels delayed initialization and prevents calculations from restarting after page visibility changes.
- Repeated calls to `init()` no longer create duplicate timers or event listeners.
- Updated the npm publishing workflow to install dependencies with Yarn and its immutable lockfile.
- Fixed the demo page markup.

## [0.1.5-beta] - 2024-04-18

### Added

- Added the `removable` option, allowing users to hide the badge permanently.

## [0.1.4-beta] - 2024-03-08

### Added

- Added a configurable root font size through the `--dkb-root-font-size` CSS variable.

### Changed

- Updated distribution files.

## [0.1.3-beta] - 2024-03-08

### Changed

- Improved style isolation to make the badge easier to integrate into existing websites.
- Updated the documentation and DK attribution link.

## [0.1.2-beta] - 2024-03-05

### Changed

- Updated the documentation.

## [0.1.1-beta] - 2024-03-01

### Added

- Added npm and CDN installation documentation.
- Added visible focus styles to improve accessibility.

### Fixed

- Fixed tablet detection.

## [0.1.0-beta] - 2024-02-16

- Initial beta release of the badge.

[Unreleased]: https://github.com/dk-sustainability/dk-badge/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/dk-sustainability/dk-badge/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/dk-sustainability/dk-badge/compare/V.0.1.5-beta...v0.2.0
[0.1.5-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.5-beta
[0.1.4-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.4-beta
[0.1.3-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.3-beta
[0.1.2-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.2-beta
[0.1.1-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.1-beta
[0.1.0-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.0-beta
