import { supabase } from '@/lib/supabase_client';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthProvider';

const initialState = {
  email: '',
  password: ''
};

export default function login() {
  const [state, setState] = useState(initialState);
  const { user, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.replace('/home/main');
    }
  }, [user, loading]);

  const handleChange = (name, value) => {
    setState((s) => ({ ...s, [name]: value }));
  };

  const handleLogin = async () => {
    const { email, password } = state;

    if (!email) return alert('Enter email');
    if (!password || password.length < 5)
      return alert('Password must be at least 5 characters');
    
    const {data,error} = await supabase.auth.signInWithPassword({email,password})
    if (!error) {
      console.log('data Login', data)
      router.replace('/home/main')
    }
    else {
      console.log('error', error)
      alert(error.message)
    }
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3797EF" />
      </View>
    );
  }

  // Don't render login form if user is authenticated
  if (user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.formContainer}>
          <Image 
            source={require('../../assets/images/instagram_logo.png')} 
            style={styles.logo}
          />
          
          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={state.email}
            onChangeText={(value) => handleChange('email', value)}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            value={state.password}
            onChangeText={(value) => handleChange('password', value)}
          />

          <TouchableOpacity style={styles.signUpBtn} onPress={handleLogin}>
            <Text style={styles.signUpText}>Login In</Text>
          </TouchableOpacity>

          <View style={styles.googleContainer}>
            <TouchableOpacity style={styles.googleBtn}>
              <Image style={{width: 20, height: 25, marginRight: 10}} source={require('../../assets/images/google_icon.png')} />
              <Text style={styles.googleText}>Login with Google</Text>
            </TouchableOpacity>
            <Text style={styles.orText}>OR</Text>
          </View>

          <Text style={styles.footerText}>
            Don't have an account{' '}
            <Text style={styles.loginText} onPress={() => router.navigate('/auth/register')}>Sign Up.</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 30,
    resizeMode: 'contain',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#fafafa',
  },
  signUpBtn: {
    width: '100%',
    backgroundColor: '#3797EF',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 12,
  },
  signUpText: {
    color: '#fff',
    fontWeight: '600',
  },
  googleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  googleText: {
    color: '#000',
    fontWeight: '600',
  },
  orText: {
    color: '#999',
    marginVertical: 5,
  },
  footerText: {
    marginTop: 30,
    color: '#999',
  },
  loginText: {
    color: '#3797EF',
    fontWeight: '600',
  },
});