import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const RECENT_CITIES = [
  { name: 'Toronto', type: 'CITY' },
  { name: 'Downtown Vancouver', sub: 'Vancouver' },
];
const TOP_LOCALITIES = [
  { name: 'Yaletown' },
  { name: 'Gastown' },
  { name: 'Kitsilano' },
  { name: 'North York' },
  { name: 'Scarborough' },
  { name: 'Burnaby' },
  { name: 'Richmond' },
  { name: 'Mississauga' },
  { name: 'Etobicoke' },
  { name: 'West End' },
];
const ALL_CITIES = [
  'Vancouver',
  'Toronto',
  'Montreal',
  'Calgary',
  'Ottawa',
  'Edmonton',
  'Winnipeg',
  'Quebec City',
  'Hamilton',
  'Kitchener',
  'London',
  'Victoria',
  'Halifax',
  'Oshawa',
  'Windsor',
  'Saskatoon',
  'St. Catharines',
  'Regina',
  'St. John’s',
  'Kelowna',
];

export const options = { headerShown: false };
export const navigationOptions = { headerShown: false };
export const screenOptions = { headerShown: false };
export const config = { headerShown: false };

export default function LocationSearch() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredCities = ALL_CITIES.filter(city =>
    city.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (city: string) => {
    router.replace({ pathname: '/(tabs)/explore', params: { location: city } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={styles.centeredContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color="#B0B0B0" style={{ marginLeft: 10, marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search here..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#B0B0B0"
          />
        </View>
        {/* Use current location */}
        <TouchableOpacity style={styles.currentLocationRow}>
          <Ionicons name="search" size={22} color="#2196F3" style={{ marginRight: 8 }} />
          <Text style={styles.currentLocationText}>Use current location</Text>
          <Ionicons name="locate" size={20} color="#2196F3" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        {/* Continue searching for... */}
        <Text style={styles.sectionTitle}>Continue searching for...</Text>
        {RECENT_CITIES.map((item, idx) => (
          <TouchableOpacity key={item.name} style={styles.cityRow} onPress={() => handleSelect(item.name)}>
            <Ionicons name="search" size={18} color="#B0B0B0" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.cityText}>{item.name}</Text>
              {item.sub && <Text style={styles.citySub}>{item.sub}</Text>}
            </View>
            {item.type && <Text style={styles.cityType}>{item.type}</Text>}
          </TouchableOpacity>
        ))}
        {/* Top localities */}
        <Text style={styles.sectionTitle}>Top localities</Text>
        <FlatList
          data={TOP_LOCALITIES}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.cityRow} onPress={() => handleSelect(item.name)}>
              <Ionicons name="search" size={18} color="#B0B0B0" style={{ marginRight: 10 }} />
              <Text style={styles.cityText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  headerBack: {
    width: 32,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  centeredContent: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    height: 40,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 0,
    width: '100%',
    maxWidth: 350,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    width: '100%',
    maxWidth: 350,
    justifyContent: 'center',
  },
  currentLocationText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 18,
    marginBottom: 6,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 350,
    alignSelf: 'flex-start',
  },
  cityText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'left',
  },
  citySub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    textAlign: 'left',
  },
  cityType: {
    marginLeft: 8,
    color: '#888',
    fontSize: 13,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'left',
  },
}); 