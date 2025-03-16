import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { getTheme } from './app/theme';
import AppNavigator from './app/navigation/AppNavigator';
import { AppProvider, useApp } from './app/contexts/AppContext';
import * as StorageService from './app/services/storageService';

// Wrapper for using the theme from our context
const AppContent = () => {
  const { theme } = useApp();
  const appTheme = getTheme(theme);
  
  return (
    <>
      <PaperProvider theme={appTheme}>
        <AppNavigator />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </PaperProvider>
    </>
  );
};

export default function App() {
  const [userId, setUserId] = useState<string>('demo-user'); // For demo purposes
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUserId = await StorageService.getCurrentUserId();
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          // For demo purposes, create a demo user
          await StorageService.saveCurrentUser('demo-user');
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  if (isLoading) {
    return null; // Or a splash screen
  }

  return (
    <SafeAreaProvider>
      <AppProvider userId={userId}>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
