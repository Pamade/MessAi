# Pre-Deployment Checklist

## 1. Code Quality
- [ ] Remove all console.log statements (or keep only essential ones)
- [ ] Remove commented code
- [ ] Check for hardcoded values
- [ ] Verify error handling is in place
- [ ] Test all features work correctly

## 2. Icons & Assets
- [ ] Create icon16.png (16x16)
- [ ] Create icon48.png (48x48)
- [ ] Create icon128.png (128x128)
- [ ] Place icons in public/ folder
- [ ] Test icons look good on light and dark backgrounds

## 3. Manifest.json
- [ ] Update version number
- [ ] Verify name and description
- [ ] Check all permissions are necessary
- [ ] Verify host_permissions are correct
- [ ] Add icons references

## 4. Documentation
- [ ] Update README.md with installation instructions
- [ ] Create/update PRIVACY.md
- [ ] Prepare store listing description
- [ ] Create screenshots (5 recommended)
- [ ] Prepare promotional images

## 5. Testing
- [ ] Test on facebook.com
- [ ] Test on messenger.com
- [ ] Test with Gemini API
- [ ] Test with OpenAI API (if applicable)
- [ ] Test with Anthropic API (if applicable)
- [ ] Test all tones work
- [ ] Test templates feature
- [ ] Test history feature
- [ ] Test settings save/load
- [ ] Test error handling
- [ ] Test on different screen sizes
- [ ] Test with slow internet connection

## 6. Security
- [ ] Verify API keys are stored securely
- [ ] Check no sensitive data in code
- [ ] Verify CSP is set correctly
- [ ] Test permissions are minimal
- [ ] Review third-party dependencies

## 7. Privacy & Legal
- [ ] Create privacy policy
- [ ] Host privacy policy online
- [ ] Add privacy policy URL to manifest
- [ ] Verify GDPR compliance
- [ ] Add terms of service (optional)
- [ ] Add contact email

## 8. Build Process
- [ ] Run `npm run build`
- [ ] Verify dist/ folder is created
- [ ] Check all files are in dist/
- [ ] Test loading unpacked extension
- [ ] Create zip file for store
- [ ] Verify zip contains correct files

## 9. Store Listing
- [ ] Prepare detailed description
- [ ] Create 5 screenshots (1280x800)
- [ ] Create promotional tile (440x280)
- [ ] Prepare category and tags
- [ ] Set up developer account ($5 fee)
- [ ] Prepare support email/URL

## 10. Post-Deployment
- [ ] Monitor initial reviews
- [ ] Respond to user feedback
- [ ] Fix critical bugs quickly
- [ ] Plan feature updates
- [ ] Track usage statistics

## Important Notes

### AdSense/Monetization
❌ **Cannot use AdSense** - Against Chrome Web Store policies for extensions

✅ **Alternative monetization:**
- Freemium model (basic free, premium paid)
- Donations (Buy Me a Coffee, PayPal)
- Affiliate links (with disclosure)
- Premium features subscription

### Common Rejection Reasons
1. Missing privacy policy
2. Unclear permission justifications
3. Violating Facebook's terms
4. Containing ads/tracking code
5. Misleading description
6. Poor quality screenshots

### Review Timeline
- Initial review: 1-7 days
- Updates: 1-3 days
- Rejections: Fix and resubmit

### Version Numbering
- Major.Minor.Patch (e.g., 1.0.0)
- Increment patch for bug fixes (1.0.1)
- Increment minor for new features (1.1.0)
- Increment major for breaking changes (2.0.0)

## Quick Commands

### Build for production:
```bash
npm run build
```

### Create zip (Windows):
```bash
build-production.bat
```

### Create zip (Mac/Linux):
```bash
chmod +x build-production.sh
./build-production.sh
```

### Test locally:
1. Open chrome://extensions/
2. Enable Developer mode
3. Click "Load unpacked"
4. Select dist/ folder

## Contact for Issues
- GitHub Issues: [Your repo URL]
- Email: your-email@example.com
- Discord/Slack: [If applicable]
