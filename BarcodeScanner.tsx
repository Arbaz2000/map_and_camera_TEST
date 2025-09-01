import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { Camera } from 'react-native-camera-kit';

interface Code {
  type: string;
  value: string;
}

const BarcodeScanner: React.FC = () => {
  const [scannedCodes, setScannedCodes] = useState<Code[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const lastScannedCode = useRef<string>('');

  const onReadCode = (event: any) => {
    const scannedValue = event.nativeEvent.codeStringValue;
    
    // Prevent duplicate scans of the same code
    if (lastScannedCode.current === scannedValue || isScanning) {
      return;
    }
    
    console.log('Code scanned:', scannedValue);
    
    // Set scanning state to prevent multiple scans
    setIsScanning(true);
    lastScannedCode.current = scannedValue;
    
    const code: Code = {
      type: event.nativeEvent.type,
      value: scannedValue
    };
    
    setScannedCodes([code]);
    
    // Show alert with scanned code info
    Alert.alert(
      'Code Scanned!',
      `Type: ${code.type}\nValue: ${code.value}`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            console.log('OK Pressed');
            // Reset scanning state after a delay to allow new scans
            setTimeout(() => {
              setIsScanning(false);
              lastScannedCode.current = '';
            }, 2000); // 2 second delay before allowing new scans
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        cameraType="back"
        flashMode="auto"
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
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  button: {
    color: '#007AFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default BarcodeScanner;
