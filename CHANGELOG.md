# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [3.0.0] - 2018-11-20
### Changed
* upgrade to support Koop 3.X

## [2.0.0] - 2015-10-23

Stable Release!

### Changed
* bumped `koop-provider` to `^1.0.0`

### Added
* **model**: debug information for github api and koop cache
* **example**: updates based on koop-gist example server

## [2.0.0-alpha] - 2015-10-15

### Fixed
* **controller**: preview route dependencies work on non-root mountpaths
* **model**: local cache works (resolved issue from koop upstream)
* **model**: github access tokens now work as expected

### Changed
* **provider**: name is now `github` instead of `Github`
* **provider**: `status.version` moved to `version`
* **controller**: removed `ctrl.Error`, using `koop-provider`'s `ctrl.errorResponse` method
* **model**: simplify `find` and `drop` methods (use options object)

### Added
* **model**: looks for `KOOP_GITHUB_TOKEN` environmental variable if `config.ghtoken` isn't specified
* **controller/routes**: added `rate_limit` route for checking github rate limit status
* **controller**: support for JSONP callbacks ([`res.jsonp`](http://expressjs.com/api.html#res.jsonp))

### Removed
* **controller/routes**: thumbnail (Thumbnail generation no longer supported)

## [1.0.1] - 2015-08-13

### Changed
* Bump Esri Leaflet version used by preview to 1.0.0
* Switch from `mocha` to `tape` for tests

### Added
* Added `status.version` to provider exports

## [1.0.0] - 2015-07-28

### Added
* Now checking build status with Travis-CI
* Using [JavaScript Standard Style](https://github.com/feross/standard)

### Changed
* Improved documentation
* Moved from Esri to KoopJS github organization

### Removed
* Deleted unused fixtures and configuration files
* Removed broken TopoJSON support

### Fixed
* Reverted to leaflet CDN to fix broken `leaflet.css` link

## v0.1.12 - 2015-03-16

[3.0.0]: https://github.com/koopjs/koop-github/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/koopjs/koop-github/compare/v2.0.0-alpha...v2.0.0
[2.0.0-alpha]: https://github.com/koopjs/koop-github/compare/v1.0.1...v2.0.0-alpha
[1.0.1]: https://github.com/koopjs/koop-github/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/koopjs/koop-github/compare/v0.1.12...v1.0.0
