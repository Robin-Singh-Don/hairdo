import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, useWindowDimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomBar from '../components/BottomBar';
// For Expo Router, use the options export to hide the header
export const options = { headerShown: false };

// Mock specialties and gallery data with tags
const specialties = [
  { key: 'fade', label: 'Fade' },
  { key: 'beard', label: 'Beard Trim' },
  { key: 'color', label: 'Color' },
  { key: 'design', label: 'Design' },
];

const galleryData = [
  { id: '1', label: 'Clean Fade', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', tags: ['fade'] },
  { id: '2', label: 'Sharp Beard', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', tags: ['beard'] },
  { id: '3', label: 'Color Pop', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', tags: ['color'] },
  { id: '4', label: 'Creative Design', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80', tags: ['design'] },
  { id: '5', label: 'Fade & Beard', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', tags: ['fade', 'beard'] },
];

const dateTabs = [
  { key: 'today', label: 'Today', slots: 0, color: '#999' },
  { key: 'tomorrow', label: 'Tomorrow', slots: 12, color: '#03A100' },
  { key: '16jul', label: '16 Jul', slots: 3, color: '#FF8A00' },
];

type TabKey = 'today' | 'tomorrow' | '16jul';

const slotTimes: Record<TabKey, string[]> = {
  today: [],
  tomorrow: ['11:45 AM', '12:10 PM', '12:35 PM', '1:00 PM', '1:25 PM'],
  '16jul': ['11:45 AM', '12:10 PM', '12:35 PM'],
};

export default function BarberProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>('tomorrow');
  const slots = slotTimes[activeTab] || [];
  const { width: windowWidth } = useWindowDimensions();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  // Get barber details from params or use fallback
  const name = (params.name as string) || 'Shark.l1';
  const photo = (params.photo as string) || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop&crop=center';
  const rating = (params.rating as string) || '90%';
  // You can add more params as needed (e.g., posts, role, etc.)
  const horizontalMargin = 16;
  const galleryGap = 12;
  const galleryCardWidth = (windowWidth - horizontalMargin * 2 - galleryGap) / 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" hidden />
      {/* Header */}
      <View style={styles.headerRowWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{name}</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Profile Info */}
          <View style={styles.profileInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileRole}>Men’s hair Salon</Text>
              <View style={styles.ratingPostsRow}>
                <View style={styles.ratingRow}>
                  <Ionicons name="thumbs-up-outline" size={18} color="#000" />
                  <Text style={styles.ratingText}> {rating}</Text>
                </View>
                <Text style={styles.postsText}>Posts 78</Text>
              </View>
            </View>
            <Image
              source={{ uri: photo }}
              style={styles.profilePic}
            />
          </View>
          {/* Booking Card */}
          <View style={styles.bookingCard}>
            <Text style={styles.visitLabel}>Book Store visit</Text>
            <View style={styles.salonInfoRow}>
              <Text style={styles.salonName}>Man’s Cave Hair Salon</Text>
              <Text style={styles.avgFee}>Avg. $30 fee</Text>
            </View>
            {/* Date Tabs */}
            <View style={styles.dateTabsRow}>
              {dateTabs.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.dateTab, activeTab === tab.key && styles.dateTabActive]}
                  onPress={() => setActiveTab(tab.key as TabKey)}
                >
                  <View style={styles.dateTabContent}>
                    <Text style={[styles.dateTabLabel, activeTab === tab.key && styles.dateTabLabelActive]}>{tab.label}</Text>
                    <Text style={[styles.slotCount, { color: tab.slots === 0 ? '#999' : tab.color }]}> {tab.slots === 0 ? 'No Slots' : `${tab.slots} Slots`}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {/* Slot Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotButtonsRow}>
              {slots.length === 0 ? (
                <Text style={styles.noSlotsText}>No slots available</Text>
              ) : (
                slots.map((slot: string, idx: number) => (
                  <TouchableOpacity key={slot + idx} style={styles.slotBtn}>
                    <Text style={styles.slotBtnText}>{slot}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity>
              <Text style={styles.viewAllSlotsUnderline}>View all slots</Text>
            </TouchableOpacity>
          </View>
          {/* Specialties Section */}
          <View style={styles.specialtiesSection}>
            <Text style={styles.specialtiesLabel}>Specialties:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specialtiesChipsRow}>
              {specialties.map(spec => (
                <TouchableOpacity
                  key={spec.key}
                  style={[styles.specialtyChip, selectedSpecialty === spec.key && styles.specialtyChipActive]}
                  onPress={() => setSelectedSpecialty(selectedSpecialty === spec.key ? null : spec.key)}
                >
                  <Text style={[styles.specialtyChipText, selectedSpecialty === spec.key && styles.specialtyChipTextActive]}>{spec.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Gallery Cards */}
          <View style={styles.galleryGrid}>
            {(selectedSpecialty
              ? galleryData.filter(card => card.tags.includes(selectedSpecialty))
              : galleryData
            ).map(card => (
              <TouchableOpacity key={card.id} style={styles.galleryCard}>
                <Image source={{ uri: card.image }} style={styles.galleryImage} />
                <View style={styles.galleryOverlay} />
                <Text style={styles.galleryLabel}>{card.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerRowWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
    height: 56,
    marginBottom: 0,
  },
  headerBackBtn: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerIconRight: {
    position: 'absolute',
    right: 16,
    zIndex: 2,
    height: 56,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    flex: 1,
    fontWeight: '600',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  profilePic: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  profileRole: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  ratingPostsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
    width: 180,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  postsText: {
    fontSize: 13,
    color: '#000',
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    marginHorizontal: '4%',
    marginTop: 16,
  },
  visitLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
    fontWeight: '500',
  },
  salonInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  salonName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  avgFee: {
    fontSize: 13,
    color: '#666',
  },
  dateTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
    width: '100%',
  },
  dateTab: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 0,
  },
  dateTabActive: {
    backgroundColor: '#FFF',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  dateTabLabel: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  dateTabLabelActive: {
    fontWeight: '600',
  },
  slotCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  slotButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingVertical: 2,
  },
  slotBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  slotBtnText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  noSlotsText: {
    fontSize: 13,
    color: '#999',
  },
  viewAllSlots: {
    fontSize: 13,
    color: '#03A100',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  viewAllSlotsUnderline: {
    fontSize: 13,
    color: '#000',
    textAlign: 'center',
    marginTop: 4,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  galleryCard: {
    width: '48%',
    aspectRatio: 0.97,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
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
    height: 60,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  galleryLabel: {
    fontSize: 13,
    color: '#FFF',
    zIndex: 2,
    fontWeight: '600',
  },
  contentWrapper: {
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  dateTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialtiesSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  specialtiesLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    marginBottom: 8,
  },
  specialtiesChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  specialtyChipActive: {
    backgroundColor: '#03A100',
    borderColor: '#03A100',
  },
  specialtyChipText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  specialtyChipTextActive: {
    color: '#FFF',
  },
}); 