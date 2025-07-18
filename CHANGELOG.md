# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.0.6]
### Added
- Implement template preprocessor. Preprocessor are called after template parsing without a `TemplateContext`.
- `(pre)processor.disable(params)` is a new function for (pre)processor. It is called when a code block is disabled.
- `processor.dispose()` is a new function (pre)processor. Is is called when processor list is cleared.
- Add ```yaml {pochoir type=ribbon}``` code block to trigger a template from a ribbon action or the command palette.

````md

```yaml {pochoir type=command}
id: task # (required)
triggers: # (required) can be a string or a list
- ribbon
- command
title: Create task
icon: square-check-big
action: create # or "insert"
```
````

### Changed
- Deprecate ```form {pochoir}``` code block. Prefer ```yaml {pochoir type=form}```

## [0.0.5] - 2025-07-17
### Changed
- Update documentation
- Update LICENCE
- Remove unnecessary plugins from demo vault
- Use ventojs [v1.15.0](https://github.com/ventojs/vento/blob/main/CHANGELOG.md#1150---2025-07-16)
- Ignore some demo vault files

### Fixed
- form: field was not returned after creation [59b7fca8](https://github.com/FuriouZz/obsidian-pochoir/commit/59b7fca8)

## [0.0.4] - 2025-07-16
### Added
- Option to enable/disable Javascript code block [bd94bc7](https://github.com/FuriouZz/obsidian-pochoir/commit/bd94bc7)

### Changed
- Hide parsing error [4d0d9da](https://github.com/furiouzz/obsidian-pochoir/commit/4d0d9da)
- Javascript code block are disabled by default [bd94bc7](https://github.com/FuriouZz/obsidian-pochoir/commit/bd94bc7)
- Template are merged with aliases [bf25092](https://github.com/FuriouZz/obsidian-pochoir/commit/bf25092)

### Fixed
- Ignore properties when empty [e55a984](https://github.com/FuriouZz/obsidian-pochoir/commit/e55a984)

## [0.0.3] - 2025-07-16
### Fixed

- Fix build on CI

## [0.0.2] - 2025-07-16
### Changed

- Complete rewrite

## [0.0.1] - 2025-07-04

First version

[0.0.6]: https://github.com/FuriouZz/obsidian-pochoir/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/FuriouZz/obsidian-pochoir/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/FuriouZz/obsidian-pochoir/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/FuriouZz/obsidian-pochoir/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/FuriouZz/obsidian-pochoir/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/FuriouZz/obsidian-pochoir/releases/tag/v0.0.1
