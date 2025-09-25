# Chrome Web Store Publishing Guide

This guide walks you through the complete process of publishing your Copy Cookies extension to the Chrome Web Store, including setting up automated CI/CD deployment.

## 📋 Prerequisites

Before you begin, ensure you have:
- A Google account
- $5 USD for the Chrome Web Store developer registration fee (one-time payment)
- Admin access to this GitHub repository

## 🚀 Quick Start Checklist

- [ ] Register as Chrome Web Store developer
- [ ] Create Google Cloud project and enable APIs
- [ ] Set up OAuth2 credentials
- [ ] Configure GitHub repository secrets
- [ ] Create your first release
- [ ] Monitor the automated deployment

## 📝 Step-by-Step Setup

### Step 1: Register as Chrome Web Store Developer

1. **Go to the Chrome Web Store Developer Dashboard**
   - Visit: https://chrome.google.com/webstore/devconsole/
   - Sign in with your Google account

2. **Pay the registration fee**
   - One-time payment of $5 USD
   - This enables you to publish extensions

3. **Accept the developer agreement**
   - Read and accept the Chrome Web Store Developer Program Policies

### Step 2: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable the Chrome Web Store API**
   ```bash
   # Navigate to: APIs & Services > Library
   # Search for: "Chrome Web Store API"
   # Click "Enable"
   ```

3. **Configure OAuth Consent Screen**
   - Go to: APIs & Services > OAuth consent screen
   
   **If setting up for the first time:**
   - Select User Type: "External" and click "Create"
   - Fill in the wizard as described below
   
   **If already configured (editing existing):**
   - Click on the "Audience" tab (or look for "Test users" section)
   - Click "Add Users" button in the Test users section
   - Enter your Google account email address
   - Click "Save"
   - Skip to step 4
   
   **Initial Setup Wizard:**
   - **App information** page:
     - App name: "Chrome Extension Publisher"
     - User support email: Select your email from dropdown
     - App logo: (optional, can skip)
     - App domain: (optional, can skip)
     - Authorized domains: (optional, can skip)
     - Developer contact information: Enter your email
     - Click "Save and Continue"
   - **Scopes** page:
     - Click "Save and Continue" (no additional scopes needed)
   - **Test users** page:
     - Click "Add Users"
     - Enter your Google account email address
     - Click "Add"
     - Click "Save and Continue"
   - **Summary** page:
     - Review your settings
     - Click "Back to Dashboard"
   - Your app should now show "Publishing status: Testing"

4. **Create OAuth2 Credentials**
   - Go to: APIs & Services > Credentials
   - Click: "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Chrome Extension Publisher"
   - Authorized redirect URIs: `http://localhost`
   - Save the **Client ID** and **Client Secret**

### Step 3: Get OAuth2 Refresh Token

1. **Get Authorization Code**
   
   Replace `YOUR_CLIENT_ID` with your actual client ID and visit this URL:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost&access_type=offline
   ```
   
   Note: The `access_type=offline` parameter is required to receive a refresh token.

2. **Authorize the application**
   - Sign in and grant permissions
   - You'll be redirected to `http://localhost/?code=...`
   - Copy the authorization code from the URL (the value after `code=` and before any `&` character)
   - Note: The page may show an error since nothing is running on localhost - this is expected, just copy the code from the URL

3. **Exchange code for refresh token**
   ```bash
   curl "https://accounts.google.com/o/oauth2/token" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "code=YOUR_AUTHORIZATION_CODE" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=http://localhost"
   ```

4. **Save the refresh_token** from the response

### Step 4: Initial Extension Upload (Manual)

⚠️ **Important**: The first upload must be done manually through the Chrome Web Store Developer Dashboard.

1. **Create extension package**
   ```bash
   # In your project directory
   zip -r extension.zip . \
     -x "*.git*" \
     -x "*.md" \
     -x "*.yml" \
     -x "*.yaml" \
     -x ".github/*" \
     -x "node_modules/*" \
     -x "*.log" \
     -x ".DS_Store"
   ```

2. **Upload to Chrome Web Store**
   - Go to: https://chrome.google.com/webstore/devconsole/
   - Click "Add new item"
   - Upload your `extension.zip` file
   - Fill in the store listing details:
     - **Name**: Copy Cookies
     - **Summary**: Copy cookies from any domain to localhost for seamless development
     - **Description**: Use the description from README.md
     - **Category**: Developer Tools
     - **Language**: English
   - Upload screenshots (you can use `img/ui.png`)
   - Set privacy practices
   - Submit for review

