# Copy Cookies Chrome Extension

A simple Chrome extension that allows you to copy cookies from any domain to localhost.

## Features

- Simple and clean user interface
- **Auto-populates domain from current website**
- Copy all cookies from a specified domain to localhost
- Real-time status updates
- Input validation for domain names
- Handles various cookie attributes (httpOnly, sameSite, etc.)

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this project folder
4. The extension will appear in your extensions list

## Usage

1. Click on the extension icon in your Chrome toolbar
2. The domain field will be automatically populated with the current website's domain
3. You can edit the domain if needed, or use the pre-populated one
4. Click "Copy Cookies to Localhost"
5. The extension will copy all cookies from the specified domain to localhost

## Notes

- The extension requires the "cookies" permission to read and write cookies
- Cookies are copied to `http://localhost` (not HTTPS)
- Secure cookies from HTTPS sites will be converted to non-secure for localhost
- The extension handles various cookie attributes like httpOnly and sameSite

## Files Structure

- `manifest.json` - Extension configuration and permissions
- `popup.html` - User interface
- `popup.css` - Styling for the popup
- `popup.js` - Main functionality for copying cookies
- `img/` - Extension icons and images

## Icons

The extension includes placeholder icon files in the `img/` folder (`img/icon16.png`, `img/icon48.png`, `img/icon128.png`). You can replace these with custom icons if desired.

**Note:** The extension will work with the included placeholder icons.

## Permissions

The extension requires:
- `cookies` - To read cookies from source domains and write to localhost
- `activeTab` - To work with the current tab
- `tabs` - To query the current tab's URL for auto-populating the domain
- `host_permissions` for `http://*/*` and `https://*/*` - To access cookies from any domain

## Troubleshooting

- Make sure the domain is entered correctly (without http:// or https://)
- Some cookies might not be copyable due to browser security restrictions
- Check the browser console for detailed error messages if copying fails