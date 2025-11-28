import { useProfile } from '@/app/context/ProfileProvider';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function Footer() {
  const { profilePhotoUrl } = useProfile();
  const pathname = usePathname();
  
  // Use profile photo if available, otherwise fallback to pravatar
  const avatarUrl = profilePhotoUrl || 'https://i.pravatar.cc/150?u=m';

  // Determine which route is active
  const isMainActive = pathname === '/home/main';
  const isUploadActive = pathname === '/home/upload-image';
  const isProfileActive = pathname === '/home/profile';

  return (
    <View style={styles.footer}>
      <Link href="/home/main" asChild>
        <TouchableOpacity style={[styles.iconButton, isMainActive && styles.activeButton]}>
          <View >
            <Ionicons name="home-outline" size={28} color="black" />
          </View>
        </TouchableOpacity>
      </Link>
      <Link href="/home/upload-image" asChild>
        <TouchableOpacity style={[styles.iconButton, isUploadActive && styles.activeButton]}>
          <View style={styles.plusIconContainer}>
            <Ionicons name="add-outline" size={26} color="black" />
          </View>
        </TouchableOpacity>
      </Link>
      <Link href="/home/profile" asChild>
        <TouchableOpacity style={[styles.iconButton, isProfileActive && styles.activeButton]}>
          <Image source={{ uri: avatarUrl }} style={styles.footerAvatar} />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 50,
    borderTopWidth: 0.5,
    borderTopColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#f0f0f0',
  },
 
  plusIconContainer: {
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 8,
    padding: 4,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#000',
  },
});
