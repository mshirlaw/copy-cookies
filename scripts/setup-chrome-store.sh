#!/bin/bash

# Chrome Web Store Publishing Setup Script
# This script helps you set up the necessary credentials for automated publishing

set -e

echo "🚀 Chrome Web Store Publishing Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_step "Checking dependencies..."

    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. Install it for better JSON handling:"
        echo "  macOS: brew install jq"
        echo "  Ubuntu: sudo apt-get install jq"
        echo ""
    fi

    print_success "Dependencies check complete"
}

# Get OAuth2 refresh token
get_refresh_token() {
    print_step "Setting up OAuth2 credentials..."

    echo "Please provide your Google Cloud OAuth2 credentials:"
    read -p "Client ID: " CLIENT_ID
    read -s -p "Client Secret: " CLIENT_SECRET
    echo ""

    if [[ -z "$CLIENT_ID" || -z "$CLIENT_SECRET" ]]; then
        print_error "Client ID and Client Secret are required"
        exit 1
    fi

    # Generate authorization URL
    AUTH_URL="https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=${CLIENT_ID}&redirect_uri=urn:ietf:wg:oauth:2.0:oob"

    echo ""
    print_step "Getting authorization code..."
    echo "1. Open this URL in your browser:"
    echo -e "${BLUE}${AUTH_URL}${NC}"
    echo ""
    echo "2. Sign in and authorize the application"
    echo "3. Copy the authorization code from the page"
    echo ""

    read -p "Enter the authorization code: " AUTH_CODE

    if [[ -z "$AUTH_CODE" ]]; then
        print_error "Authorization code is required"
        exit 1
    fi

    # Exchange code for refresh token
    print_step "Exchanging authorization code for refresh token..."

    RESPONSE=$(curl -s "https://accounts.google.com/o/oauth2/token" \
        -d "client_id=${CLIENT_ID}" \
        -d "client_secret=${CLIENT_SECRET}" \
        -d "code=${AUTH_CODE}" \
        -d "grant_type=authorization_code" \
        -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob")

    if command -v jq &> /dev/null; then
        REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token')
        if [[ "$REFRESH_TOKEN" == "null" || -z "$REFRESH_TOKEN" ]]; then
            print_error "Failed to get refresh token. Response:"
            echo "$RESPONSE"
            exit 1
        fi
    else
        echo "Response from Google:"
        echo "$RESPONSE"
        echo ""
        read -p "Enter the refresh_token from the response above: " REFRESH_TOKEN
    fi

    print_success "Successfully obtained refresh token"

    # Save credentials to file
    cat > .chrome-store-credentials << EOF
# Chrome Web Store Publishing Credentials
# Add these as secrets in your GitHub repository:
# Settings > Secrets and variables > Actions

CLIENT_ID=${CLIENT_ID}
CLIENT_SECRET=${CLIENT_SECRET}
REFRESH_TOKEN=${REFRESH_TOKEN}
EOF

    print_success "Credentials saved to .chrome-store-credentials"
    print_warning "Remember to add .chrome-store-credentials to .gitignore!"
}

# Display next steps
show_next_steps() {
    echo ""
    print_step "Next Steps:"
    echo ""
    echo "1. 📝 Add GitHub Secrets:"
    echo "   Go to: Settings > Secrets and variables > Actions"
    echo "   Add these secrets:"
    echo "   - CLIENT_ID"
    echo "   - CLIENT_SECRET"
    echo "   - REFRESH_TOKEN"
    echo "   - EXTENSION_ID (get this after first manual upload)"
    echo ""
    echo "2. 📦 First Upload (Manual):"
    echo "   - Create extension package: npm run package"
    echo "   - Upload to Chrome Web Store Developer Dashboard"
    echo "   - Get Extension ID from the URL"
    echo "   - Add EXTENSION_ID as GitHub secret"
    echo ""
    echo "3. 🚀 Automated Releases:"
    echo "   - git tag v1.0.0"
    echo "   - git push origin v1.0.0"
    echo "   - GitHub Actions will handle the rest!"
    echo ""
    echo "📖 For detailed instructions, see: CHROME_STORE_PUBLISHING.md"
}

# Main execution
main() {
    check_dependencies
    get_refresh_token
    show_next_steps

    echo ""
    print_success "Setup complete! 🎉"
}

# Run main function
main
