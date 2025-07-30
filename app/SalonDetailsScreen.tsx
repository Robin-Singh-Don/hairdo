 import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomBar from '../components/BottomBar';
import { useLocalSearchParams, useRouter } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SalonDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const name = params.name as string || "Man's cave Salon";
  const image = params.image as string | undefined;
  const address = params.city ? `${params.city}` : '9785, 132St';
  const staffCount = params.staffCount ? parseInt(params.staffCount as string, 10) : 4;
  // You can add more params as needed

  // Generate sample staff data
  const sampleStaffNames = [
    'Shark.11', 'Alex B.', 'Jamie S.', 'Taylor R.', 'Jordan P.', 'Morgan K.', 'Chris D.', 'Sam T.'
  ];
  const sampleStaffPhotos = [
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=center',
  ];
  const staff = Array.from({ length: staffCount }).map((_, i) => ({
    id: (i + 1).toString(),
    name: sampleStaffNames[i % sampleStaffNames.length],
    role: "+ Men's hair Salon",
    status: 'Available',
    rating: `${90 + (i % 10)}%`,
    photo: { uri: sampleStaffPhotos[i % sampleStaffPhotos.length] },
    tag: `${3 + i} Pendings, ${1 + i}h ${35 - i * 2} min`,
    locked: i % 2 === 1,
  }));

  // Store posts (gallery) sample data
  const storePosts = [
    { id: '1', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', label: 'Modern Fade' },
    { id: '2', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', label: 'Classic Cut' },
    { id: '3', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', label: 'Beard Trim' },
    { id: '4', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80', label: 'Kids Style' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navBarWrapper}>
        <View style={styles.navBarRow}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/appointment')} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{name}</Text>
          <View style={{ width: 24, height: 24, marginRight: 0 }} />
        </View>
      </View>
      {/* Scrollable Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Banner Image Placeholder or Real Image */}
          {image ? (
            <Image source={{ uri: image }} style={styles.banner} />
          ) : (
            <View style={styles.banner} />
          )}
          {/* Open Hours Section */}
          <View style={styles.openHoursRow}>
            <Ionicons name="time-outline" size={18} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.openToday}>OPEN TODAY</Text>
            <Text style={styles.hours}>8:00AM – 7:00PM</Text>
          </View>
          {/* Address Section */}
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={18} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.addressText}>{address}</Text>
          </View>
          <View style={styles.addressBox} />
          {/* Scissors Divider */}
          <View style={styles.dividerContainer}>
            <MaterialCommunityIcons name="content-cut" size={24} color="#000" />
          </View>
          {/* Staff Cards */}
          <View style={styles.staffList}>
            {staff.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.staffCard}
                onPress={() => router.push({
                  pathname: '/BarberProfileScreen',
                  params: {
                    name: member.name,
                    photo: member.photo.uri,
                    rating: member.rating,
                    // add more as needed
                  }
                })}
              >
                <Image source={member.photo} style={styles.staffPhoto} />
                <View style={styles.staffInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.staffName}>{member.name}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="thumbs-up-outline" size={18} color="#000" />
                      <Text style={styles.ratingText}> {member.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.staffRole}>{member.role}</Text>
                  <Text style={styles.staffStatus}>{member.status}</Text>
                  <View style={styles.bottomRow}>
                    <Text style={styles.bottomTag}>{member.tag}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {/* Store Posts Grid */}
          <Text style={{ fontSize: 17, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>Store Posts</Text>
          <View style={styles.galleryGrid}>
            {storePosts.map(post => (
              <View key={post.id} style={styles.galleryCard}>
                <Image source={{ uri: post.image }} style={styles.galleryImage} />
                <View style={styles.galleryOverlay} />
                <Text style={styles.galleryLabel}>{post.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      {/* Bottom Bar */}
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  navBarWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  navBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    height: 56,
    marginBottom: 0,
  },
  backBtn: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  contentWrapper: {
    flex: 1,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    flex: 1,
    fontWeight: '600',
  },
  banner: {
    width: '100%',
    height: 160,
    backgroundColor: '#444',
  },
  openHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  openToday: {
    color: '#03A100',
    fontSize: 13,
    marginRight: 10,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  hours: {
    fontSize: 13,
    color: '#000',
    marginLeft: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#000',
  },
  addressBox: {
    width: 'auto',
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginLeft: 42,
    marginRight: 42,
    marginTop: 8,
  },
  dividerContainer: {
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 8,
    paddingLeft: 16,
  },
  scissorsIcon: {
    fontSize: 24,
    color: '#000',
  },
  staffList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  staffCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
    padding: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  staffPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  staffRole: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  staffStatus: {
    fontSize: 13,
    color: '#03A100',
    marginTop: 2,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bottomTag: {
    fontSize: 12,
    color: '#666',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  galleryCard: {
    width: '48%',
    aspectRatio: 0.97,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#eee',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  galleryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  galleryLabel: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    fontSize: 13,
    color: '#FFF',
    zIndex: 2,
    fontWeight: '600',
  },
  bottomBarWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'fixed',
    left: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    borderRadius: 0,
    height: 82,
    maxWidth: 400,
    width: '100%',
    paddingHorizontal: 32,
    marginBottom: 0,
  },
  bottomBarProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#222',
  },
  bottomBarPlusWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 