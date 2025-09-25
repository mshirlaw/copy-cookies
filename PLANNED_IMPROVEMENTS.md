# Planned Improvements: Cookie Expiration Management

## 🎯 Overview
Enhance the Chrome extension with advanced cookie expiration management features to provide better control over cookie lifetimes when copying from source domains to localhost.

## 🚀 Feature Categories

### 1. Expiration Date Control Options
- **Keep Original Expiration** (Default)
  - Copy cookies with their original expiration dates
  - Maintains exact timing from source domain
  
- **Extend Expiration**
  - Add X hours/days to original expiration
  - Useful for extending short-lived cookies for development
  
- **Remove Expiration** 
  - Convert all cookies to session-only (expire when browser closes)
  - Good for temporary testing scenarios
  
- **Set Custom Expiration**
  - Set a specific expiration date/time for all copied cookies
  - Allows precise control over cookie lifetime

### 2. Development-Friendly Presets
- **Development Mode** (24 hours)
  - Automatically set all cookies to expire in 24 hours
  - Perfect for daily development work
  
- **Testing Mode** (1 hour)
  - Set all cookies to expire in 1 hour
  - Good for quick testing sessions
  
- **Long Development** (7 days)
  - Set cookies to expire in 7 days
  - Useful for longer development cycles

### 3. Smart Expiration Handling
- **Relative Expiration**
  - If original cookie expires in 7 days, make localhost version also expire in 7 days from now
  - Maintains relative timing while updating base time
  
- **Minimum Expiration Guard**
  - Ensure copied cookies last at least X hours
  - Prevents accidentally copying very short-lived cookies
  
- **Maximum Expiration Cap**
  - Cap expiration dates to prevent very long-lived cookies
  - Security feature to prevent indefinite cookies

### 4. Cookie Filtering by Expiration
- **Skip Expired Cookies**
  - Don't copy cookies that are already expired
  - Automatic cleanup of stale cookies
  
- **Only Long-lived Cookies**
  - Only copy cookies that expire more than X days in the future
  - Focus on persistent, important cookies
  
- **Session vs Persistent Filter**
  - Choose to copy only session cookies OR only persistent cookies
  - Granular control over cookie types

## 🎨 UI/UX Enhancements

### Expiration Options Panel
```
┌─────────────────────────────────────┐
│ Cookie Expiration Options           │
├─────────────────────────────────────┤
│ ○ Keep Original Expiration          │
│ ○ Development Mode (24 hours)       │
│ ○ Testing Mode (1 hour)             │
│ ○ Custom: [___] hours/days          │
│ ○ Session Only (browser close)      │
└─────────────────────────────────────┘
```

### Advanced Options (Collapsible)
```
┌─────────────────────────────────────┐
│ ▼ Advanced Expiration Settings      │
├─────────────────────────────────────┤
│ □ Skip expired cookies              │
│ □ Minimum lifetime: [2] hours       │
│ □ Maximum lifetime: [30] days       │
│ □ Only persistent cookies           │
│ □ Only session cookies              │
└─────────────────────────────────────┘
```

## 🔧 Technical Implementation Plan

### Phase 1: Core Expiration Options
1. Add expiration mode selection to UI
2. Implement basic expiration modification logic
3. Add preset modes (Development, Testing, Custom)
4. Update cookie copying logic to handle new expiration settings

### Phase 2: Advanced Filtering
1. Add cookie filtering options
2. Implement expiration-based filtering logic
3. Add minimum/maximum lifetime guards
4. Session vs persistent cookie filtering

### Phase 3: Smart Features
1. Implement relative expiration calculation
2. Add automatic expired cookie detection
3. Smart defaults based on source domain patterns
4. Bulk expiration operations

### Phase 4: UI Polish
1. Collapsible advanced options panel
2. Tooltips and help text
3. Preset management (save custom presets)
4. Visual indicators for expiration status

## 📋 File Changes Required

### UI Files
- `popup.html` - Add expiration options panel
- `popup.css` - Style new UI elements
- `popup.js` - Handle expiration logic and UI interactions

### Configuration
- `manifest.json` - May need additional permissions
- Add settings storage for user preferences

### Documentation
- Update `README.md` with new features
- Update `INSTALLATION.md` with usage examples
- Add screenshots of new UI

## 🧪 Testing Scenarios

### Basic Functionality
- [ ] Copy cookies with original expiration
- [ ] Copy cookies with extended expiration
- [ ] Copy cookies as session-only
- [ ] Copy cookies with custom expiration

### Edge Cases
- [ ] Handle already expired cookies
- [ ] Handle cookies without expiration dates
- [ ] Handle very long expiration dates
- [ ] Handle invalid date formats

### User Experience
- [ ] UI responsiveness with new options
- [ ] Preset selection and application
- [ ] Error handling and user feedback
- [ ] Settings persistence across sessions

## 🎯 Success Metrics

### Functionality
- All expiration modes work correctly
- No cookies are corrupted during expiration modification
- Proper error handling for edge cases

### Usability
- Intuitive UI for expiration options
- Quick access to common presets
- Clear feedback on what expiration was applied

### Performance
- No significant slowdown in cookie copying
- Efficient filtering of large cookie sets
- Responsive UI with new options

## 📅 Implementation Timeline

### Week 1: Foundation
- Implement basic expiration modification
- Add preset modes (Development, Testing)
- Update UI with basic options

### Week 2: Advanced Features
- Add filtering capabilities
- Implement smart expiration handling
- Add minimum/maximum guards

### Week 3: Polish & Testing
- UI improvements and polish
- Comprehensive testing
- Documentation updates

## 🔄 Future Enhancements (Post-MVP)

### Advanced Presets
- User-defined custom presets
- Domain-specific expiration rules
- Time-based automatic presets

### Analytics & Insights
- Show expiration summary before copying
- Cookie lifetime analysis
- Usage statistics and recommendations

### Integration Features
- Export/import expiration settings
- Sync settings across devices
- Integration with development tools