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

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      return Alert.alert('Error', 'Please enter your email address');
    }

    if (!validateEmail(email)) {
      return Alert.alert('Error', 'Please enter a valid email address');
    }

    setLoading(true);

    try {
      // First, check if the email exists in the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !userData) {
        setLoading(false);
        return Alert.alert('Error', 'No account found with this email address');
      }

      // Send OTP via Supabase Auth using password recovery
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase(),
        {
          redirectTo: 'myinstaapp://reset-password',
        }
      );

      if (error) {
        setLoading(false);
        return Alert.alert('Error', error.message);
      }

      setLoading(false);
      setStep('verify');
      Alert.alert(
        'OTP Sent',
        'A 6-digit verification code has been sent to your email. Please check your inbox and spam folder.'
      );
    } catch (error: any) {
      setLoading(false);
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      return Alert.alert('Error', 'Please fill in all fields');
    }

    if (otp.length !== 6) {
      return Alert.alert('Error', 'OTP must be 6 digits');
    }

    if (newPassword.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }

    setLoading(true);

    try {
      // Verify OTP token for password recovery
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.toLowerCase(),
        token: otp,
        type: 'recovery'
      });

      if (verifyError) {
        setLoading(false);
        return Alert.alert('Error', 'Invalid or expired OTP. Please try again.');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setLoading(false);
        return Alert.alert('Error', updateError.message);
      }

      // Sign out immediately
      await supabase.auth.signOut();
      
      setLoading(false);
      
      // Navigate to login FIRST (before showing alert)
      router.replace({
        pathname: '/auth/login',
        params: { fromReset: 'true' }
      });
      
      // Show success alert AFTER navigation (on login screen)
      setTimeout(() => {
        Alert.alert(
          'Success',
          'Your password has been reset successfully! Please login with your new password.'
        );
      }, 500);
    } catch (error: any) {
      setLoading(false);
      console.error('Reset password error:', error);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
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
          
          <Text style={styles.title}>
            {step === 'email' ? 'Forgot Password' : 'Reset Password'}
          </Text>
          
          {step === 'email' ? (
            <>
              <Text style={styles.description}>
                Enter your email address and we'll send you a verification code to reset your password.
              </Text>
              
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#999"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.description}>
                Enter the 6-digit code sent to {email} and your new password.
              </Text>
              
              <TextInput
                placeholder="6-Digit OTP"
                placeholderTextColor="#999"
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />

              <TextInput
                placeholder="New Password"
                placeholderTextColor="#999"
                secureTextEntry
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!loading}
              />

              <TextInput
                placeholder="Confirm New Password"
                placeholderTextColor="#999"
                secureTextEntry
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackToEmail}
                disabled={loading}
              >
                <Text style={styles.backButtonText}>Back to Email</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleSendOTP}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
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
  button: {
    width: '100%',
    backgroundColor: '#3797EF',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9DCEFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: '#3797EF',
    fontSize: 14,
  },
  resendButton: {
    marginTop: 10,
  },
  resendButtonText: {
    color: '#737373',
    fontSize: 14,
  },
});
