import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { ownerAPI } from '../../services/api/ownerAPI';
import { supabaseClient } from '../../services/supabase/SupabaseConfig';
import { useCallback } from 'react';

interface ProfileSettings {
  // Post Settings
  showComments: boolean;
  allowPublicComments: boolean;
  hideLikes: boolean;
  hideFollowers: boolean;
  allowSharing: boolean;
  autoApproveComments: boolean;
}

export default function OwnerProfileEdit() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  
  // Profile Information
  const [profileData, setProfileData] = useState({
    name: '',
    handle: '',
    bio: '',
    email: '',
    phone: '',
    address: '',
  });

  // Post Settings
  const [postSettings, setPostSettings] = useState<ProfileSettings>({
    showComments: true,
    allowPublicComments: true,
    hideLikes: false,
    hideFollowers: false,
    allowSharing: true,
    autoApproveComments: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load profile data from Supabase
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user && supabaseClient) {
        // Try to load from Supabase first
        const { data: profileData, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && profileData) {
          setProfileData({
            name: profileData.full_name || profileData.name || user.displayName || '',
            handle: profileData.username ? `@${profileData.username}` : '',
            bio: profileData.bio || '',
            email: profileData.email || user.email || '',
            phone: profileData.phone || user.phone || '',
            address: profileData.location || '',
          });

          // Load post settings from preferences
          if (profileData.preferences) {
            try {
              const prefs = typeof profileData.preferences === 'string' 
                ? JSON.parse(profileData.preferences) 
                : profileData.preferences;
              if (prefs && prefs.postSettings) {
                setPostSettings(prefs.postSettings);
              }
            } catch (e) {
              console.error('Error parsing preferences:', e);
            }
          }
        } else {
          // Fallback to API (which should have updated mock data)
          const profile = await ownerAPI.getOwnerProfile();
          setProfileData({
            name: profile.name || '',
            handle: profile.handle || '',
            bio: profile.bio || '',
            email: user.email || '',
            phone: user.phone || '',
            address: '',
          });
        }
      } else {
        // Fallback to API if no Supabase
        const profile = await ownerAPI.getOwnerProfile();
        setProfileData({
          name: profile.name || '',
          handle: profile.handle || '',
          bio: profile.bio || '',
          email: user?.email || '',
          phone: user?.phone || '',
          address: '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Refresh when screen comes into focus (after navigating back)
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        loadProfile();
      }, 100);
      
      return () => clearTimeout(timer);
    }, [loadProfile])
  );

  // Save profile changes with Supabase backend
  const handleSave = async () => {
    try {
      setSaving(true);

      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Update owner profile in Supabase (name, handle, bio, and post settings together)
      if (supabaseClient) {
        try {
          // Save everything in one upsert operation
          const { error: profileError } = await supabaseClient
            .from('profiles')
            .upsert({
              user_id: user.id,
              username: profileData.handle.replace('@', ''),
              full_name: profileData.name,
              bio: profileData.bio,
              email: profileData.email,
              phone: profileData.phone,
              location: profileData.address,
              preferences: JSON.stringify({
                postSettings: postSettings
              }),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id'
            });

          if (profileError) {
            console.error('Supabase profile update error:', profileError);
            // If upsert fails, try separate update for preferences
            const { error: settingsError } = await supabaseClient
              .from('profiles')
              .update({
                preferences: JSON.stringify({
                  postSettings: postSettings
                }),
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user.id);
            
            if (settingsError) {
              console.error('Error saving post settings:', settingsError);
            }
          }
        } catch (supabaseError) {
          console.error('Supabase update error:', supabaseError);
        }
      }
      
      // Always update mock data as well for consistency
      await ownerAPI.updateOwnerProfile({
        name: profileData.name,
        handle: profileData.handle,
        bio: profileData.bio,
      });

      // Update user profile (email, phone, etc.) via AuthContext
      const updates: any = {};
      if (profileData.email && profileData.email !== user.email) {
        updates.email = profileData.email;
      }
      if (profileData.phone && profileData.phone !== user.phone) {
        updates.phone = profileData.phone;
      }
      if (profileData.name && profileData.name !== user.displayName) {
        updates.displayName = profileData.name;
      }

      if (Object.keys(updates).length > 0) {
        const result = await updateProfile(updates);
        if (!result.success) {
          console.warn('Some profile fields could not be updated:', result.error);
        }
      }

      // Small delay to ensure Supabase updates are committed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline: boolean = false,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  const renderToggle = (
    label: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.toggleContainer}>
      <View style={styles.toggleLeft}>
        <View style={styles.toggleIconContainer}>
          <Ionicons name={icon as any} size={20} color="#666" />
        </View>
        <View style={styles.toggleContent}>
          <Text style={styles.toggleLabel}>{label}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#10B981' }}
        thumbColor="#fff"
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.saveButton}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          {renderInputField(
            'Business Name',
            profileData.name,
            (text) => setProfileData({ ...profileData, name: text }),
            'Enter business name'
          )}

          {renderInputField(
            'Handle',
            profileData.handle,
            (text) => setProfileData({ ...profileData, handle: text }),
            '@your_handle'
          )}

          {renderInputField(
            'Bio',
            profileData.bio,
            (text) => setProfileData({ ...profileData, bio: text }),
            'Tell customers about your business...',
            true
          )}

          {renderInputField(
            'Email',
            profileData.email,
            (text) => setProfileData({ ...profileData, email: text }),
            'your@email.com',
            false,
            'email-address'
          )}

          {renderInputField(
            'Phone',
            profileData.phone,
            (text) => setProfileData({ ...profileData, phone: text }),
            '+1 (555) 123-4567',
            false,
            'phone-pad'
          )}

          {renderInputField(
            'Address',
            profileData.address,
            (text) => setProfileData({ ...profileData, address: text }),
            'Business address',
            true
          )}
        </View>

        {/* Post Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Post Settings</Text>
          <Text style={styles.sectionDescription}>
            Control how your posts appear and interact with customers
          </Text>

          {renderToggle(
            'Show Comments',
            'Allow customers to comment on your posts',
            postSettings.showComments,
            (value) => setPostSettings({ ...postSettings, showComments: value }),
            'chatbubble-outline'
          )}

          {renderToggle(
            'Public Comments',
            'Allow anyone to comment, not just followers',
            postSettings.allowPublicComments,
            (value) => setPostSettings({ ...postSettings, allowPublicComments: value }),
            'people-outline'
          )}

          {renderToggle(
            'Auto-Approve Comments',
            'Automatically approve all comments without moderation',
            postSettings.autoApproveComments,
            (value) => setPostSettings({ ...postSettings, autoApproveComments: value }),
            'checkmark-circle-outline'
          )}

          {renderToggle(
            'Hide Likes Count',
            'Hide the number of likes on your posts',
            postSettings.hideLikes,
            (value) => setPostSettings({ ...postSettings, hideLikes: value }),
            'heart-outline'
          )}

          {renderToggle(
            'Hide Followers Count',
            'Hide your total number of followers',
            postSettings.hideFollowers,
            (value) => setPostSettings({ ...postSettings, hideFollowers: value }),
            'people-outline'
          )}

          {renderToggle(
            'Allow Sharing',
            'Allow customers to share your posts',
            postSettings.allowSharing,
            (value) => setPostSettings({ ...postSettings, allowSharing: value }),
            'share-social-outline'
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  toggleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

