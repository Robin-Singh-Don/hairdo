import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import BottomBar from '../components/BottomBar';

// Mock customer data
const userData = {
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  name: 'Robin Singh',
  username: 'robin.10',
  bio: 'Love trying new hairstyles and keeping up with the latest trends 💇‍♂️',
  email: 'robin@example.com',
  phone: '+1 (555) 123-4567',
  gender: 'Male',
  birthday: 'March 15, 1990',
  location: 'Vancouver, BC',
  preferences: 'Short cuts, fades, and modern styles',
};

const EditProfileScreen = () => {
  const [formData, setFormData] = useState(userData);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    // Here you would typically save the data to your backend
    Alert.alert('Success', 'Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(userData); // Reset to original data
    setIsEditing(false);
  };

  const updateField = (field: keyof typeof userData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderField = (label: string, field: keyof typeof userData, placeholder: string, multiline = false) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={[styles.textInput, multiline && styles.multilineInput]}
            value={formData[field]}
            onChangeText={(value) => updateField(field, value)}
            placeholder={placeholder}
            placeholderTextColor="#999"
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            editable={isEditing}
          />
        ) : (
          <Text style={styles.fieldValue}>{formData[field]}</Text>
        )}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.centeredContent}>
                         {/* Header */}
             <View style={styles.headerRow}>
                               <TouchableOpacity onPress={() => router.push('/ProfilePage11' as any)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
               <Text style={styles.headerTitle}>Edit Profile</Text>
               {isEditing ? (
                 <View style={styles.headerActions}>
                   <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                     <Text style={styles.cancelText}>Cancel</Text>
                   </TouchableOpacity>
                   <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                     <Text style={styles.saveText}>Done</Text>
                   </TouchableOpacity>
                 </View>
               ) : (
                 <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
                   <Text style={styles.editText}>Edit</Text>
                 </TouchableOpacity>
               )}
             </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Profile Picture Section */}
              <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                  <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
                  {isEditing && (
                    <TouchableOpacity style={styles.changePhotoBtn}>
                      <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

                             {/* Form Fields */}
               <View style={styles.formContainer}>
                 {renderField('Name', 'name', 'Enter your full name')}
                 {renderField('Username', 'username', 'Enter username')}
                 {renderField('Bio', 'bio', 'Tell us about your style preferences...', true)}
                 {renderField('Email', 'email', 'Enter your email')}
                 {renderField('Phone', 'phone', 'Enter your phone number')}
                 {renderField('Gender', 'gender', 'Enter your gender')}
                 {renderField('Birthday', 'birthday', 'Enter your birthday')}
                 {renderField('Location', 'location', 'Enter your city')}
                 {renderField('Style Preferences', 'preferences', 'What styles do you prefer?', true)}
               </View>

                             {/* Additional Options */}
               {isEditing && (
                 <View style={styles.optionsContainer}>
                   <TouchableOpacity style={styles.optionItem}>
                     <Text style={styles.optionText}>Booking Preferences</Text>
                     <Ionicons name="chevron-forward" size={20} color="#999" />
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.optionItem}>
                     <Text style={styles.optionText}>Notification Settings</Text>
                     <Ionicons name="chevron-forward" size={20} color="#999" />
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.optionItem}>
                     <Text style={styles.optionText}>Payment Methods</Text>
                     <Ionicons name="chevron-forward" size={20} color="#999" />
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.optionItem}>
                     <Text style={styles.optionText}>Privacy and Security</Text>
                     <Ionicons name="chevron-forward" size={20} color="#999" />
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.optionItem}>
                     <Text style={styles.optionText}>Account Settings</Text>
                     <Ionicons name="chevron-forward" size={20} color="#999" />
                   </TouchableOpacity>
                 </View>
               )}
            </ScrollView>
          </View>
        </View>
        
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  centeredContent: {
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelBtn: {
    marginRight: 16,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  saveBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  editBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  changePhotoBtn: {
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    width: 120,
  },
  fieldValue: {
    fontSize: 16,
    color: '#666',
    marginLeft: 20,
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginLeft: 20,
    flex: 1,
    borderBottomWidth: 0,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
});

export default EditProfileScreen; 