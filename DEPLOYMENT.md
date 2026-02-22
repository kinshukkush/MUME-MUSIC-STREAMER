# 🚀 Production Deployment Checklist

Use this checklist before deploying your app to production or publishing to GitHub.

## 📋 Pre-Deployment Checklist

### 1. Update Personal Information

- [ ] Update GitHub repository URLs in `README.md`
  - Replace `https://github.com/kinshukkush/MUME-MUSIC-STREAMER` with your repo URL
- [ ] Verify developer information in `README.md` is correct
- [ ] Update package in `app.json` if needed (currently: `com.kinshuksaxena.mume`)

### 2. Test Application

- [ ] Test all screens and navigation
- [ ] Test music playback (play, pause, next, previous)
- [ ] Test downloads feature and Downloads playlist
- [ ] Test favorites functionality
- [ ] Test custom playlists (create, delete, add songs)
- [ ] Test search functionality
- [ ] Test theme switching (Light/Dark/System)
- [ ] Test onboarding flow
- [ ] Test settings and logout/reset

### 3. Assets & Configuration

- [ ] Verify `splash-icon.png` exists at 1024×1024px in `/assets`
- [ ] Verify `icon.png` exists in `/assets`
- [ ] Verify `favicon.png` exists in `/assets`
- [ ] Check `app.json` version number is correct
- [ ] Verify app name and slug are correct in `app.json`

### 4. Build Preparation

- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npx expo start` to verify app runs without errors
- [ ] Check for any TypeScript errors
- [ ] Test on actual device using Expo Go

### 5. Git & GitHub

- [ ] Review `.gitignore` - ensure sensitive files are excluded
- [ ] Remove any TODO comments or debug code
- [ ] Commit all changes with meaningful commit messages
- [ ] Create GitHub repository if not exists
- [ ] Push to GitHub: `git push -u origin main`

### 6. Build APK

**Using EAS Build (Recommended):**

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure EAS (first time only)
eas build:configure

# Build APK for Android
eas build --platform android --profile preview
```

**Build Profiles:**
- `preview` - Creates APK file (for distribution outside Play Store)
- `production` - Creates AAB file (for Google Play Store)

### 7. Create GitHub Release

- [ ] Download APK from EAS Build dashboard
- [ ] Go to GitHub repository → Releases → New Release
- [ ] Create tag: `v1.0.0` (or your version number)
- [ ] Add release title and description
- [ ] Upload APK file
- [ ] Publish release

### 8. Post-Release

- [ ] Test downloaded APK on a fresh Android device
- [ ] Update README.md with release link if needed
- [ ] Share with users!

---

## 📝 Common Commands

```bash
# Start development server
npx expo start

# Clear cache and restart
npx expo start --clear

# Build preview APK
eas build --platform android --profile preview

# Check EAS build status
eas build:list

# View EAS build logs
eas build:view [BUILD_ID]
```

---

## 🔧 Troubleshooting

### Build Fails
- Check `eas.json` configuration
- Verify all dependencies are compatible with Expo SDK 54
- Check EAS build logs for specific errors

### APK Won't Install
- Ensure "Install from Unknown Sources" is enabled on Android device
- Verify APK is built for correct architecture (ARM/x86)
- Check minimum Android version compatibility (API level 21+)

### App Crashes on Launch
- Check for missing assets (icons, images)
- Verify all environment variables are set
- Check Expo Go logs for error messages

---

## 📞 Need Help?

If you encounter any issues:
1. Check Expo documentation: https://docs.expo.dev
2. Check EAS Build documentation: https://docs.expo.dev/build/introduction
3. Review app logs in Expo Go or using `npx expo start`
4. Check GitHub issues or create a new one

---

**Good luck with your deployment! 🚀**
