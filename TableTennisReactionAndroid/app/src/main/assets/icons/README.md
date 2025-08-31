# App Icons Guide

## Required Icon Files

You need to create the following PNG icon files for your iOS web app:

### Apple Touch Icons (for iOS home screen)
- `apple-touch-icon.png` (180x180px) - iPhone 6 Plus and newer
- `apple-touch-icon-152x152.png` (152x152px) - iPad Retina
- `apple-touch-icon-144x144.png` (144x144px) - iPad non-Retina
- `apple-touch-icon-120x120.png` (120x120px) - iPhone 6 and newer
- `apple-touch-icon-114x114.png` (114x114px) - iPhone 4 Retina
- `apple-touch-icon-76x76.png` (76x76px) - iPad
- `apple-touch-icon-72x72.png` (72x72px) - iPad non-Retina
- `apple-touch-icon-60x60.png` (60x60px) - iPhone
- `apple-touch-icon-57x57.png` (57x57px) - iPhone 3GS

### Favicons (for browsers)
- `favicon-32x32.png` (32x32px)
- `favicon-16x16.png` (16x16px)

## Design Recommendations

### Content
Create an icon that represents your Table Tennis Reaction app:
- 🏓 Table tennis paddle and ball
- ⚡ Lightning bolt for "reaction"
- L/R letters (like your app interface)
- Combination of the above

### Style Guidelines
- **Simple and clean**: Icons work best when not cluttered
- **High contrast**: Ensure good visibility on various backgrounds
- **No text**: Avoid small text that becomes unreadable
- **Square format**: All icons should be perfect squares
- **Color scheme**: Use your app's color scheme (#667eea, #764ba2)

## How to Create Icons

### Option 1: Using Online Tools
1. **Favicon.io** (https://favicon.io/)
   - Use text or emoji to icon generator
   - Try the 🏓 emoji with custom background colors

2. **RealFaviconGenerator** (https://realfavicongenerator.net/)
   - Upload a base image and generate all sizes
   - Provides exact specifications for each platform

### Option 2: Design Software
1. Create a 512x512px base design in:
   - Adobe Illustrator/Photoshop
   - Figma
   - Canva
   - GIMP (free)

2. Export/resize to all required dimensions

### Option 3: Quick Start Template
Use the provided SVG template below and convert to PNG:

```svg
<!-- Save as icon-template.svg, then convert to PNG at different sizes -->
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="90" fill="url(#bg)"/>
  
  <!-- Table tennis paddle -->
  <circle cx="200" cy="200" r="80" fill="#fff" stroke="#333" stroke-width="8"/>
  <rect x="170" y="280" width="60" height="120" rx="30" fill="#8B4513"/>
  
  <!-- Ball -->
  <circle cx="320" cy="180" r="30" fill="#fff" stroke="#333" stroke-width="4"/>
  
  <!-- L and R indicators -->
  <text x="150" y="420" font-family="Arial Black" font-size="80" font-weight="900" fill="#fff">L</text>
  <text x="320" y="420" font-family="Arial Black" font-size="80" font-weight="900" fill="#fff">R</text>
</svg>
```

## Installation Steps

1. **Create your icons** using one of the methods above
2. **Save all PNG files** in this `icons/` directory
3. **Test your web app** by adding it to your iPhone home screen:
   - Open Safari on iPhone
   - Navigate to your web app
   - Tap the Share button
   - Select "Add to Home Screen"
   - Your custom icon should appear!

## Notes
- iOS automatically adds rounded corners and shine effects
- Icons should have solid backgrounds (no transparency)
- Test on actual device to ensure quality
- The 180x180px icon is the most important for modern iPhones
