# Environment Variables Setup

This project uses environment variables to securely store sensitive configuration like API keys.

## Setup Instructions

### 1. Create your .env file

Copy the example file and add your actual API keys:

```bash
cp .env.example .env
```

### 2. Add your API keys

Edit the `.env` file and replace the placeholder values with your actual API keys:

```env
# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
```

### 3. Get your Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Maps SDK for Android and iOS
4. Create credentials (API Key)
5. Restrict the API key to your app's package name and bundle ID

## How it works

### Android
- The API key is read from the `.env` file during build time
- It's injected into the `AndroidManifest.xml` using Gradle build configuration
- The key is stored in `android/app/src/main/AndroidManifest.xml` as a placeholder

### iOS
- The API key is read from the `.env` file during build time
- It's injected into the `Info.plist` using Xcode build settings
- The key is initialized in `AppDelegate.swift` when the app starts

### React Native
- Environment variables are available in JavaScript code via `@env` module
- TypeScript definitions are provided in `types/env.d.ts`

## Security Notes

- The `.env` file is excluded from version control (see `.gitignore`)
- Never commit your actual API keys to the repository
- Use the `.env.example` file as a template for other developers
- Consider using different API keys for development and production

## Troubleshooting

### Android Build Issues
- Make sure the `.env` file exists in the project root
- Check that the API key is properly formatted (no extra spaces or quotes)
- Clean and rebuild the project: `cd android && ./gradlew clean && cd .. && npx react-native run-android`

### iOS Build Issues
- Make sure the `.env` file exists in the project root
- Check that the API key is properly formatted
- Clean and rebuild the project: `cd ios && xcodebuild clean && cd .. && npx react-native run-ios`

### JavaScript/TypeScript Issues
- Make sure `react-native-dotenv` is properly configured in `babel.config.js`
- Restart the Metro bundler after making changes to environment variables
- Check that the TypeScript definitions are properly imported
