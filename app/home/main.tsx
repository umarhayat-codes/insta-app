import { supabase } from '@/lib/supabase_client';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [user])
  );

  const fetchPosts = async () => {
    try {
      if (!user) return;

      // Fetch all posts from all users
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, image_url, post_description, created_at, user_id')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        setLoading(false);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs from posts
      const userIds = [...new Set(postsData.map(post => post.user_id))];

      // Fetch user data for all users who have posts
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, profile_photo_url, bio')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        setLoading(false);
        return;
      }

      // Create a map of users by ID for quick lookup
      const usersMap = new Map(usersData?.map(user => [user.id, user]) || []);

      // Map posts with their corresponding user data
      const postsWithUsers = postsData.map(post => ({
        ...post,
        users: usersMap.get(post.user_id) || {
          username: 'Unknown',
          profile_photo_url: 'https://via.placeholder.com/32',
          bio: ''
        }
      }));

      setPosts(postsWithUsers);
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

  const handleMenuPress = (post: Post, event: any) => {
    // Get the position of the three-dot button
    event.currentTarget.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setMenuPosition({ x: pageX - 120, y: pageY + height + 5 }); // Position below button, aligned to right
      setSelectedPost(post);
      setMenuVisible(true);
    });
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

  const handleViewProfile = () => {
    if (!selectedPost) return;
    
    setMenuVisible(false);
    router.push({
      pathname: '/home/user-profile',
      params: { userId: selectedPost.user_id }
    });
  };

  const isOwnPost = selectedPost?.user_id === user?.id;

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
                <TouchableOpacity 
                  onPress={() => router.push({
                    pathname: '/home/user-profile',
                    params: { userId: post.user_id }
                  })}
                >
                  <Image 
                    source={{ uri: post.users?.profile_photo_url || 'https://i.pravatar.cc/150?u=jacob_w' }} 
                    style={styles.userAvatar} 
                  />
                </TouchableOpacity>
                <View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.userName}>{post.users?.username || 'Unknown'}</Text>
                  </View>
                  <Text style={styles.location}>{post.users?.bio || 'Tokyo, Japan'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={(event) => handleMenuPress(post, event)}>
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

      {/* Dropdown Context Menu */}
      {menuVisible && (
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.dropdownMenu, { top: menuPosition.y, left: menuPosition.x }]}>
            {isOwnPost ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleUpdate}>
                  <Feather name="edit-2" size={16} color="#262626" />
                  <Text style={styles.menuText}>Edit Post</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                  <Feather name="trash-2" size={16} color="#ed4956" />
                  <Text style={[styles.menuText, styles.deleteText]}>Delete Post</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={handleViewProfile}>
                <Feather name="user" size={16} color="#262626" />
                <Text style={styles.menuText}>View Profile</Text>
              </TouchableOpacity>
            )}
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
    fontFamily:'Roboto',
    fontWeight: '600',
    fontSize: 13,
  },
  location: {
    fontFamily:'Roboto',
    fontSize: 11,
    color: '#262626',
  },
  postImage: {
    width: 375,
    height: 375,
    borderColor:'#c0bebeff',
    borderWidth:1
  },
  postInfo: {
    paddingHorizontal: 15,
    paddingTop: 24
  },
  caption: {
    lineHeight: 18,
    fontSize: 13
  },
  captionUser: {
    fontWeight: '600'
  },
  readMore: {
    color: '#8e8e8e',
    fontWeight: '500',
  },
  date: {
    color: '#8e8e8e',
    fontSize: 11,
    marginTop: 13,
    marginBottom:15
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    color: '#262626',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#efefef',
    marginVertical: 4,
  },
  deleteText: {
    color: '#ed4956',
  },
});
