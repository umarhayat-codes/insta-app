import { useAuth } from '@/app/context/AuthProvider';
import { useProfile } from '@/app/context/ProfileProvider';
import { supabase } from '@/lib/supabase_client';
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function EditProfile() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { updateProfilePhoto, refreshProfile } = useProfile();

  // Form state
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username || '');
        setWebsite(data.website || '');
        setBio(data.bio || '');
        setEmail(data.email || user.email || '');
        setPhone(data.phone || '');
        setGender(data.gender || '');
        setProfilePhotoUrl(data.profile_photo_url || '');
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change your photo!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      aspect: [1, 1],
      allowsEditing: true,
    });

    if (!result.canceled && user) {
      setUploadingPhoto(true);
      try {
        const selectedImage = result.assets[0].uri;
        const fileExt = selectedImage.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/profile.${fileExt}`;

        // Read file as ArrayBuffer
        const response = await fetch(selectedImage);
        const arrayBuffer = await response.arrayBuffer();

        // Upload to Supabase Storage with upsert
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, arrayBuffer, {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public URL (add timestamp to force refresh)
        const timestamp = new Date().getTime();
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);
        
        const publicUrlWithTimestamp = `${publicUrl}?t=${timestamp}`;

        // Update profile photo URL in database
        const { error: updateError } = await supabase
          .from('users')
          .update({ profile_photo_url: publicUrlWithTimestamp })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setProfilePhotoUrl(publicUrlWithTimestamp);
        // Update global profile context
        updateProfilePhoto(publicUrlWithTimestamp);
        Alert.alert('Success', 'Profile photo updated successfully!');
      } catch (error: any) {
        console.error('Error uploading photo:', error);
        Alert.alert('Upload Failed', error.message || 'Failed to upload photo');
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleDone = async () => {
    // Validate all fields
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Please enter your username');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return;
    }
    if (!gender) {
      Alert.alert('Validation Error', 'Please select your gender');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: username.trim(),
          website: website.trim() || null,
          bio: bio.trim() || null,
          phone: phone.trim(),
          gender: gender.trim().toLowerCase(), // Convert to lowercase to match constraint
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh global profile context
      await refreshProfile();

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Update Failed', error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/login');
            } catch (error: any) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3897f0" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} disabled={updating}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleDone} disabled={updating}>
            {updating ? (
              <ActivityIndicator size="small" color="#3897f0" />
            ) : (
              <Text style={styles.doneButton}>Done</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            {uploadingPhoto ? (
              <View style={styles.profilePhotoLoading}>
                <ActivityIndicator size="large" color="#3897f0" />
              </View>
            ) : (
              <Image
                source={{
                  uri: profilePhotoUrl || 'https://i.pravatar.cc/150?u=jacob_w',
                }}
                style={styles.profilePhoto}
              />
            )}
            <TouchableOpacity onPress={handleChangePhoto} disabled={uploadingPhoto || updating}>
              <Text style={styles.changePhotoText}>Change Profile Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor="#c7c7c7"
                editable={!updating}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="Website"
                placeholderTextColor="#c7c7c7"
                editable={!updating}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.bioFieldRow}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Digital goodies designer @pixsellz Everything is designed."
                placeholderTextColor="#c7c7c7"
                multiline
                editable={!updating}
              />
            </View>
          </View>

          {/* Private Information */}
          <View>
            <Text style={styles.privateSectionTitle}>Private Information</Text>

            <View style={styles.fieldRow}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                placeholder="Email"
                placeholderTextColor="#c7c7c7"
                keyboardType="email-address"
                editable={false}
              />
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 202 555 0147"
                placeholderTextColor="#c7c7c7"
                keyboardType="phone-pad"
                editable={!updating}
              />
            </View>

            {/* Gender */}
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Gender</Text>
              <TextInput
                style={styles.input}
                value={gender}
                onChangeText={setGender}
                placeholder="Gender"
                placeholderTextColor="#c7c7c7"
                editable={!updating}
              />
            </View>
          </View>

          {/* Reset Password */}
          <View style={styles.resetSection}>
            <Text style={styles.resetText}>
              Want to change your password?{' '}
              <Link href="/home/forgot-password" style={styles.resetLink}>
                Reset Password
              </Link>
            </Text>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
              disabled={updating}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
    backgroundColor: '#FAFAFA',
  },
  cancelButton: {
    fontSize: 16,
    color: '#262626',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3897f0',
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profilePhotoLoading: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#3897f0',
    fontWeight: '500',
  },
  formSection: {
    paddingTop: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
    width: 375,
    height: 48,
    alignSelf: 'center',
  },
  bioFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
    width: 375,
    height: 64,
    alignSelf: 'center',
  },
  label: {
    width: 90,
    fontSize: 14,
    color: '#262626',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#262626',
    height: 48,
  },
  disabledInput: {
    color: '#999',
  },
  bioInput: {
    minHeight: 64,
    height: 64,
    textAlignVertical: 'top',
  },
  privateSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#262626',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: 375,
    alignSelf: 'center',
  },
  resetSection: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 12,
    color: '#999',
  },
  resetLink: {
    color: '#3897f0',
    fontWeight: '500',
  },
  logoutSection: {
    paddingHorizontal: 15,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#ff3b30',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
