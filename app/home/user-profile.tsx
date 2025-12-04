import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase_client';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = width / COLUMN_COUNT;

interface Post {
  id: string;
  image_url: string;
}

interface UserProfile {
  username: string;
  profile_photo_url: string;
  bio: string;
}

export default function UserProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId as string;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, profile_photo_url, bio')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, image_url')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Post }) => (
    <Image source={{ uri: item.image_url }} style={styles.gridImage} />
  );

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3897f0" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="camera-outline" size={60} color="#dbdbdb" />
        <Text style={styles.emptyText}>No Posts Yet</Text>
      </View>
    );
  };

  if (loading || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerUsername}>{userProfile?.username || 'Loading...'}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3897f0" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerUsername}>{userProfile.username}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <Image
                source={{
                  uri: userProfile.profile_photo_url || 'https://i.pravatar.cc/150?u=default'
                }}
                style={styles.avatar}
              />
            </View>
          </View>

          <Text style={styles.fullName}>{userProfile.username}</Text>
          <Text style={styles.bio}>
            {userProfile.bio || 'No bio available'}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <View style={[styles.tab, styles.activeTab]}>
            <Ionicons name="grid-outline" size={24} color="black" />
          </View>
        </View>

        {/* Grid */}
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={renderEmptyComponent}
        />
      </View>
      <Footer />
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
  backButton: {
    width: 40,
  },
  headerUsername: {
    fontWeight: '600',
    fontSize: 16,
    color: '#262626',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileInfo: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  fullName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#262626',
  },
  bio: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#262626',
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#dbdbdb',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  gridContainer: {
    paddingBottom: 2,
    flexGrow: 1,
  },
  gridImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
});
