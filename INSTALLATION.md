# Installation Guide

## Build the Extensions

The repository contains separate Chrome and Firefox apps backed by one shared extension package.

```bash
npm install
npm run build
```

This creates unpacked extensions in `dist/chrome` and `dist/firefox`.

The repository root and the directories under `apps/` are not directly installable extensions. The build step combines an app manifest with the shared files; always load the appropriate directory under `dist/`.

## Install in Chrome

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the generated `dist/chrome` directory.

If an older development copy was loaded from the repository root, remove it before loading `dist/chrome`. Otherwise Chrome may continue looking for files that have moved.

Run `npm run build:chrome` and reload the extension after making changes.

## Install in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select `dist/firefox/manifest.json`.

Temporary add-ons are removed when Firefox closes. For an automated development session, run:

```bash
npm run dev:firefox
```

## Package for Distribution

Validate and package both targets:

```bash
npm run lint
npm run package
```

Chrome and Firefox ZIP files are written to `artifacts/chrome` and `artifacts/firefox`, respectively. Firefox extensions must be signed through Mozilla Add-ons before permanent installation.

## Use the Extension

1. Navigate to any website.
2. Click the extension icon in the browser toolbar.
3. Open the **Copy Cookies** tab.
4. Confirm or edit the detected source domain.
5. Click **Copy Cookies to Localhost**.

## What It Does

This extension copies all cookies from any domain to `http://localhost`. This is useful for:

- Testing applications locally with production cookies
- Debugging authentication issues
- Development workflows that require specific cookie values

## Security Note

This extension has broad permissions to read and write cookies. Only install it if you trust the source code and understand the implications.

## Troubleshooting

- **No cookies found**: Make sure you've visited the domain recently and it has set cookies
- **Extension not appearing in Chrome**: Make sure Developer mode is enabled and `dist/chrome` is loaded
- **Extension not appearing in Firefox**: Reload `dist/firefox/manifest.json` from `about:debugging`
- **Changes not visible**: Rebuild the relevant target and reload the extension
- **Copying fails**: Check the browser console for detailed error messages
