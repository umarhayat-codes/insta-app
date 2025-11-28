import { supabase } from '@/lib/supabase_client';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useAuth } from '../context/AuthProvider';

const initialState = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
};

export default function ForgotPassword() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleChange = (name, value) => {
    setState((s) => ({ ...s, [name]: value }));
  };

  const handlePasswordChange = async () => {
    const { oldPassword, newPassword, confirmPassword } = state;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Please enter all fields');
    }
    if (newPassword.length < 5) {
      return Alert.alert('Error', 'Password must be at least 5 characters');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'New password and confirm password do not match');
    }

    if (!user?.email) {
      return Alert.alert('Error', 'User email not found. Please login again.');
    }

    setLoading(true);

    try {
      // Step 1: Reauthenticate user with old password to verify it's correct
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword
      });

      if (authError) {
        setLoading(false);
        return Alert.alert('Error', 'Old password is incorrect');
      }

      // Step 2: If reauthentication succeeds, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setLoading(false);
        return Alert.alert('Error', updateError.message);
      }

      // Step 3: Success - clear form and redirect
      setLoading(false);
      setState(initialState);
      Alert.alert(
        'Success',
        'Password updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Password change error:', error);
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
          
          <Text style={styles.title}>Change Password</Text>
          
          <TextInput
            placeholder="Old Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            value={state.oldPassword}
            onChangeText={(value) => handleChange('oldPassword', value)}
            editable={!loading}
          />

          <TextInput
            placeholder="New Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            value={state.newPassword}
            onChangeText={(value) => handleChange('newPassword', value)}
            editable={!loading}
          />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            value={state.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            editable={!loading}
          />

          <TouchableOpacity 
            style={[styles.signUpBtn, loading && styles.signUpBtnDisabled]} 
            onPress={handlePasswordChange}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpText}>Change Password</Text>
            )}
          </TouchableOpacity>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 20,
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
  signUpBtnDisabled: {
    backgroundColor: '#9DCEFF',
  },
  signUpText: {
    color: '#fff',
    fontWeight: '600',
  },
});

