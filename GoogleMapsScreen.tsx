import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

interface PermissionStatus {
  location: boolean;
  camera: boolean;
  storage: boolean;
}

const GoogleMapsScreen: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    location: false,
    camera: false,
    storage: false,
  });
  const [location, setLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    await Promise.all([
      checkLocationPermission(),
      checkCameraPermission(),
      checkStoragePermission(),
    ]);
  };

  const checkLocationPermission = async () => {
    try {
      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }

      const result = await check(permission);
      
      if (result === RESULTS.GRANTED) {
        setPermissions(prev => ({ ...prev, location: true }));
        return true;
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          setPermissions(prev => ({ ...prev, location: true }));
          return true;
        }
      }
      
      setPermissions(prev => ({ ...prev, location: false }));
      return false;
    } catch (error) {
      console.error('Location permission error:', error);
      setPermissions(prev => ({ ...prev, location: false }));
      return false;
    }
  };

  const checkCameraPermission = async () => {
    try {
      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.CAMERA;
      } else {
        permission = PERMISSIONS.ANDROID.CAMERA;
      }

      const result = await check(permission);
      
      if (result === RESULTS.GRANTED) {
        setPermissions(prev => ({ ...prev, camera: true }));
        return true;
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          setPermissions(prev => ({ ...prev, camera: true }));
          return true;
        }
      }
      
      setPermissions(prev => ({ ...prev, camera: false }));
      return false;
    } catch (error) {
      console.error('Camera permission error:', error);
      setPermissions(prev => ({ ...prev, camera: false }));
      return false;
    }
  };

  const checkStoragePermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        // iOS doesn't have storage permission like Android
        setPermissions(prev => ({ ...prev, storage: true }));
        return true;
      }

      const result = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      
      if (result === RESULTS.GRANTED) {
        setPermissions(prev => ({ ...prev, storage: true }));
        return true;
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        if (requestResult === RESULTS.GRANTED) {
          setPermissions(prev => ({ ...prev, storage: true }));
          return true;
        }
      }
      
      setPermissions(prev => ({ ...prev, storage: false }));
      return false;
    } catch (error) {
      console.error('Storage permission error:', error);
      setPermissions(prev => ({ ...prev, storage: false }));
      return false;
    }
  };

  const requestAllPermissions = async () => {
    const locationGranted = await checkLocationPermission();
    const cameraGranted = await checkCameraPermission();
    const storageGranted = await checkStoragePermission();

    if (!locationGranted || !cameraGranted || !storageGranted) {
      Alert.alert(
        'Permissions Required',
        'Some permissions are required for full functionality. Please grant them in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const getPermissionStatusText = () => {
    const allGranted = Object.values(permissions).every(Boolean);
    if (allGranted) {
      return '✅ All permissions granted';
    }
    
    const missing = Object.entries(permissions)
      .filter(([_, granted]) => !granted)
      .map(([permission]) => permission)
      .join(', ');
    
    return `❌ Missing: ${missing}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Google Maps</Text>
        <Text style={styles.permissionStatus}>{getPermissionStatusText()}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestAllPermissions}>
          <Text style={styles.buttonText}>Check Permissions</Text>
        </TouchableOpacity>
      </View>

      {permissions.location ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={location}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Current Location"
            description="You are here"
          />
        </MapView>
      ) : (
        <View style={styles.noPermissionContainer}>
          <Text style={styles.noPermissionText}>
            Location permission is required to display the map
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={checkLocationPermission}>
            <Text style={styles.buttonText}>Grant Location Permission</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.permissionDetails}>
        <Text style={styles.permissionTitle}>Permission Status:</Text>
        <Text style={[styles.permissionItem, permissions.location && styles.granted]}>
          📍 Location: {permissions.location ? 'Granted' : 'Denied'}
        </Text>
        <Text style={[styles.permissionItem, permissions.camera && styles.granted]}>
          📷 Camera: {permissions.camera ? 'Granted' : 'Denied'}
        </Text>
        <Text style={[styles.permissionItem, permissions.storage && styles.granted]}>
          💾 Storage: {permissions.storage ? 'Granted' : 'Denied'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  permissionStatus: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  permissionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPermissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  permissionDetails: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  permissionItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#d32f2f',
  },
  granted: {
    color: '#388e3c',
  },
});

export default GoogleMapsScreen;
