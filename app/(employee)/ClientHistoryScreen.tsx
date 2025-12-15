import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { employeeAPI } from '../../services/api/employeeAPI';

// Mock client data with comprehensive history
const MOCK_CLIENTS = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    isEmailVerified: true,
    clientTag: 'VIP',
    totalVisits: 24,
    totalSpent: 1250,
    lastVisit: '2024-01-15',
    averageSpend: 52,
    visitFrequency: 'Weekly',
    loyaltyPoints: 1250,
    status: 'Active',
    preferredServices: ['Haircut', 'Beard Trim'],
    preferredEmployee: 'Shark.11',
    notes: 'Prefers short fade, always books Saturday morning',
    joinDate: '2023-06-15',
    birthday: '1985-03-22',
    address: '123 Main St, City, State 12345',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '+1 (555) 234-5678',
    email: 'sarah.j@email.com',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    isEmailVerified: true,
    clientTag: 'Regular',
    totalVisits: 12,
    totalSpent: 480,
    lastVisit: '2024-01-10',
    averageSpend: 40,
    visitFrequency: 'Bi-weekly',
    loyaltyPoints: 480,
    status: 'Active',
    preferredServices: ['Hair Styling', 'Hair Color'],
    preferredEmployee: 'Puneet.10',
    notes: 'Likes bold colors, very particular about styling',
    joinDate: '2023-09-20',
    birthday: '1992-07-14',
    address: '456 Oak Ave, City, State 12345',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    phone: '+1 (555) 345-6789',
    email: 'mike.wilson@email.com',
    profileImage: 'https://randomuser.me/api/portraits/men/65.jpg',
    isEmailVerified: false,
    clientTag: 'New',
    totalVisits: 3,
    totalSpent: 90,
    lastVisit: '2024-01-12',
    averageSpend: 30,
    visitFrequency: 'Monthly',
    loyaltyPoints: 90,
    status: 'Active',
    preferredServices: ['Haircut'],
    preferredEmployee: 'Jeet.12',
    notes: 'New client, still exploring services',
    joinDate: '2023-12-01',
    birthday: '1988-11-30',
    address: '789 Pine St, City, State 12345',
  },
  {
    id: '4',
    name: 'Emily Davis',
    phone: '+1 (555) 456-7890',
    email: 'emily.davis@email.com',
    profileImage: 'https://randomuser.me/api/portraits/women/12.jpg',
    isEmailVerified: true,
    clientTag: 'VIP',
    totalVisits: 18,
    totalSpent: 720,
    lastVisit: '2024-01-08',
    averageSpend: 40,
    visitFrequency: 'Weekly',
    loyaltyPoints: 720,
    status: 'Active',
    preferredServices: ['Facial', 'Eyebrow Shaping'],
    preferredEmployee: 'Abhay.0',
    notes: 'VIP client, always books premium services',
    joinDate: '2023-04-10',
    birthday: '1990-05-18',
    address: '321 Elm St, City, State 12345',
  },
  {
    id: '5',
    name: 'David Brown',
    phone: '+1 (555) 567-8901',
    email: 'david.brown@email.com',
    profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
    isEmailVerified: true,
    clientTag: 'Regular',
    totalVisits: 8,
    totalSpent: 320,
    lastVisit: '2023-12-20',
    averageSpend: 40,
    visitFrequency: 'Monthly',
    loyaltyPoints: 320,
    status: 'At-Risk',
    preferredServices: ['Haircut & Beard'],
    preferredEmployee: 'Shark.11',
    notes: 'Haven\'t visited in a while, send reminder',
    joinDate: '2023-08-15',
    birthday: '1987-12-03',
    address: '654 Maple Dr, City, State 12345',
  },
];

