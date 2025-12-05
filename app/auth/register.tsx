import { signInWithGoogle } from '@/lib/googleAuth';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
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
import { supabase } from "../../lib/supabase_client";
import { useAuth } from '../context/AuthProvider';

const initialState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function register() {
  const [state, setState] = useState(initialState);
  const { user, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.replace('/home/main');
    }
  }, [user, loading]);

  const handleChange = (name: string, value: string) => {
    setState((s) => ({ ...s, [name]: value }));
  };

  const handleRegister = async () => {
    const { username, email, password, confirmPassword } = state;

    if (!username) return alert('Enter username');
    if (!email) return alert('Enter email');
    if (!password || password.length < 5)
      return alert('Password must be at least 5 characters');
    if (password !== confirmPassword) return alert('Passwords do not match');
    
    console.log('Registering user:', { username, email });
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, 
      password
    });
    
    if (authError) {
      console.log('Error registering user:', authError);
      alert(authError.message);
      return;
    }
    
    console.log('User Registered:', authData);
    const userId = authData.user?.id;
    
    if (userId) {
      // Insert user data into users table with the auth user ID
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, username: username.trim(), email: email.trim() }]);
      
      if (insertError) {
        console.log('Error inserting user:', insertError);
        alert(insertError.message);
        return;
      }
    }
    
    alert('User registered successfully! Please check your email to verify your account.');
    router.replace('/auth/login');
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        console.log('Google sign-up successful');
        router.replace('/home/main');
      } else if (result.cancelled) {
        console.log('Google sign-up cancelled');
      } else {
        Alert.alert('Sign Up Failed', result.error || 'Failed to sign up with Google');
      }
    } catch (error: any) {
      console.error('Google sign-up error:', error);
      Alert.alert('Error', error.message || 'An error occurred during Google sign-up');
    }
  };

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
            placeholder="Username"
            placeholderTextColor="#999"
            autoCapitalize="none"
            style={styles.input}
            value={state.username}
            onChangeText={(value) => handleChange('username', value)}
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

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            value={state.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
          />

          <TouchableOpacity style={styles.signUpBtn} onPress={handleRegister}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.googleContainer}>
            <Text style={styles.orText}>OR</Text>
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignUp}>
              <Text style={styles.googleText}>Sign Up with Google</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text onPress={() => router.navigate('/auth/login')} style={styles.loginText}>Log In.</Text>
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