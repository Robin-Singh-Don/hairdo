import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProfileServiceFactory, ProfileServiceInterface } from '../services/profile/ProfileService';

export interface ProfileData {
  profileImage: string;
  name: string;
  username: string;
  bio: string;
  email: string;
  phone: string;
  gender: string;
  birthday: string;
  location: string;
  preferences: string;
}

export interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
}

interface ProfileContextType {
  profileData: ProfileData | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<ProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  uploadProfileImage: (imageUri: string) => Promise<string>;
  resetProfile: () => void;
}

const defaultProfileData: ProfileData = {
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  name: 'Robin Singh',
  username: 'Robin.10',
  bio: 'Love trying new hairstyles and keeping up with the latest trends 💇‍♂️',
  email: 'robin@example.com',
  phone: '+1 (555) 123-4567',
  gender: 'Male',
  birthday: 'March 15, 1990',
  location: 'Vancouver, BC',
  preferences: 'Short cuts, fades, and modern styles',
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
  serviceType?: 'mock' | 'supabase';
  supabaseClient?: any;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ 
  children, 
  serviceType = 'mock',
  supabaseClient 
}) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize profile service
  const [profileService] = useState<ProfileServiceInterface>(() => 
    ProfileServiceFactory.create(serviceType, supabaseClient)
  );

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfileData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      // Fallback to default data
      setProfileData(defaultProfileData);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!profileData) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      const optimisticData = { ...profileData, ...updates };
      setProfileData(optimisticData);
      
      // Update on backend
      const updatedData = await profileService.updateProfile(updates);
      setProfileData(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      // Revert optimistic update
      await loadProfile();
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  const uploadProfileImage = async (imageUri: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      const imageUrl = await profileService.uploadProfileImage(imageUri);
      
      // Update profile with new image URL
      await updateProfile({ profileImage: imageUrl });
      
      return imageUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetProfile = () => {
    setProfileData(defaultProfileData);
    setError(null);
  };

  const value: ProfileContextType = {
    profileData,
    loading,
    error,
    updateProfile,
    refreshProfile,
    uploadProfileImage,
    resetProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export default ProfileContext;
