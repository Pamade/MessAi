# Deployment Guide

## Pre-Deployment Checklist

### 1. Required Files
- [ ] Create extension icons (16x16, 48x48, 128x128 PNG)
- [ ] Update manifest.json version
- [ ] Test all features
- [ ] Remove console.logs (optional)
- [ ] Check API key handling

### 2. Build for Production

```bash
npm run build
```

This creates a `dist` folder with:
- background.js
- content.js
- popup.html
- popup.css
- assets/
- manifest.json

### 3. Create Extension Icons

You need 3 icon sizes in the `public` folder:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

Use a tool like Figma, Canva, or Photoshop to create these.

### 4. Test the Build

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder
5. Test all features:
   - Generate messages in Facebook chat
   - Change tones
   - Use templates
   - Check settings
   - Verify history

### 5. Package for Chrome Web Store

1. Zip the `dist` folder contents (not the folder itself)
2. Name it something like `messenger-ai-assistant-v1.0.0.zip`

### 6. Chrome Web Store Submission

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer fee (if first time)
3. Click "New Item"
4. Upload your zip file
5. Fill in:
   - **Name**: Messenger AI Assistant
   - **Description**: AI-powered assistant for Facebook Messenger. Generate smart responses with custom tones using free Gemini API.
   - **Category**: Productivity
   - **Language**: English
   - **Screenshots**: 1280x800 or 640x400 (at least 1, max 5)
   - **Promotional images**: 440x280 (optional)
   - **Privacy Policy**: Required if collecting user data

### 7. Privacy Policy

Since you're storing API keys locally, you need a privacy policy. Example:

```
Privacy Policy for Messenger AI Assistant

Data Collection:
- We do NOT collect any personal data
- All API keys are stored locally in your browser
- No data is sent to our servers
- Conversation history is stored locally only

Third-Party Services:
- Uses Google Gemini API (user provides their own key)
- Subject to Google's privacy policy

Contact: your-email@example.com
```

### 8. Store Listing Assets Needed

- **Icon**: 128x128 PNG
- **Screenshots**: 1-5 images showing the extension in action
- **Promotional tile**: 440x280 (optional but recommended)
- **Marquee**: 1400x560 (optional)

### 9. Important Notes

**AdSense/Monetization:**
- Chrome extensions CANNOT use AdSense (against policies)
- Alternative monetization:
  - Freemium model (paid features)
  - Donations
  - Affiliate links (with disclosure)
  - Premium API keys

**Review Process:**
- Takes 1-7 days typically
- May be rejected if:
  - Missing privacy policy
  - Unclear permissions
  - Violates Facebook's terms
  - Contains ads/tracking

### 10. Post-Deployment

- Monitor reviews
- Respond to user feedback
- Plan updates
- Track usage (via Chrome Web Store dashboard)

## Version Updates

To release a new version:

1. Update version in `manifest.json`
2. Update version in `package.json`
3. Run `npm run build`
4. Test the build
5. Zip and upload to Chrome Web Store
6. Add changelog in store listing

## Common Issues

**Extension not loading:**
- Check manifest.json syntax
- Verify all files are in dist folder
- Check console for errors

**Features not working:**
- Test on facebook.com and messenger.com
- Check content script injection
- Verify permissions in manifest

**Store rejection:**
- Read rejection reason carefully
- Fix issues and resubmit
- Common: privacy policy, permissions justification
