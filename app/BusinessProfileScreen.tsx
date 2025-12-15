import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BusinessProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const handleBack = () => {
    router.back();
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Edit business profile');
  };

  const handleSettings = () => {
    // Navigate to settings
    router.push('/SettingsScreen');
  };

  const handleLogout = () => {
    // Navigate to login
    router.replace('/Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Profile</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.businessName}>Hair Studio Pro</Text>
          <Text style={styles.businessType}>Hair Salon & Barber Shop</Text>
          <Text style={styles.location}>📍 123 Main Street, City, State 12345</Text>
          <Text style={styles.phone}>📞 +1 (555) 123-4567</Text>
          <Text style={styles.email}>✉️ info@hairstudiopro.com</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1,250</Text>
            <Text style={styles.statLabel}>Total Clients</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Staff</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
              Services
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Us</Text>
              <Text style={styles.description}>
                Hair Studio Pro has been serving the community for over 10 years. 
                We specialize in modern haircuts, styling, and professional grooming services. 
                Our experienced team is dedicated to providing the best service and creating 
                the perfect look for every client.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Hours</Text>
              <View style={styles.hoursContainer}>
                <View style={styles.hoursRow}>
                  <Text style={styles.dayText}>Monday - Friday</Text>
                  <Text style={styles.timeText}>9:00 AM - 7:00 PM</Text>
                </View>
                <View style={styles.hoursRow}>
                  <Text style={styles.dayText}>Saturday</Text>
                  <Text style={styles.timeText}>9:00 AM - 6:00 PM</Text>
                </View>
                <View style={styles.hoursRow}>
                  <Text style={styles.dayText}>Sunday</Text>
                  <Text style={styles.timeText}>10:00 AM - 4:00 PM</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services Offered</Text>
              <View style={styles.servicesGrid}>
                <View style={styles.serviceItem}>
                  <Ionicons name="cut" size={24} color="#4CAF50" />
                  <Text style={styles.serviceText}>Haircuts</Text>
                </View>
                <View style={styles.serviceItem}>
                  <Ionicons name="sparkles" size={24} color="#FF9800" />
                  <Text style={styles.serviceText}>Styling</Text>
                </View>
                <View style={styles.serviceItem}>
                  <Ionicons name="leaf" size={24} color="#2196F3" />
                  <Text style={styles.serviceText}>Treatments</Text>
                </View>
                <View style={styles.serviceItem}>
                  <Ionicons name="color-palette" size={24} color="#9C27B0" />
                  <Text style={styles.serviceText}>Coloring</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.tabContent}>
            <View style={styles.serviceCard}>
              <Text style={styles.serviceName}>Men's Haircut</Text>
              <Text style={styles.servicePrice}>$25</Text>
              <Text style={styles.serviceDuration}>30 min</Text>
            </View>
            <View style={styles.serviceCard}>
              <Text style={styles.serviceName}>Women's Haircut</Text>
              <Text style={styles.servicePrice}>$35</Text>
              <Text style={styles.serviceDuration}>45 min</Text>
            </View>
            <View style={styles.serviceCard}>
              <Text style={styles.serviceName}>Beard Trim</Text>
              <Text style={styles.servicePrice}>$15</Text>
              <Text style={styles.serviceDuration}>20 min</Text>
            </View>
            <View style={styles.serviceCard}>
              <Text style={styles.serviceName}>Hair Styling</Text>
              <Text style={styles.servicePrice}>$20</Text>
              <Text style={styles.serviceDuration}>25 min</Text>
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>Sarah Johnson</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star" size={16} color="#FFD700" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>
                "Excellent service! The staff is professional and the haircut was perfect. 
                Highly recommend this salon."
              </Text>
              <Text style={styles.reviewDate}>2 days ago</Text>
            </View>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>Mike Davis</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star" size={16} color="#FFD700" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>
                "Great atmosphere and friendly staff. Will definitely come back!"
              </Text>
              <Text style={styles.reviewDate}>1 week ago</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  businessType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  hoursContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 14,
    color: '#000',
    marginTop: 8,
    fontWeight: '500',
  },
  serviceCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
  servicePrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginRight: 12,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  reviewCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
