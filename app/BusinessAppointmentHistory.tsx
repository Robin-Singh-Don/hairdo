import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image,
  Dimensions,
  Modal,
  Pressable,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BusinessAppointmentHistory() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('information');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleMenuPress = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMenuOption = (option: string) => {
    setShowDropdown(false);
    switch (option) {
      case 'Edit Information':
        // Navigate to Client Information screen with edit mode
        router.push('/ClientInformationScreen');
        break;
      case 'Client Information':
        // Navigate back to Client Information screen
        router.back();
        break;
      case 'Export':
        // Export functionality
        Alert.alert('Export', 'Exporting appointment history...');
        break;
      case 'Block Client':
        handleBlockClient();
        break;
    }
  };

  const handleBlockClient = () => {
    Alert.alert(
      'Block Client',
      'Are you sure you want to block this client?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Client has been blocked');
          }
        }
      ]
    );
  };

  // Sample data for appointments
  const upcomingAppointments = [
    {
      id: 1,
      clientName: 'Shark.11',
      phone: '+1 778 xxx-xxxx',
      service: 'Hair Cut',
      barber: 'Michel James',
      time: '2:30 PM',
      date: '11/11/2024',
      rating: 98,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    }
  ];

  const pastAppointments = [
    {
      id: 2,
      clientName: 'Abhay.07',
      specialty: 'Men\'s hair specialist',
      rating: 15,
      avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
      hasNotification: true
    },
    {
      id: 3,
      clientName: 'Hardik.12',
      specialty: 'Men\'s hair specialist',
      rating: 29,
      avatar: null, // No profile picture
      hasNotification: true
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointments History</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'information' && styles.activeTab]}
          onPress={() => setActiveTab('information')}
        >
          <Text style={[styles.tabText, activeTab === 'information' && styles.activeTabText]}>
            Information
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            Videos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setShowDropdown(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Edit Information')}>
              <Ionicons name="create-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
                         <View style={styles.menuDivider} />
             <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Client Information')}>
               <Ionicons name="information-circle-outline" size={20} color="#000" />
               <Text style={styles.menuText}>Information</Text>
             </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Export')}>
              <Ionicons name="download-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Export</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Block Client')}>
              <Ionicons name="ban-outline" size={20} color="red" />
              <Text style={styles.menuTextBlock}>Block</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current/Upcoming Appointment */}
        {upcomingAppointments.map((appointment) => (
          <View key={appointment.id} style={styles.currentAppointmentCard}>
            <View style={styles.appointmentLeft}>
              <Image 
                source={{ uri: appointment.avatar }} 
                style={styles.clientAvatar} 
              />
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{appointment.clientName}</Text>
                <Text style={styles.clientPhone}>{appointment.phone}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{appointment.rating}</Text>
                </View>
              </View>
            </View>
            <View style={styles.appointmentRight}>
              <Text style={styles.serviceText}>{appointment.service}</Text>
              <Text style={styles.barberText}>{appointment.barber}</Text>
              <Text style={styles.timeText}>Time {appointment.time}</Text>
              <Text style={styles.dateText}>Date {appointment.date}</Text>
            </View>
          </View>
        ))}

        {/* Upcoming Section */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Past Section */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.sectionTitle}>Past</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Past Appointments */}
        {pastAppointments.map((appointment) => (
          <View key={appointment.id} style={styles.pastAppointmentCard}>
            <View style={styles.pastAppointmentLeft}>
              {appointment.avatar ? (
                <Image 
                  source={{ uri: appointment.avatar }} 
                  style={styles.pastClientAvatar} 
                />
              ) : (
                <View style={styles.placeholderAvatar}>
                  <Ionicons name="person" size={24} color="#888888" />
                </View>
              )}
              <View style={styles.pastClientInfo}>
                <Text style={styles.pastClientName}>{appointment.clientName}</Text>
                <Text style={styles.pastClientSpecialty}>{appointment.specialty}</Text>
                <View style={styles.pastRatingContainer}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.pastRatingText}>{appointment.rating}</Text>
                </View>
              </View>
            </View>
            <View style={styles.pastAppointmentRight}>
              {appointment.hasNotification && (
                <Ionicons name="notifications" size={20} color="#888888" />
              )}
            </View>
          </View>
        ))}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,76,72,0.15)',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  tabText: {
    fontSize: 16,
    color: '#3c4c48',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  currentAppointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,76,72,0.15)',
  },
  appointmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#3c4c48',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 4,
    fontWeight: '500',
  },
  appointmentRight: {
    alignItems: 'flex-end',
  },
  serviceText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    marginBottom: 2,
  },
  barberText: {
    fontSize: 14,
    color: '#3c4c48',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#3c4c48',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#3c4c48',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(60,76,72,0.15)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 16,
  },
  pastAppointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(60,76,72,0.08)',
  },
  pastAppointmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pastClientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  placeholderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pastClientInfo: {
    flex: 1,
  },
  pastClientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  pastClientSpecialty: {
    fontSize: 14,
    color: '#3c4c48',
    marginBottom: 6,
  },
  pastRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pastRatingText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 4,
    fontWeight: '500',
  },
  pastAppointmentRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Menu Modal styles (matching ClientInformationScreen)
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  menuTextBlock: {
    fontSize: 16,
    color: 'red',
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
});
