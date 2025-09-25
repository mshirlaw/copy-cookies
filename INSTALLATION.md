# Installation Guide

## Quick Start

1. **Install the Extension**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select this folder (`copy-cookies`)

2. **Use the Extension**
   - Navigate to any website
   - Click the extension icon in your Chrome toolbar
   - The domain field will auto-populate with the current site's domain
   - Edit the domain if needed, or use the pre-populated one
   - Click "Copy Cookies to Localhost"
   - All cookies from that domain will be copied to localhost

## What It Does

This extension copies all cookies from any domain to `http://localhost`. This is useful for:
- Testing applications locally with production cookies
- Debugging authentication issues
- Development workflows that require specific cookie values

## Security Note

This extension has broad permissions to read and write cookies. Only install it if you trust the source code and understand the implications.

## Troubleshooting

- **No cookies found**: Make sure you've visited the domain recently and it has set cookies
- **Extension not appearing**: Make sure Developer mode is enabled in Chrome extensions
- **Copying fails**: Check the browser console for detailed error messages