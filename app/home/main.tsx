import { supabase } from '@/lib/supabase_client';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../context/AuthProvider';

interface Post {
  id: string;
  image_url: string;
  post_description: string;
  created_at: string;
  user_id: string;
  users: {
    username: string;
    profile_photo_url: string;
    bio: string;
  };
}

export default function Main() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [user])
  );

  const fetchPosts = async () => {
    try {
      if (!user) return;

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, image_url, post_description, created_at, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, profile_photo_url, bio')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setLoading(false);
        return;
      }

      const postsWithUser = postsData.map(post => ({
        ...post,
        users: userData
      }));

      setPosts(postsWithUser);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const toggleReadMore = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const renderDescription = (post: Post) => {
    const isExpanded = expandedPosts.has(post.id);
    const description = post.post_description || '';
    const maxLength = 100;
    const shouldTruncate = description.length > maxLength;

    if (!shouldTruncate) {
      return description;
    }

    if (isExpanded) {
      return (
        <>
          {description}{' '}
          <Text style={styles.readMore} onPress={() => toggleReadMore(post.id)}>
            Read less
          </Text>
        </>
      );
    }

    return (
      <>
        {description.substring(0, maxLength)}...{' '}
        <Text style={styles.readMore} onPress={() => toggleReadMore(post.id)}>
          Read more
        </Text>
      </>
    );
  };

  const handleMenuPress = (post: Post) => {
    setSelectedPost(post);
    setMenuVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedPost) return;

    setMenuVisible(false);

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', selectedPost.id);

              if (error) throw error;

              setPosts(prevPosts => prevPosts.filter(p => p.id !== selectedPost.id));
              setSelectedPost(null);
            } catch (error: any) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const handleUpdate = () => {
    if (!selectedPost) return;

    setMenuVisible(false);
    
    router.push({
      pathname: '/home/upload-image',
      params: {
        postId: selectedPost.id,
        imageUrl: selectedPost.image_url,
        description: selectedPost.post_description || '',
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3897f0" />
        </View>
        <Footer />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        {posts.map((post) => (
          <View key={post.id} style={styles.post}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <Image 
                  source={{ uri: post.users?.profile_photo_url || 'https://via.placeholder.com/32' }} 
                  style={styles.userAvatar} 
                />
                <View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.userName}>{post.users?.username || 'Unknown'}</Text>
                  </View>
                  <Text style={styles.location}>{post.users?.bio || ''}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleMenuPress(post)}>
                <Feather name="more-horizontal" size={20} color="black" />
              </TouchableOpacity>
            </View>

            <Image
              source={{ uri: post.image_url }}
              style={styles.postImage}
              resizeMode="cover"
            />

            <View style={styles.postInfo}>
              <Text style={styles.caption}>
                <Text style={styles.captionUser}>{post.users?.username || 'Unknown'}</Text>{' '}
                {renderDescription(post)}
              </Text>
              <Text style={styles.date}>{formatDate(post.created_at)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Footer />

      {/* Bottom Sheet Menu */}
      {menuVisible && (
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <TouchableOpacity style={styles.sheetItem} onPress={handleUpdate}>
              <Text style={styles.sheetText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={handleDelete}>
              <Text style={[styles.sheetText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={() => setMenuVisible(false)}>
              <Text style={styles.sheetText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
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
  post: {
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  userName: {
    fontWeight: '600',
    fontSize: 13,
  },
  location: {
    fontSize: 11,
    color: '#262626',
  },
  postImage: {
    width: 375,
    height: 375,
  },
  postInfo: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  caption: {
    lineHeight: 18,
    fontSize: 13,
  },
  captionUser: {
    fontWeight: '600',
  },
  readMore: {
    color: '#8e8e8e',
    fontWeight: '500',
  },
  date: {
    color: '#8e8e8e',
    fontSize: 11,
    marginTop: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 40,
  },
  sheetItem: {
    paddingVertical: 18,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  sheetText: {
    fontSize: 16,
    color: '#000',
  },
  deleteText: {
    color: '#ff3b30',
    fontWeight: '600',
  },
});
