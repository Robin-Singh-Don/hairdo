import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function BottomBar() {
  const router = useRouter();

  return (
    <View style={styles.bottomBarWrapper}>
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.push('/(customer)/explore')}>
          <Ionicons name="home-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(customer)/HomeScreen')}>
          <Ionicons name="search-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(customer)/appointment')}>
          <View style={styles.quickBookButton}>
            <Ionicons name="add" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(customer)/my-bookings')}>
          <Ionicons name="calendar" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(customer)/ProfilePage11')}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.bottomBarProfilePic} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    borderRadius: 0,
    height: 82,
    maxWidth: 430,
    width: '100%',
    paddingHorizontal: 32,
    marginBottom: 0,
    alignSelf: 'center',
  },
  bottomBarProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#222',
  },
  quickBookButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#C82DF',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
}); 