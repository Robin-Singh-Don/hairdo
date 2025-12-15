import { ProfileData } from '../../contexts/ProfileContext';

// Interface for backend profile operations
export interface ProfileServiceInterface {
  getProfile(userId?: string): Promise<ProfileData>;
  updateProfile(profileData: Partial<ProfileData>, userId?: string): Promise<CurrentProfileData>;
  uploadProfileImage(imageUri: string, userId?: string): Promise<string>;
  deleteProfile(userId?: string): Promise<void>;
}

// Default profile data structure
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

// Mock Profile Service (for development/testing)
export class MockProfileService implements ProfileServiceInterface {
  private profiles: Map<string, ProfileData> = new Map();

  constructor() {
    // Initialize with default profile
    this.profiles.set('default', defaultProfileData);
  }

  async getProfile(userId: string = 'default'): Promise<ProfileData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const profile = this.profiles.get(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    return { ...profile };
  }

  async updateProfile(profileData: Partial<ProfileData>, userId: string = 'default'): Promise<ProfileData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const currentProfile = this.profiles.get(userId) || defaultProfileData;
    const updatedProfile = { ...currentProfile, ...profileData };
    
    this.profiles.set(userId, updatedProfile);
    return { ...updatedProfile };
  }

  async uploadProfileImage(imageUri: string, userId: string = 'default'): Promise<string> {
    // Simulate image upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, this would upload to Supabase Storage
    return imageUri; // For now, return the same URI
  }

  async deleteProfile(userId: string = 'default'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.profiles.delete(userId);
  }
}

// Supabase Profile Service (for production)
export class SupabaseProfileService implements ProfileServiceInterface {
  private supabase: any; // Replace with actual Supabase client type

  constructor(supabaseClient: any) {
    if (!supabaseClient) {
      throw new Error('Supabase client is required for SupabaseProfileService');
    }
    this.supabase = supabaseClient;
  }

  async getProfile(userId?: string): Promise<ProfileData> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId || 'current_user_id')
        .single();

      if (error) throw error;
      
      return {
        profileImage: data.profile_image || defaultProfileData.profileImage,
        name: data.full_name || defaultProfileData.name,
        username: data.username || defaultProfileData.username,
        bio: data.bio || defaultProfileData.bio,
        email: data.email || defaultProfileData.email,
        phone: data.phone || defaultProfileData.phone,
        gender: data.gender || defaultProfileData.gender,
        birthday: data.birthday || defaultProfileData.birthday,
        location: data.location || defaultProfileData.location,
        preferences: data.preferences || defaultProfileData.preferences,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return defaultProfileData;
    }
  }

  async updateProfile(profileData: Partial<ProfileData>, userId?: string): Promise<ProfileData> {
    try {
      const updateData = {
        profile_image: profileData.profileImage,
        full_name: profileData.name,
        username: profileData.username,
        bio: profileData.bio,
        email: profileData.email,
        phone: profileData.phone,
        gender: profileData.gender,
        birthday: profileData.birthday,
        location: profileData.location,
        preferences: profileData.preferences,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId || 'current_user_id')
        .select()
        .single();

      if (error) throw error;

      return {
        profileImage: data.profile_image,
        name: data.full_name,
        username: data.username,
        bio: data.bio,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        birthday: data.birthday,
        location: data.location,
        preferences: data.preferences,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async uploadProfileImage(imageUri: string, userId?: string): Promise<string> {
    try {
      // Upload to Supabase Storage
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId || 'current_user'}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await this.supabase.storage
        .from('profile-images')
        .upload(fileName, {
          uri: imageUri,
          type: 'image/jpeg',
          name: fileName,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteProfile(userId?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId || 'current_user_id');

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
}

// Profile Service Factory
export class ProfileServiceFactory {
  static create(serviceType: 'mock' | 'supabase', supabaseClient?: any): ProfileServiceInterface {
    switch (serviceType) {
      case 'mock':
        return new MockProfileService();
      case 'supabase':
        if (!supabaseClient) {
          console.warn('Supabase client not available. Falling back to mock service.');
          return new MockProfileService();
        }
        return new SupabaseProfileService(supabaseClient);
      default:
        throw new Error(`Unknown service type: ${serviceType}`);
    }
  }
}

export default ProfileServiceFactory;