3. **Get Extension ID**
   - After upload, note the Extension ID from the URL
   - Format: `https://chrome.google.com/webstore/devconsole/[EXTENSION_ID]`
   - Save this ID for the next step

### Step 5: Configure GitHub Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `EXTENSION_ID` | Your Chrome Web Store extension ID | `abcdefghijklmnopqrstuvwxyz123456` |
| `CLIENT_ID` | Google OAuth2 client ID | `123456789-abc.apps.googleusercontent.com` |
| `CLIENT_SECRET` | Google OAuth2 client secret | `GOCSPX-abcdefghijklmnopqrstuvwxyz` |
| `REFRESH_TOKEN` | OAuth2 refresh token | `1//abc123def456...` |

### Step 6: Create Your First Automated Release

1. **Ensure your code is ready**
   ```bash
   git add .
   git commit -m "Setup Chrome Web Store publishing"
   git push origin main
   ```

2. **Create a release**
   ```bash
   # Tag your release
   git tag v1.0.0
   git push origin v1.0.0
   
   # Or create through GitHub UI:
   # Go to: Releases > Create a new release
   # Tag: v1.0.0
   # Title: Initial Release
   # Description: First automated release to Chrome Web Store
   ```

3. **Monitor the deployment**
   - Go to: Actions tab in your GitHub repository
   - Watch the "Chrome Extension CI/CD" workflow
   - Check for any errors in the logs

## 🔄 Regular Release Process

After initial setup, releasing new versions is simple:

1. **Make your changes**
2. **Commit and push to main**
3. **Create a new release**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. **The CI/CD pipeline will automatically**:
   - Validate the extension
   - Update the version in manifest.json
   - Package the extension
   - Upload to Chrome Web Store
   - Publish the update

## 📊 Monitoring and Maintenance

### Check Release Status
- **GitHub Actions**: Monitor workflow runs in the Actions tab
- **Chrome Web Store**: Check review status in the developer dashboard
- **Extension Analytics**: View usage statistics in the developer dashboard

### Common Issues and Solutions

#### ❌ "Invalid refresh token"
- **Solution**: Regenerate the refresh token following Step 3
- **Update**: The `REFRESH_TOKEN` secret in GitHub

#### ❌ "Extension ID not found"
- **Solution**: Verify the `EXTENSION_ID` secret matches your extension
- **Check**: The extension ID in the Chrome Web Store developer dashboard

#### ❌ "Manifest validation failed"
- **Solution**: Check the GitHub Actions logs for specific validation errors
- **Fix**: Update manifest.json according to Chrome extension requirements

#### ❌ "Package upload failed"
- **Solution**: Ensure all required files are present and properly formatted
- **Check**: The build logs in GitHub Actions

### Version Management Best Practices

1. **Use Semantic Versioning**
   - `v1.0.0` - Major release
   - `v1.0.1` - Bug fixes
   - `v1.1.0` - New features

2. **Write Clear Release Notes**
   - Describe what changed
   - Mention any breaking changes
   - Include upgrade instructions if needed

3. **Test Before Release**
   - Load the extension locally first
   - Test all functionality
   - Verify on different websites

## 🔒 Security Best Practices

1. **Protect Your Secrets**
   - Never commit credentials to your repository
   - Use GitHub's encrypted secrets
   - Regularly rotate your OAuth tokens

2. **Limit Permissions**
   - Only grant necessary permissions in manifest.json
   - Use least-privilege principle for API access

3. **Monitor Access**
   - Regularly review who has access to your repository
   - Monitor the Chrome Web Store developer dashboard for unusual activity

## 📞 Support and Resources

- **Chrome Web Store Developer Documentation**: https://developer.chrome.com/docs/webstore/
- **Chrome Extension Development**: https://developer.chrome.com/docs/extensions/
- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Google Cloud Console**: https://console.cloud.google.com/

## 🎉 Congratulations!

Once set up, your extension will automatically deploy to the Chrome Web Store whenever you create a new release. The review process typically takes 1-7 days, after which your extension will be live for users to install.

---

**Need help?** Check the GitHub Actions logs for detailed error messages, or refer to the Chrome Web Store developer documentation for specific publishing requirements.