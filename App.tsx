    /**
* Barcode Scanner POC using react-native-vision-camera
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BarcodeScanner from './BarcodeScanner';
import MapScreen from './MapScreen';
import RoutingComponent from './RoutingComponent';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<'scanner' | 'map' | 'routing'>('scanner');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'scanner':
        return <BarcodeScanner />;
      case 'map':
        return <MapScreen />;
      case 'routing':
        return <RoutingComponent />;
      default:
        return <BarcodeScanner />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Navigation Header */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity 
          style={[styles.navButton, currentScreen === 'scanner' && styles.activeNavButton]} 
          onPress={() => setCurrentScreen('scanner')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'scanner' && styles.activeNavButtonText]}>
            Scanner
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, currentScreen === 'map' && styles.activeNavButton]} 
          onPress={() => setCurrentScreen('map')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'map' && styles.activeNavButtonText]}>
            Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, currentScreen === 'routing' && styles.activeNavButton]} 
          onPress={() => setCurrentScreen('routing')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'routing' && styles.activeNavButtonText]}>
            Routing
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Content */}
      <View style={styles.container}>
        {renderScreen()}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigationHeader: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  activeNavButton: {
    backgroundColor: 'white',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activeNavButtonText: {
    color: '#007AFF',
  },
});

export default App;


