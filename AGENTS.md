# Agent Guidelines

## Repository Overview

`copy-cookies` is a cross-browser extension for Chrome and Firefox (Manifest V3) that copies session and domain cookies to `localhost` for local web development.

The repository is structured as an npm monorepo using workspaces:
- `apps/chrome/`: Chrome-specific manifest (`manifest.json`) and package configuration.
- `apps/firefox/`: Firefox-specific manifest (`manifest.json`) and package configuration.
- `packages/extension-core/`: Shared popup UI (`popup.html`), styles (`css/popup.css`), icons (`img/`), and logic (`js/popup.js`).
- `scripts/`: Node.js build (`build.mjs`) and validation (`validate.mjs`) scripts.

---

## Coding Style & Standards

### Small, Single-Purpose Functions
- Write small, modular functions focused strictly on a single responsibility.
- Break complex workflows into composable helper functions (e.g., separate domain validation, expiration calculation, cookie querying, DOM updates).
- Avoid monolithic event handlers or deeply nested logic.

### JSDoc & Documentation
- Document every function with JSDoc comments detailing `@param` and `@returns`.
- Keep descriptions concise and technical.

### Vanilla Web Architecture
- Use vanilla JavaScript, HTML, and CSS. Avoid adding frontend frameworks or external runtime dependencies.
- Use native modern DOM APIs (`document.getElementById`, `addEventListener`, `document.createElement`, `append`).

### Cross-Browser Compatibility
- Shared code in `packages/extension-core/js/` must remain compatible with both Chrome and Firefox.
- Access extension APIs via the unified alias:
  ```javascript
  const extensionApi = globalThis.browser ?? globalThis.chrome;
  ```
- Reject or skip internal browser URLs (e.g., `chrome://`, `about:`, `moz-extension://`, `chrome-extension://`).
- Keep shared metadata (`name`, `version`, `description`) identical across `apps/chrome/manifest.json` and `apps/firefox/manifest.json`.

---

## Git & Commit Conventions

### Conventional Commit Titles
All commit messages and pull request titles must follow the Conventional Commits specification:
```
<type>(<optional scope>): <description>
```
Common types:
- `feat`: New features or capabilities (e.g., `feat(monorepo): add Chrome and Firefox monorepo builds`)
- `fix`: Bug fixes (e.g., `fix(popup): handle missing expiration timestamp`)
- `refactor`: Code reorganization without functional changes (e.g., `refactor(popup): extract domain normalization helper`)
- `style`: Formatting, whitespace, or CSS styling changes (e.g., `style(spacing): align popup layout padding`)
- `docs`: Documentation updates (e.g., `docs: update installation instructions for firefox`)
- `chore`: Maintenance tasks, dependencies, or build scripts

### No Commit Attribution
- **NEVER** add `Co-authored-by` trailers to git commit messages.
- **NEVER** add AI attribution or tool branding (e.g., `Generated with ...`, `Co-Authored-By: Claude`, etc.) to:
  - Git commit messages
  - PR titles or descriptions
  - PR comments or code review comments
  - Code comments
- Keep all git history, commit messages, and PR metadata clean, professional, and attribution-free.

---

## Build & Validation Commands

Run validation checks before submitting changes:

```bash
# Build extensions to dist/chrome and dist/firefox
npm run build

# Validate manifests and shared assets
npm run validate

# Run validation, build, and Firefox web-ext linting
npm run lint

# Package extension zip archives into artifacts/
npm run package

# Run Firefox development instance with extension loaded
npm run dev:firefox
```
