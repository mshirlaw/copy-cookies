# Contributing to Copy Cookies Extension

Thank you for your interest in contributing to the Copy Cookies Chrome extension! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Google Chrome browser
- Basic knowledge of JavaScript, HTML, and CSS
- Git for version control
- Node.js (for development scripts)

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/yourusername/copy-cookies.git
   cd copy-cookies
   ```

2. **Install development dependencies**

   ```bash
   npm install
   ```

3. **Load the extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the project directory
   - The extension will appear in your extensions list

## 🛠️ Development Workflow

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Edit the relevant files (JavaScript, HTML, CSS)
   - Follow the existing code style and conventions

3. **Test your changes**

   ```bash
   # Validate the extension
   npm run validate

   # Test manually in Chrome
   # - Reload the extension in chrome://extensions/
   # - Test on various websites
   # - Verify all functionality works
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Code Style Guidelines

- **JavaScript**: Use modern ES6+ syntax
- **Indentation**: 2 spaces
- **Naming**: Use camelCase for variables and functions
- **Comments**: Add comments for complex logic
- **Error Handling**: Always handle potential errors gracefully

### Testing Checklist

Before submitting your changes, ensure:

- [ ] Extension loads without errors in Chrome
- [ ] All existing functionality still works
- [ ] New features work as expected
- [ ] Tested on multiple websites (HTTP and HTTPS)
- [ ] No console errors or warnings
- [ ] Manifest.json is valid JSON
- [ ] All required files are present

## 📝 Submitting Changes

### Pull Request Process

1. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Go to the GitHub repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template

3. **PR Requirements**
   - Clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure CI checks pass

### Pull Request Template

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tested manually in Chrome
- [ ] Validated manifest.json
- [ ] No console errors
- [ ] Works on HTTP and HTTPS sites

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Additional Notes

Any additional information or context.
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Chrome version**: Help > About Google Chrome
- **Extension version**: Check in chrome://extensions/
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Console errors**: Check browser console (F12)

### Feature Requests

For feature requests, please include:

- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Any alternative solutions considered?
- **Additional context**: Any other relevant information

## 📋 Development Guidelines

### File Structure

```
copy-cookies/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── css/
│   └── popup.css         # Popup styling
├── js/
│   └── popup.js          # Main functionality
├── img/                  # Icons and images
├── .github/
│   └── workflows/        # CI/CD configuration
└── scripts/              # Development scripts
```

### Key Files to Know

- **`manifest.json`**: Extension configuration and permissions
- **`popup.html`**: The UI that appears when clicking the extension icon
- **`js/popup.js`**: Main logic for copying cookies
- **`css/popup.css`**: Styling for the popup interface

### Chrome Extension APIs Used

- **`chrome.cookies`**: Reading and writing cookies
- **`chrome.tabs`**: Getting current tab information
- **`chrome.runtime`**: Extension lifecycle management

### Common Development Tasks

#### Adding New Features

1. Update `manifest.json` if new permissions are needed
2. Modify `popup.html` for UI changes
3. Update `popup.js` for functionality
4. Add styling in `popup.css` if needed
5. Test thoroughly across different scenarios

#### Debugging

1. **Console Logs**: Use `console.log()` in popup.js
2. **Extension Console**: Right-click extension icon > Inspect popup
3. **Background Console**: chrome://extensions/ > Details > Inspect views
4. **Network Tab**: Monitor API calls and requests

#### Performance Considerations

- Minimize API calls
- Handle errors gracefully
- Provide user feedback for long operations
- Keep the popup responsive

## 🔒 Security Guidelines

### Best Practices

- **Minimal Permissions**: Only request necessary permissions
- **Input Validation**: Validate all user inputs
- **Error Handling**: Don't expose sensitive information in errors
- **Secure Defaults**: Use secure settings by default

### Permissions

Current permissions in `manifest.json`:

- `cookies`: Required for reading/writing cookies
- `activeTab`: Access to current tab
- `tabs`: Query tab information
- `host_permissions`: Access to all HTTP/HTTPS sites

Only add new permissions if absolutely necessary.

## 📚 Resources

### Chrome Extension Documentation

- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/migrating/)

### Development Tools

- [Chrome Extension Source Viewer](https://chrome.google.com/webstore/detail/chrome-extension-source-v/jifpbeccnghkjeaalbbjmodiffmgedin)
- [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)

### Testing Resources

- [Chrome Extension Testing Guide](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/)
- [Web Platform Tests](https://web-platform-tests.org/)

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for contributing to Copy Cookies! Your help makes this extension better for developers worldwide. 🚀
