import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, PermissionsAndroid, Platform, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const MapScreen: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('MapScreen: Location obtained:', { latitude, longitude });
        const newLocation: Location = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setLocation(newLocation);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.log('MapScreen: Geolocation error:', error);
        setError('Failed to get current location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show it on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setError('Location permission denied');
          setLoading(false);
        }
      } else {
        getCurrentLocation();
      }
    } catch (err) {
      console.warn(err);
      setError('Failed to request location permission');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('MapScreen: Component mounted');
    console.log('MapScreen: Platform:', Platform.OS);
    requestLocationPermission();
  }, []);

  const onMapReady = () => {
    console.log('MapScreen: Map is ready!');
    setMapReady(true);
    
    // Force a map refresh after a delay
    setTimeout(() => {
      console.log('MapScreen: Forcing map refresh...');
    }, 2000);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={requestLocationPermission}>
          Tap to retry
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Location not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={location}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        onMapReady={onMapReady}
        provider={PROVIDER_GOOGLE}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Your Location"
          description="You are here"
          pinColor="blue"
        />
      </MapView>
      
      <View style={styles.infoOverlay}>
        <Text style={styles.infoText}>
          Latitude: {location.latitude.toFixed(6)}
        </Text>
        <Text style={styles.infoText}>
          Longitude: {location.longitude.toFixed(6)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#333',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: 'red',
  },
  retryText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  infoOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});

export default MapScreen;
