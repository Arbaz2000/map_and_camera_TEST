import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import Sound from 'react-native-sound';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  BarcodeScanner: undefined;
  GoogleMaps: undefined;
};

type BarcodeScannerNavigationProp = StackNavigationProp<RootStackParamList, 'BarcodeScanner'>;

interface Code {
  type: string;
  value: string;
}

const BarcodeScanner: React.FC = () => {
  const navigation = useNavigation<BarcodeScannerNavigationProp>();
  const [scannedCodes, setScannedCodes] = useState<Code[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [torchMode, setTorchMode] = useState<'on' | 'off'>('off');
  const lastScannedCode = useRef<string>('');
  const beepSound = useRef<Sound | null>(null);

  // Initialize sound on component mount
  useEffect(() => {
    // Enable playback in silence mode
    Sound.setCategory('Playback');

    // Create a simple beep sound using a short audio URL
    beepSound.current = new Sound(
      'https://www.soundjay.com/buttons/sounds/beep-23.mp3',
      undefined,
      error => {
        if (error) {
          // Fallback to system notification sound
          beepSound.current = new Sound(
            'notification',
            Sound.MAIN_BUNDLE,
            _error2 => {
              // Silent fallback
            },
          );
        }
      },
    );

    // Cleanup sound on unmount
    return () => {
      if (beepSound.current) {
        beepSound.current.release();
      }
    };
  }, []);

  const playBeepSound = () => {
    if (beepSound.current) {
      beepSound.current.play();
    }
  };
  const toggleTorch = () => {
    setTorchMode(prevMode => {
      return prevMode === 'off' ? 'on' : 'off';
    });
  };

  const onReadCode = (event: any) => {
    const scannedValue = event.nativeEvent.codeStringValue;

    // Prevent duplicate scans of the same code
    if (lastScannedCode.current === scannedValue || isScanning) {
      return;
    }

    // Set scanning state to prevent multiple scans
    setIsScanning(true);
    lastScannedCode.current = scannedValue;

    const code: Code = {
      type: event.nativeEvent.type,
      value: scannedValue,
    };

    setScannedCodes([code]);

    // Play beep sound when code is scanned
    playBeepSound();

    // Show alert with scanned code info
    Alert.alert('Code Scanned!', `Type: ${code.type}\nValue: ${code.value}`, [
      {
        text: 'OK',
        onPress: () => {
          // Reset scanning state after a delay to allow new scans
          setTimeout(() => {
            setIsScanning(false);
            lastScannedCode.current = '';
          }, 2000); // 2 second delay before allowing new scans
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        cameraType={CameraType.Back}
        torchMode={torchMode}
        focusMode="on"
        zoomMode="on"
        onReadCode={onReadCode}
        showFrame={true}
        scanBarcode={true}
        laserColor="red"
        frameColor="white"
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          {isScanning ? 'Scanning paused...' : 'Point camera at a barcode'}
        </Text>

        {/* Navigation Button */}
        <View style={styles.navigationButtonContainer}>
          <TouchableOpacity 
            style={styles.navigationButton} 
            onPress={() => navigation.navigate('GoogleMaps')}
          >
            <Text style={styles.navigationButtonText}>🗺️ Go to Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Flash Controls */}
        <View style={styles.flashButtonContainer}>
          <Text style={styles.torchButton} onPress={toggleTorch}>
            {torchMode === 'on' ? '💡 TORCH' : '🌙 TORCH'}
          </Text>
        </View>

        {scannedCodes.length > 0 && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              Last scanned: {scannedCodes[0].type} - {scannedCodes[0].value}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  navigationButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20,
  },
  navigationButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
  },
  resultText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },

  flashButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20,
  },
  flashButton: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  torchButton: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default BarcodeScanner;
