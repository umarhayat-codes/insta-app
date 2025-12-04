import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://yeezltspqrubrpvgnuie.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZXpsdHNwcXJ1YnJwdmdudWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDI0MzcsImV4cCI6MjA3ODUxODQzN30.vlHGQOCECfCSFBlmuTJ70o1__O3-STsxJ25swa753_I'

console.log('SUPABASE_URL', SUPABASE_URL)
console.log('SUPABASE_ANON_KEY', SUPABASE_ANON_KEY)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Automatically persists session in AsyncStorage
    storage: AsyncStorage, // React Native storage
    autoRefreshToken: true, // Refresh access token automatically
  },
});

