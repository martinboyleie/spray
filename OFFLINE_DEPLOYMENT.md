# Offline Spray Tracker Deployment Guide

This guide will help you deploy the completely offline version of the Spray Tracker app to your iPhone/iPad.

## What's Different About the Offline Version

The `offline.html` file is a **complete standalone application** that:
- ✅ Works entirely offline (no server needed)
- ✅ Stores all data locally in your browser's localStorage
- ✅ Includes all the same features (scheduling, history, location tracking)
- ✅ Runs completely on your device
- ✅ No dependency on your local machine or ngrok

## Deployment Options

**Note**: We recommend avoiding traditional cloud storage services (Google Drive, Dropbox, OneDrive) for hosting HTML files as they no longer support direct file serving for web applications.

### Option 1: GitHub Pages (Recommended)

1. **Create a GitHub Repository**
   ```bash
   # Create a new repository on GitHub (public)
   # Clone it locally or upload files through web interface
   ```

2. **Upload the offline.html file**
   - Upload `offline.html` to your GitHub repository
   - Rename it to `index.html` (GitHub Pages serves index.html by default)

3. **Enable GitHub Pages**
   - Go to your repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

4. **Access Your App**
   - GitHub will provide a URL like: `https://yourusername.github.io/repository-name`
   - This URL will work forever and be accessible from any device

### Option 2: Static Hosting Services

Upload `offline.html` to any of these reliable services:
- **Netlify**: Drag and drop the file to netlify.com/drop (instant deployment)
- **Vercel**: Upload through vercel.com (free tier available)
- **Firebase Hosting**: Use Firebase CLI (Google's hosting service)
- **Surge.sh**: Simple command-line static hosting
- **Render**: Free static site hosting with GitHub integration

### Option 3: Alternative Hosting Services

For quick testing or temporary hosting:
1. **Codepen.io**: Create a new pen, paste the HTML content, and get a shareable link
2. **JSFiddle**: Create a new fiddle with the HTML content
3. **Glitch.com**: Create a new project and upload the file
4. **GitHub Gist**: Create a gist with the HTML file (though not ideal for full apps)

**Note**: These are better for testing than permanent deployment.

### Recommended Hosting Priority

For best reliability and performance:
1. **GitHub Pages** - Free, reliable, permanent URLs
2. **Netlify** - Excellent for static sites, free tier generous
3. **Vercel** - Fast deployment, good free tier
4. **Firebase Hosting** - Google's reliable hosting platform

## iPhone/iPad Installation

### Method 1: Add to Home Screen (PWA)

1. **Open the app URL in Safari** on your iPhone/iPad
2. **Tap the Share button** (square with arrow up)
3. **Scroll down and tap "Add to Home Screen"**
4. **Name it "Spray Tracker"** and tap "Add"
5. **The app icon will appear on your home screen**

### Method 2: Bookmark for Easy Access

1. Open the app URL in Safari
2. Tap the Share button
3. Tap "Add Bookmark"
4. Save to your home screen or bookmarks bar

## Features of the Offline Version

### ✅ Complete Functionality
- **Location Tracking**: 3 mouth locations with visual diagram
- **Rotation System**: Automatic next location suggestion
- **Scheduling**: Set custom intervals with overdue notifications
- **History**: Last 30 days of spray records
- **Statistics**: Total sprays, current cycle, locations used
- **Keyboard Shortcuts**: Press 1, 2, or 3 to record sprays

### ✅ Offline Storage
- All data stored in browser's localStorage
- Survives browser restarts and device reboots
- No internet connection required after initial load
- Data persists indefinitely

### ✅ Mobile Optimized
- Responsive design for phones and tablets
- Touch-friendly buttons and interface
- Works in portrait and landscape modes
- Optimized for iOS Safari

## Data Management

### Backup Your Data
Since data is stored locally, consider these backup strategies:

1. **Manual Export** (future feature)
2. **Screenshots** of your history page
3. **Regular usage** ensures data is always current

### Clear Data
- Use the "Clear All Data" button in the app
- Or clear Safari data for the specific site

### Transfer Between Devices
- Currently requires manual setup on each device
- Each device maintains its own data independently

## Troubleshooting

### App Won't Load
- Check internet connection for initial load
- Try refreshing the page
- Clear Safari cache and reload

### Data Not Saving
- Ensure Safari allows localStorage
- Check if you're in Private Browsing mode (disable it)
- Make sure you have storage space available

### Home Screen Icon Missing
- Re-add to home screen following the steps above
- Ensure you used Safari (not Chrome or other browsers)

### Schedule Not Working
- Check that schedule is enabled in Settings
- Verify start/end times and intervals are correct
- Ensure device time/timezone is correct

## Advantages of Offline Version

1. **True Independence**: No server required
2. **Always Available**: Works without internet after initial load
3. **Fast Performance**: No network delays
4. **Privacy**: All data stays on your device
5. **No Maintenance**: No server to maintain or update
6. **Free Hosting**: Many free options available
7. **Cross-Platform**: Works on any device with a modern browser

## File Information

- **File**: `offline.html`
- **Size**: ~25KB (very lightweight)
- **Dependencies**: Bootstrap CSS and FontAwesome (loaded from CDN)
- **Browser Support**: Modern browsers (Safari, Chrome, Firefox, Edge)
- **Storage**: localStorage (typically 5-10MB limit per domain)

## Next Steps

1. Choose your preferred deployment method
2. Upload the `offline.html` file
3. Test the app URL on your iPhone
4. Add to home screen for easy access
5. Start tracking your sprays!

The offline version gives you complete independence from your local machine while maintaining all the functionality you need for effective spray tracking. 