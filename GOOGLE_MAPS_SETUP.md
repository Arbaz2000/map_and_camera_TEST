# Google Maps Integration Setup Guide

This guide will help you set up Google Maps in your React Native app with proper permission handling.

## 🚀 Features Added

- **Navigation Button**: Added a "🗺️ Go to Maps" button on the Barcode Scanner screen
- **Google Maps Screen**: New screen with interactive Google Maps
- **Permission Management**: Comprehensive permission checking for:
  - 📍 Location (GPS)
  - 📷 Camera
  - 💾 Storage (Android)
- **Permission Status Display**: Real-time permission status with visual indicators

## 📱 Required Dependencies

The following packages have been installed:
- `@react-navigation/native` - Navigation container
- `@react-navigation/stack` - Stack navigation
- `react-native-maps` - Google Maps integration
- `react-native-permissions` - Permission handling
- `react-native-screens` - Screen management
- `react-native-gesture-handler` - Gesture handling

## 🔑 Google Maps API Key Setup

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API (optional, for additional features)
4. Create credentials (API Key)
5. Restrict the API key to your app's bundle ID

### 2. Configure Android

1. Open `android/app/src/main/AndroidManifest.xml`
2. Replace `AIzaSyAkohimbh6FL9mkUXhfdhIy6qKm_DAADeQ` with your actual API key:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_ACTUAL_API_KEY_HERE" />
```

### 3. Configure iOS

1. Open `ios/map_and_camera_TEST/Info.plist`
2. Add your API key (if needed for iOS)

## 📋 Permission Setup

### Android Permissions (Already Added)

The following permissions have been added to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### iOS Permissions (Already Added)

The following permissions have been added to `Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show your current position on the map</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to show your current position on the map</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to save scanned barcode images</string>
```

## 🏗️ Project Structure

```
├── App.tsx                    # Main app with navigation
├── BarcodeScanner.tsx         # Barcode scanner with navigation button
├── GoogleMapsScreen.tsx       # Google Maps screen with permissions
├── android/                   # Android-specific configurations
├── ios/                       # iOS-specific configurations
└── GOOGLE_MAPS_SETUP.md      # This setup guide
```

## 🚀 How to Use

1. **Barcode Scanner Screen**: 
   - Scan barcodes as usual
   - Tap "🗺️ Go to Maps" button to navigate to maps

2. **Google Maps Screen**:
   - View interactive Google Maps
   - Check permission status at the top
   - Tap "Check Permissions" to request missing permissions
   - View detailed permission status at the bottom

## 🔧 Troubleshooting

### Common Issues

1. **Maps not loading**: Check if Google Maps API key is properly configured
2. **Location not working**: Ensure location permissions are granted
3. **Build errors**: Make sure all dependencies are properly installed

### Permission Issues

- **Android**: Check if permissions are granted in Settings > Apps > Your App > Permissions
- **iOS**: Check if permissions are granted in Settings > Privacy & Security > Location Services

### API Key Issues

- Verify API key is correct
- Check if Maps SDK is enabled in Google Cloud Console
- Ensure API key restrictions match your app's bundle ID

## 📱 Testing

1. **Android**: Run `npm run android`
2. **iOS**: Run `npm run ios`
3. Test navigation between screens
4. Test permission requests
5. Test map functionality

## 🔒 Security Notes

- Never commit your actual Google Maps API key to version control
- Use environment variables or secure key management
- Restrict your API key to specific bundle IDs and IP addresses
- Monitor API usage in Google Cloud Console

## 📚 Additional Resources

- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [React Native Permissions](https://github.com/zoontek/react-native-permissions)
- [Google Maps Platform](https://developers.google.com/maps)
- [React Navigation](https://reactnavigation.org/)

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all dependencies are properly installed
3. Ensure permissions are correctly configured
4. Check Google Cloud Console for API issues
