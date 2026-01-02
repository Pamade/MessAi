#!/bin/bash

# Production Build Script for Messenger AI Assistant

echo "🚀 Building Messenger AI Assistant for Production..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the extension
echo "📦 Building extension..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist folder not created."
    exit 1
fi

# Copy icons (you need to create these first)
echo "🎨 Copying icons..."
if [ -f "public/icon16.png" ] && [ -f "public/icon48.png" ] && [ -f "public/icon128.png" ]; then
    cp public/icon16.png dist/
    cp public/icon48.png dist/
    cp public/icon128.png dist/
    echo "✅ Icons copied"
else
    echo "⚠️  Warning: Icons not found in public/ folder"
    echo "   Please create icon16.png, icon48.png, and icon128.png"
fi

# Copy manifest
echo "📄 Copying manifest..."
cp manifest.json dist/

# Create zip for Chrome Web Store
echo "📦 Creating zip file..."
cd dist
zip -r ../messenger-ai-assistant-v1.0.0.zip .
cd ..

echo "✅ Build complete!"
echo ""
echo "📦 Package created: messenger-ai-assistant-v1.0.0.zip"
echo ""
echo "Next steps:"
echo "1. Test the extension by loading dist/ folder in Chrome"
echo "2. Upload messenger-ai-assistant-v1.0.0.zip to Chrome Web Store"
echo ""
echo "🎉 Ready for deployment!"
