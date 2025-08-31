# Table Tennis Reaction App - Android

This is the Android wrapper for the Table Tennis Reaction Practice web app.

## About

This Android app provides a native wrapper around the web-based table tennis reaction training application. It uses a WebView to display the HTML/CSS/JavaScript interface within a native Android app container.

## Project Structure

```
TableTennisReactionAndroid/
├── app/
│   ├── src/main/
│   │   ├── java/com/tabletennis/reaction/
│   │   │   └── MainActivity.java          # Main activity with WebView
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   └── activity_main.xml      # Layout with WebView
│   │   │   ├── values/
│   │   │   │   ├── strings.xml           # App strings
│   │   │   │   ├── colors.xml            # App colors
│   │   │   │   └── styles.xml            # App themes
│   │   │   ├── mipmap-*/                 # App icons
│   │   │   └── xml/                      # Backup and data extraction rules
│   │   ├── assets/                       # Web app files (HTML, CSS, JS, icons)
│   │   └── AndroidManifest.xml           # App manifest
│   ├── build.gradle                      # App-level build configuration
│   └── proguard-rules.pro               # ProGuard rules
├── gradle/wrapper/                       # Gradle wrapper files
├── build.gradle                          # Project-level build configuration
├── settings.gradle                       # Project settings
├── gradle.properties                     # Gradle properties
├── gradlew                              # Gradle wrapper script (Unix)
├── gradlew.bat                          # Gradle wrapper script (Windows)
└── README.md                            # This file
```

## Requirements

- Android Studio Arctic Fox or later
- Android SDK with API level 24 (Android 7.0) or higher
- Java 8 or higher

## Building the App

1. Open the `TableTennisReactionAndroid` folder in Android Studio
2. Let Android Studio sync the project
3. Build the project using **Build > Make Project** or press `Ctrl+F9` (Windows/Linux) / `Cmd+F9` (Mac)

## Running the App

1. Connect an Android device with USB debugging enabled, or start an Android emulator
2. Click the **Run** button in Android Studio or press `Shift+F10` (Windows/Linux) / `Ctrl+R` (Mac)

## Features

- Full-screen immersive experience
- Local web app loading (no internet required after installation)
- Back button support to navigate within the web app
- Portrait orientation lock for consistent experience

## Technical Details

- **Target SDK**: Android 14 (API level 34)
- **Minimum SDK**: Android 7.0 (API level 24)
- **WebView**: Configured with JavaScript enabled and local file access
- **Themes**: Custom Material Design theme matching the web app colors
- **Permissions**: Internet and network state access (for potential future features)

## Building from Command Line

You can also build the app from the command line:

```bash
# On macOS/Linux
./gradlew assembleDebug

# On Windows
gradlew.bat assembleDebug
```

The APK will be generated in `app/build/outputs/apk/debug/`.

## Troubleshooting

- If you encounter build errors, ensure you have the correct Android SDK installed
- For WebView loading issues, check that all web assets are properly copied to the `assets` folder
- If the app doesn't display correctly, verify that the web app works in a mobile browser first
