# Table Tennis Reaction App - iOS Wrapper

This iOS project wraps the web-based Table Tennis Reaction app in a native iOS WebView container.

## Project Structure

```
TableTennisReactionApp.xcodeproj/     # Xcode project file
TableTennisReactionApp/               # iOS app source code
├── App.swift                        # Main app entry point
├── ContentView.swift                # WebView container
├── Info.plist                       # App configuration
├── Assets.xcassets/                 # App icons and assets
└── WebContent/                      # Web app files
    ├── index.html
    ├── style.css
    ├── script.js
    ├── manifest.json
    └── icons/
```

## How to Build and Run

1. **Open in Xcode**: Double-click `TableTennisReactionApp.xcodeproj` to open the project in Xcode

2. **Select Target Device**: Choose your preferred iOS simulator or connected iOS device from the target dropdown

3. **Build and Run**: Press ⌘+R or click the "Run" button to build and launch the app

## Features

- **Full-Screen WebView**: The app displays your web app in a full-screen WebView
- **Local Web Content**: All web assets are bundled with the iOS app for offline functionality
- **Native iOS Integration**: Proper iOS app structure with launch screen and app icons
- **Multi-Orientation Support**: Supports portrait and landscape orientations
- **Auto-Layout**: Automatically adapts to different screen sizes

## Configuration

### App Information
- **Bundle ID**: `com.example.TableTennisReactionApp`
- **Display Name**: "Table Tennis Reaction"
- **Version**: 1.0
- **Minimum iOS Version**: 17.0

### WebView Features
- Inline media playback enabled
- No user action required for media playback
- Local file loading with proper base URL handling

## Customization

### App Icons
Add your app icons to `TableTennisReactionApp/Assets.xcassets/AppIcon.appiconset/`

### Bundle Identifier
Update the bundle identifier in the Xcode project settings under:
- Project Settings → General → Identity → Bundle Identifier

### App Name
Change the display name in `Info.plist`:
```xml
<key>CFBundleDisplayName</key>
<string>Your App Name</string>
```

## Web Content Updates

To update the web content:
1. Replace files in `TableTennisReactionApp/WebContent/`
2. Rebuild the iOS app

The web content is bundled with the app, so any changes require rebuilding and redistributing the iOS app.

## Troubleshooting

### WebView Not Loading
- Ensure `index.html` exists in the `WebContent` folder
- Check the Xcode console for loading errors
- Verify all web assets are properly copied to the `WebContent` folder

### Build Errors
- Make sure you're using Xcode 15.0 or later
- Check that all files are properly added to the Xcode project
- Verify the bundle identifier doesn't conflict with existing apps

## Distribution

To distribute the app:
1. Configure code signing in Xcode project settings
2. Archive the project (Product → Archive)
3. Distribute through App Store Connect or TestFlight
