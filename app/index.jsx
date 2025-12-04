import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './context/AuthProvider';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, go to home
        router.replace('/home/main');
      } else {
        // User is not authenticated, go to register
        router.replace('/auth/register');
      }
    }
  }, [user, loading]);

  // Show loading while checking auth state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3797EF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
