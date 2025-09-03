import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  title: string;
  description: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
  steps: string[];
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const RoutingComponent: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startPredictions, setStartPredictions] = useState<PlacePrediction[]>([]);
  const [endPredictions, setEndPredictions] = useState<PlacePrediction[]>([]);
  const [showStartPredictions, setShowStartPredictions] = useState(false);
  const [showEndPredictions, setShowEndPredictions] = useState(false);
  const [isRouteInfoCollapsed, setIsRouteInfoCollapsed] = useState(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const startInputRef = useRef<TextInput>(null);
  const endInputRef = useRef<TextInput>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: Location = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setCurrentLocation(newLocation);
        
        // Set start point to current location
        setStartPoint({
          latitude,
          longitude,
          title: 'Start Point',
          description: 'Your current location'
        });
      },
      (error) => {
        console.log('Geolocation error:', error);
        Alert.alert('Error', 'Failed to get current location');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const getPlacePredictions = async (input: string, setPredictions: (predictions: PlacePrediction[]) => void) => {
    if (input.length < 3) {
      setPredictions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=AIzaSyAkohimbh6FL9mkUXhfdhIy6qKm_DAADeQ&types=geocode`
      );
      
      if (response.data.predictions) {
        setPredictions(response.data.predictions);
      }
    } catch (error) {
      console.error('Places API error:', error);
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<{ lat: number; lng: number; address: string } | null> => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=AIzaSyAkohimbh6FL9mkUXhfdhIy6qKm_DAADeQ`
      );
      
      if (response.data.result && response.data.result.geometry) {
        const { lat, lng } = response.data.result.geometry.location;
        return {
          lat,
          lng,
          address: response.data.result.formatted_address
        };
      }
      return null;
    } catch (error) {
      console.error('Place details error:', error);
      return null;
    }
  };

  const handleStartAddressChange = (text: string) => {
    setStartAddress(text);
    setShowStartPredictions(true);
    getPlacePredictions(text, setStartPredictions);
  };

  const handleEndAddressChange = (text: string) => {
    setEndAddress(text);
    setShowEndPredictions(true);
    getPlacePredictions(text, setEndPredictions);
  };

  const selectStartPlace = async (prediction: PlacePrediction) => {
    setStartAddress(prediction.description);
    setShowStartPredictions(false);
    setStartPredictions([]);
    
    const placeDetails = await getPlaceDetails(prediction.place_id);
    if (placeDetails) {
      setStartPoint({
        latitude: placeDetails.lat,
        longitude: placeDetails.lng,
        title: 'Start Point',
        description: placeDetails.address
      });
    }
  };

  const selectEndPlace = async (prediction: PlacePrediction) => {
    setEndAddress(prediction.description);
    setShowEndPredictions(false);
    setEndPredictions([]);
    
    const placeDetails = await getPlaceDetails(prediction.place_id);
    if (placeDetails) {
      setEndPoint({
        latitude: placeDetails.lat,
        longitude: placeDetails.lng,
        title: 'End Point',
        description: placeDetails.address
      });
    }
  };

  const getDirections = async () => {
    if (!startPoint || !endPoint) {
      Alert.alert('Error', 'Please set both start and end points');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startPoint.latitude},${startPoint.longitude}&destination=${endPoint.latitude},${endPoint.longitude}&key=AIzaSyAkohimbh6FL9mkUXhfdhIy6qKm_DAADeQ`
      );

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const points = decodePolyline(route.overview_polyline.points);
        console.log('Route polyline points:', points);
        console.log('Number of route points:', points.length);
        setRouteCoordinates(points);
        
        // Extract route information
        const leg = route.legs[0];
        const steps = leg.steps.map((step: any) => step.html_instructions.replace(/<[^>]*>/g, ''));
        
        setRouteInfo({
          distance: leg.distance.text,
          duration: leg.duration.text,
          steps: steps
        });

        // Fit map to show entire route with proper coordinates
        if (mapRef.current && points.length > 0) {
          // Add a small delay to ensure state is updated
          setTimeout(() => {
            if (mapRef.current) {
              // Create proper coordinate objects for fitToCoordinates
              const routeCoords = points.map(point => ({
                latitude: point.latitude,
                longitude: point.longitude
              }));
              
              const allCoordinates = [
                { latitude: startPoint.latitude, longitude: startPoint.longitude },
                { latitude: endPoint.latitude, longitude: endPoint.longitude },
                ...routeCoords
              ];
              
              console.log('Fitting map to coordinates:', allCoordinates);
              
              try {
                mapRef.current.fitToCoordinates(allCoordinates, {
                  edgePadding: { top: 100, right: 100, bottom: 200, left: 100 },
                  animated: true,
                });
              } catch (error) {
                console.log('Map fitting error, trying alternative approach');
                // Fallback: just show both points
                recenterMap();
              }
            }
          }, 500);
        } else if (mapRef.current && startPoint && endPoint) {
          // If no route points, just show both markers
          setTimeout(() => {
            recenterMap();
          }, 300);
        }
      }
    } catch (error) {
      console.error('Directions error:', error);
      Alert.alert('Error', 'Failed to get directions');
    } finally {
      setLoading(false);
    }
  };

  const decodePolyline = (encoded: string): any[] => {
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let shift = 0, result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({
        latitude: lat / 1E5,
        longitude: lng / 1E5
      });
    }

    return poly;
  };

  const clearRoute = () => {
    setRouteCoordinates([]);
    setRouteInfo(null);
    setStartAddress('');
    setEndAddress('');
    setStartPredictions([]);
    setEndPredictions([]);
    setShowStartPredictions(false);
    setShowEndPredictions(false);
  };

  const recenterMap = useCallback(() => {
    if (mapRef.current && startPoint && endPoint) {
      const coordinates = [
        { latitude: startPoint.latitude, longitude: startPoint.longitude },
        { latitude: endPoint.latitude, longitude: endPoint.longitude }
      ];
      
      console.log('Recentering map to show both points:', coordinates);
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 200, left: 100 },
        animated: true,
      });
    }
  }, [startPoint, endPoint]);

  // Auto-recenter when both points are set
  useEffect(() => {
    if (startPoint && endPoint && mapRef.current) {
      // Small delay to ensure map is ready
      setTimeout(() => {
        recenterMap();
      }, 300);
    }
  }, [startPoint, endPoint, recenterMap]);

  const renderPredictionItem = ({ item, onSelect }: { item: PlacePrediction; onSelect: (prediction: PlacePrediction) => void }) => (
    <TouchableOpacity
      style={styles.predictionItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.predictionMainText}>{item.structured_formatting.main_text}</Text>
      <Text style={styles.predictionSecondaryText}>{item.structured_formatting.secondary_text}</Text>
    </TouchableOpacity>
  );

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={currentLocation}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* Start Point Marker */}
        {startPoint && (
          <Marker
            coordinate={startPoint}
            title={startPoint.title}
            description={startPoint.description}
            pinColor="green"
          />
        )}

        {/* End Point Marker */}
        {endPoint && (
          <Marker
            coordinate={endPoint}
            title={endPoint.title}
            description={endPoint.description}
            pinColor="red"
          />
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={6}
            strokeColor="#007AFF"
            strokeColors={['#007AFF']}
            lineCap="round"
            lineJoin="round"
            zIndex={1000}
          />
        )}
        
        {/* Fallback Route Line (if polyline fails) */}
        {routeCoordinates.length === 0 && startPoint && endPoint && (
          <Polyline
            coordinates={[startPoint, endPoint]}
            strokeWidth={3}
            strokeColor="#FF6B6B"
            strokeColors={['#FF6B6B']}
            lineCap="round"
            lineJoin="round"
            zIndex={999}
          />
        )}
      </MapView>

      {/* Input Controls */}
      <View style={styles.controlsContainer}>
        {/* Controls Header */}
        <TouchableOpacity
          style={styles.controlsHeader}
          onPress={() => setIsControlsCollapsed(!isControlsCollapsed)}
        >
          <Text style={styles.controlsHeaderTitle}>Route Controls</Text>
          <Text style={styles.collapseIcon}>
            {isControlsCollapsed ? '▼' : '▲'}
          </Text>
        </TouchableOpacity>
        
        {!isControlsCollapsed && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Start Point:</Text>
              <TextInput
                ref={startInputRef}
                style={styles.input}
                placeholder="Enter start address or use current location"
                value={startAddress}
                onChangeText={handleStartAddressChange}
                onFocus={() => setShowStartPredictions(true)}
              />
              {showStartPredictions && startPredictions.length > 0 && (
                <View style={styles.predictionsContainer}>
                  <FlatList
                    data={startPredictions}
                    keyExtractor={(item) => item.place_id}
                    renderItem={({ item }) => renderPredictionItem({ item, onSelect: selectStartPlace })}
                    style={styles.predictionsList}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>End Point:</Text>
              <TextInput
                ref={endInputRef}
                style={styles.input}
                placeholder="Enter destination address"
                value={endAddress}
                onChangeText={handleEndAddressChange}
                onFocus={() => setShowEndPredictions(true)}
              />
              {showEndPredictions && endPredictions.length > 0 && (
                <View style={styles.predictionsContainer}>
                  <FlatList
                    data={endPredictions}
                    keyExtractor={(item) => item.place_id}
                    renderItem={({ item }) => renderPredictionItem({ item, onSelect: selectEndPlace })}
                    style={styles.predictionsList}
                  />
                </View>
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={getDirections}
                disabled={loading || !startPoint || !endPoint}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Getting Route...' : 'Get Route'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={clearRoute}>
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            {/* Recenter Button */}
            {startPoint && endPoint && (
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={recenterMap}
              >
                <Text style={styles.buttonText}>Show Both Points</Text>
              </TouchableOpacity>
            )}
            
            {/* Debug Info */}
            {routeCoordinates.length > 0 && (
              <Text style={styles.debugText}>
                Route Points: {routeCoordinates.length} | Start: {startPoint?.latitude.toFixed(4)}, {startPoint?.longitude.toFixed(4)} | End: {endPoint?.latitude.toFixed(4)}, {endPoint?.longitude.toFixed(4)}
              </Text>
            )}
          </>
        )}
      </View>
      
      {/* Floating Controls Button (when collapsed) */}
      {isControlsCollapsed && (
        <TouchableOpacity
          style={styles.floatingControlsButton}
          onPress={() => setIsControlsCollapsed(false)}
        >
          <Text style={styles.floatingButtonText}>⚙️</Text>
        </TouchableOpacity>
      )}

      {/* Route Information */}
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <TouchableOpacity
            style={styles.routeInfoHeader}
            onPress={() => setIsRouteInfoCollapsed(!isRouteInfoCollapsed)}
          >
            <Text style={styles.routeInfoTitle}>Route Information</Text>
            <Text style={styles.collapseIcon}>
              {isRouteInfoCollapsed ? '▼' : '▲'}
            </Text>
          </TouchableOpacity>
          
          {!isRouteInfoCollapsed && (
            <>
              <Text style={styles.routeInfoText}>Distance: {routeInfo.distance}</Text>
              <Text style={styles.routeInfoText}>Duration: {routeInfo.duration}</Text>
              
              <ScrollView style={styles.stepsContainer}>
                <Text style={styles.stepsTitle}>Turn-by-turn:</Text>
                {routeInfo.steps.map((step, index) => (
                  <Text key={index} style={styles.stepText}>
                    {index + 1}. {step}
                  </Text>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      )}
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
  controlsContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    maxHeight: 300,
  },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  controlsHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    backgroundColor: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 80,
  },
  primaryButton: {
    flex: 1,
    marginRight: 10,
  },
  secondaryButton: {
    backgroundColor: '#28a745',
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  routeInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    maxHeight: 200,
  },
  routeInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  collapseIcon: {
    fontSize: 20,
    color: '#666',
  },
  routeInfoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  stepsContainer: {
    maxHeight: 100,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  stepText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  predictionsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 5,
    maxHeight: 150,
    overflow: 'hidden',
  },
  predictionsList: {
    padding: 5,
  },
  predictionItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  predictionMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  predictionSecondaryText: {
    fontSize: 12,
    color: '#666',
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  floatingControlsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 20,
    color: 'white',
  },
});

export default RoutingComponent;
