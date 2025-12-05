import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import { supabase } from './supabase_client';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with Google using Supabase OAuth
 * @returns Promise with user data or error
 */
export async function signInWithGoogle() {
  try {
    // Create redirect URI for OAuth callback
    const redirectUrl = makeRedirectUri({
      scheme: 'myinstaapp',
      path: 'auth/callback'
    });

    console.log('Redirect URL:', redirectUrl);

    // Initiate OAuth flow with Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true, // We'll handle the browser ourselves
      }
    });

    if (error) {
      console.error('Supabase OAuth error:', error);
      throw error;
    }

    if (!data?.url) {
      throw new Error('No OAuth URL returned from Supabase');
    }

    console.log('Opening OAuth URL:', data.url);

    // Open browser for Google OAuth
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    );

    console.log('Browser result:', result);

    if (result.type === 'success') {
      const { url } = result;
      
      console.log('Callback URL:', url);
      
      // Supabase returns tokens in the URL hash, not query params
      // Extract hash fragment (everything after #)
      const hashIndex = url.indexOf('#');
      if (hashIndex === -1) {
        throw new Error('No hash fragment found in callback URL');
      }
      
      const hashFragment = url.substring(hashIndex + 1);
      console.log('Hash fragment:', hashFragment);
      
      // Parse hash fragment as query string
      const params = new URLSearchParams(hashFragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      console.log('Access token found:', !!accessToken);
      console.log('Refresh token found:', !!refreshToken);

      if (accessToken && refreshToken) {
        // Set the session with the tokens
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        console.log('Session set successfully:', sessionData);

        // Check if user profile exists, if not create one
        if (sessionData.user) {
          await ensureUserProfile(sessionData.user);
        }

        return { success: true, user: sessionData.user };
      } else {
        throw new Error('No tokens found in callback URL');
      }
    } else if (result.type === 'cancel') {
      return { success: false, cancelled: true };
    } else {
      throw new Error('OAuth flow failed');
    }
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    Alert.alert('Authentication Error', error.message || 'Failed to sign in with Google');
    return { success: false, error: error.message };
  }
}

/**
 * Ensure user profile exists in the users table
 * Creates profile if it doesn't exist
 */
async function ensureUserProfile(user: any) {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is expected for new users
      console.error('Error checking profile:', fetchError);
      return;
    }

    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          profile_photo_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          bio: '',
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        console.log('User profile created successfully');
      }
    } else {
      console.log('User profile already exists');
    }
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
  }
}
