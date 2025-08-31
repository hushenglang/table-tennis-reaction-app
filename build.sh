#!/bin/bash

# Table Tennis Reaction App - Build Script
# Copies web content files to iOS app WebContent directory

# Set source and destination directories
SOURCE_DIR="/Users/hushenglang/Development/workspace/2025/table-tennis-reaction-app"
DEST_DIR="/Users/hushenglang/Development/workspace/2025/table-tennis-reaction-app/TableTennisReactionApp/WebContent"

echo "🏓 Table Tennis Reaction App - Build Script"
echo "============================================="

# Check if source files exist
if [ ! -f "$SOURCE_DIR/index.html" ]; then
    echo "❌ Error: index.html not found in source directory"
    exit 1
fi

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

echo "📁 Copying files from root to WebContent directory..."

# Copy individual files (overwrite existing)
echo "  📄 Copying index.html..."
cp "$SOURCE_DIR/index.html" "$DEST_DIR/"

echo "  📄 Copying script.js..."
cp "$SOURCE_DIR/script.js" "$DEST_DIR/"

echo "  📄 Copying style.css..."
cp "$SOURCE_DIR/style.css" "$DEST_DIR/"

echo "  📄 Copying manifest.json..."
cp "$SOURCE_DIR/manifest.json" "$DEST_DIR/"

# Copy icons directory (overwrite existing)
echo "  🖼️  Copying icons/ directory..."
if [ -d "$SOURCE_DIR/icons" ]; then
    # Remove existing icons directory and copy fresh
    rm -rf "$DEST_DIR/icons"
    cp -r "$SOURCE_DIR/icons" "$DEST_DIR/"
else
    echo "⚠️  Warning: icons directory not found in source"
fi

echo "✅ Build completed successfully!"
echo "📱 Files copied to: $DEST_DIR"

# List copied files for verification
echo ""
echo "📋 Copied files:"
ls -la "$DEST_DIR"
