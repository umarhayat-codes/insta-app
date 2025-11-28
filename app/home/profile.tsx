import { useAuth } from '@/app/context/AuthProvider';
import { useProfile } from '@/app/context/ProfileProvider';
import { supabase } from '@/lib/supabase_client';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Footer from '../../components/Footer';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = width / COLUMN_COUNT;

interface Post {
  id: string;
  image_url: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { profilePhotoUrl, username, bio } = useProfile();
  
  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, image_url')
        .eq('user_id', user.id)
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Feather name="lock" size={14} color="black" style={styles.lockIcon} />
          <Text style={styles.username}>{username || 'Loading...'}</Text>
          <Feather name="chevron-down" size={14} color="black" />
        </View>
        <TouchableOpacity style={styles.menuButton}>
           <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
               <Image 
                 source={{ 
                   uri: profilePhotoUrl || 'https://i.pravatar.cc/150?u=jacob_w' 
                 }} 
                 style={styles.avatar} 
               />
            </View>
          </View>
          
          <Text style={styles.fullName}>{username || 'User'}</Text>
          <Text style={styles.bio}>
            {bio || 'Digital goodies designer @pixsellz\nEverything is designed.'}
          </Text>

          <Link href="/home/edit-profile" asChild>
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </Link>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    marginRight: 4,
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
    marginRight: 4,
  },
  menuButton: {
    position: 'absolute',
    right: 15,
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
  link: {
    color: '#00376b',
  },
  editProfileButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editProfileText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#262626',
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
