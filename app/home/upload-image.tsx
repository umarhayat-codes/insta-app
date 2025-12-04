import { useAuth } from '@/app/context/AuthProvider';
import { supabase } from '@/lib/supabase_client';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UploadImage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  // Check if we're editing an existing post
  const isEditing = !!params.postId;
  const postId = params.postId as string;
  const existingImageUrl = params.imageUrl as string;
  const existingDescription = params.description as string;
  
  const [description, setDescription] = useState(existingDescription || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(existingImageUrl || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setDescription(existingDescription || '');
      setSelectedImage(existingImageUrl || null);
    }
  }, [isEditing, existingDescription, existingImageUrl]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to upload images');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = selectedImage;

      // Only upload new image if it's a local file (not a URL)
      if (!selectedImage.startsWith('http')) {
        const fileExt = selectedImage.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const response = await fetch(selectedImage);
        const arrayBuffer = await response.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, arrayBuffer, {
            contentType: `image/${fileExt}`,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      if (isEditing) {
        // Update existing post
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            image_url: imageUrl,
            post_description: description.trim() || null,
          })
          .eq('id', postId);

        if (updateError) throw updateError;

        Alert.alert('Success', 'Your post has been updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        // Create new post
        const { error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            image_url: imageUrl,
            post_description: description.trim() || null,
          });

        if (postError) throw postError;

        Alert.alert('Success', 'Your post has been uploaded successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setSelectedImage(null);
              setDescription('');
              router.back();
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} disabled={uploading}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Post' : 'Images'}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Upload Area */}
          <View style={[styles.uploadSection]}>
            <TouchableOpacity 
              style={styles.uploadArea} 
              onPress={pickImage}
              disabled={uploading}
            >
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
              ) : (
                <>
                  <View style={styles.uploadIconContainer}>
                    <Ionicons name="arrow-up" size={32} color="#000" />
                  </View>
                  <Text style={styles.uploadText}>Upload Image</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Post Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionLabel}>Post Description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add post description"
              placeholderTextColor="#c7c7c7"
              multiline
              value={description}
              onChangeText={setDescription}
              editable={!uploading}
            />
          </View>
        </ScrollView>

        {/* Upload Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.uploadButton,
              (!selectedImage || uploading) && styles.uploadButtonDisabled
            ]} 
            onPress={handleUpload}
            disabled={!selectedImage || uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadButtonText}>Upload</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
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
  placeholder: {
    width: 50,
  },
  uploadSection: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  uploadSectionWithImage: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  uploadArea: {
    height: 362,
    borderWidth: 2,
    borderColor: '#dbdbdb',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000',
  },
  uploadText: {
    fontSize: 16,
    color: '#262626',
    fontWeight: '500',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  descriptionSection: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#262626',
    backgroundColor: '#fafafa',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'android' ? 20 : 15,
    borderTopWidth: 0.5,
    borderTopColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  uploadButton: {
    backgroundColor: '#3897f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#a8d5f7',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
