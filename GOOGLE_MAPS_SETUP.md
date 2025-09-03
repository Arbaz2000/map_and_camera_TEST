# Google Maps Setup Guide

## Prerequisites
- Google Cloud Console account
- Google Maps API key

## Steps to Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API (optional, for address lookup)
4. Go to Credentials → Create Credentials → API Key
5. Copy your API key

## Configuration

### Android
1. Open `android/app/src/main/AndroidManifest.xml`
2. Replace `AIzaSyAkohimbh6FL9mkUXhfdhIy6qKm_DAADeQ` with your actual API key:
   ```xml
   <meta-data
     android:name="com.google.android.geo.API_KEY"
     android:value="YOUR_ACTUAL_API_KEY_HERE" />
   ```

### iOS
1. Open `ios/map_and_camera_TEST/Info.plist`
2. Add your API key (you'll need to do this in Xcode or add it to the plist file)

## Testing
1. Run `npx react-native run-android` or `npx react-native run-ios`
2. Navigate to the Map tab
3. Grant location permissions when prompted
4. Your current location should appear on the map

## Troubleshooting
- Make sure location permissions are granted
- Verify your API key is correct
- Check that the required APIs are enabled in Google Cloud Console
- For Android, ensure you have the latest Google Play Services
