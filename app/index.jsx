import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from './context/AuthProvider';

// Keep the native splash screen visible while we check auth
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set a timer for 5 seconds
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only navigate and hide splash after timer completes and auth check is done
    if (isReady && !loading) {
      // Hide the native splash screen
      SplashScreen.hideAsync();
      
      // Navigate based on auth state
      if (user) {
        router.replace('/home/main');
      } else {
        router.replace('/auth/register');
      }
    }
  }, [isReady, user, loading]);

  // Return empty view while splash is showing
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
