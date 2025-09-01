# Barcode Scanner POC

This is a Proof of Concept (POC) for barcode scanning using `react-native-vision-camera`.

## Features

- Supports multiple barcode types:
  - QR codes
  - EAN-13, EAN-8
  - Code-128, Code-39, Code-93
  - UPC-A, UPC-E
  - ITF, ITF-14
  - Codabar
  - PDF-417
  - Aztec
  - Data Matrix
  - GS1 DataBar variants

## Setup

### Prerequisites

- React Native 0.81.1
- Node.js >= 20
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. For Android, the `VisionCamera_enableCodeScanner=true` flag has been added to `android/gradle.properties`

3. Camera permissions have been added to:
   - `android/app/src/main/AndroidManifest.xml`
   - `ios/map_and_camera_TEST/Info.plist`

### Running the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

## Usage

1. Launch the app
2. Grant camera permission when prompted
3. Point the camera at any supported barcode
4. The app will display an alert with the scanned code type and value
5. The last scanned code is also displayed at the bottom of the screen

## Code Structure

- `App.tsx` - Main app component that renders the barcode scanner
- `BarcodeScanner.tsx` - Core barcode scanning component using react-native-vision-camera

## Notes

- On iOS, UPC-A codes are reported as EAN-13 (with an extra 0 at the front)
- ITF-14 is only supported on iOS; Android requires manual handling for 14-character restriction
- The scanner supports all major barcode formats mentioned in the react-native-vision-camera documentation

## Troubleshooting

1. **Camera permission denied**: Make sure to grant camera permission when prompted
2. **Build errors**: Clean and rebuild the project:
   ```bash
   # Android
   cd android && ./gradlew clean && cd ..
   npm run android
   
   # iOS
   cd ios && xcodebuild clean && cd ..
   npm run ios
   ```
3. **Code not detected**: Ensure the barcode is well-lit and clearly visible to the camera