export default function ClientHistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrorIds, setImageErrorIds] = useState<string[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filterOptions = ['All', 'VIP', 'Regular', 'New', 'At-Risk', 'Active'];

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load client history from repository via employeeAPI
        const clientHistory = await employeeAPI.getClientHistory();
        
        if (clientHistory.length > 0) {
          setClients(clientHistory);
        } else {
          // Fallback to mock data if no clients found
          setClients(MOCK_CLIENTS);
        }
      } catch (error) {
        console.error('Error loading client history:', error);
        // Fallback to mock data on error
        setClients(MOCK_CLIENTS);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = clients;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by selected filter
    if (selectedFilter !== 'All') {
      if (selectedFilter === 'Active') {
        filtered = filtered.filter(client => client.status === 'Active');
      } else {
        filtered = filtered.filter(client => client.clientTag === selectedFilter);
      }
    }

    setFilteredClients(filtered);
  }, [searchQuery, selectedFilter, clients]);


  const handleClientPress = (client: any) => {
    router.push({
      pathname: '/IndividualClientHistoryScreen',
      params: {
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
      }
    });
  };

  const handleImageError = (id: string) => {
    setImageErrorIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase();
  };


  const renderClientCard = useCallback(({ item: client }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.clientCard}
        onPress={() => handleClientPress(client)}
        accessibilityRole="button"
        accessibilityLabel={`Client ${client.name}`}
      >
        <View style={styles.clientContent}>
          {imageErrorIds.includes(client.id) ? (
            <View style={[styles.clientImage, styles.clientImageFallback]}>
              <Text style={styles.clientImageFallbackText}>{getInitials(client.name)}</Text>
            </View>
          ) : (
            <Image 
              source={{ uri: client.profileImage }} 
              style={styles.clientImage} 
              onError={() => handleImageError(client.id)}
            />
          )}
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientPhone}>{client.phone}</Text>
            {client.email && (
              <Text style={styles.clientEmail}>{client.email}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    );
  }, [imageErrorIds]);

  const ListHeader = useMemo(() => (
    <View style={styles.stickyHeaderContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [searchQuery]);

  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skelRow}>
        <View style={styles.skelAvatar} />
        <View style={styles.skelTextBlock}>
          <View style={styles.skelLineLarge} />
          <View style={styles.skelLine} />
          <View style={styles.skelLineShort} />
        </View>
      </View>
      <View style={styles.skelStatsRow}>
        <View style={styles.skelPill} />
        <View style={styles.skelPill} />
        <View style={styles.skelPill} />
        <View style={styles.skelPill} />
      </View>
      <View style={styles.skelFooter}>
        <View style={styles.skelLineMedium} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading client history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client History</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Clients</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.filterList}>
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterOption,
                    selectedFilter === filter && styles.filterOptionActive
                  ]}
                  onPress={() => {
                    setSelectedFilter(filter);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === filter && styles.filterOptionTextActive
                  ]}>
                    {filter}
                  </Text>
                  {selectedFilter === filter && (
                    <Ionicons name="checkmark" size={18} color="#000" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Client List with sticky header */}
      <FlatList
        data={filteredClients}
        renderItem={renderClientCard}
        keyExtractor={(item) => item.id}
        style={styles.clientList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.clientListContent}
        ListHeaderComponent={ListHeader}
        stickyHeaderIndices={[0]}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        removeClippedSubviews
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonContainer}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={56} color="#9E9E9E" />
              <Text style={styles.emptyTitle}>No clients found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters or search query.</Text>
            </View>
          )
        }
      />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  stickyHeaderContainer: {
    backgroundColor: '#fff',
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clientList: {
    flex: 1,
  },
  clientListContent: {
    paddingBottom: 20,
    paddingTop: 0,
  },
  clientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  clientContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  clientImageFallback: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientImageFallbackText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 12,
    color: '#999',
  },
  // Skeleton styles
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  skelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skelAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAEAEA',
    marginRight: 12,
  },
  skelTextBlock: {
    flex: 1,
  },
  skelLineLarge: {
    height: 14,
    backgroundColor: '#EAEAEA',
    borderRadius: 6,
    marginBottom: 8,
    width: '60%',
  },
  skelLine: {
    height: 10,
    backgroundColor: '#EAEAEA',
    borderRadius: 6,
    marginBottom: 6,
    width: '40%',
  },
  skelLineShort: {
    height: 10,
    backgroundColor: '#EAEAEA',
    borderRadius: 6,
    width: '30%',
  },
  skelLineMedium: {
    height: 12,
    backgroundColor: '#EAEAEA',
    borderRadius: 6,
    marginBottom: 6,
    width: '50%',
  },
  skelStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  skelPill: {
    height: 18,
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    width: '22%',
  },
  skelFooter: {
    height: 12,
    backgroundColor: '#EAEAEA',
    borderRadius: 6,
    width: '70%',
  },
  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
  // Filter Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    position: 'absolute',
    top: 60,
    right: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  filterList: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterOptionActive: {
    backgroundColor: '#F5F5F5',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  filterOptionTextActive: {
    color: '#000',
    fontWeight: '600',
  },
});
