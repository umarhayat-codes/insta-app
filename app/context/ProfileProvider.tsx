import { supabase } from '@/lib/supabase_client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

interface ProfileContextType {
  profilePhotoUrl: string;
  username: string;
  bio: string;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfilePhoto: (url: string) => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profilePhotoUrl: '',
  username: '',
  bio: '',
  loading: true,
  refreshProfile: async () => {},
  updateProfilePhoto: () => {},
});

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      // Reset profile data when user logs out
      setProfilePhotoUrl('');
      setUsername('');
      setBio('');
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, bio, profile_photo_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username || '');
        setBio(data.bio || '');
        setProfilePhotoUrl(data.profile_photo_url || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    await fetchProfile();
  };

  const updateProfilePhoto = (url: string) => {
    setProfilePhotoUrl(url);
  };

  return (
    <ProfileContext.Provider
      value={{
        profilePhotoUrl,
        username,
        bio,
        loading,
        refreshProfile,
        updateProfilePhoto,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
