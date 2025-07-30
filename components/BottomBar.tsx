import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function BottomBar() {
  const router = useRouter();
  return (
    <View style={styles.bottomBarWrapper}>
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
          <Ionicons name="home-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/HomeScreen')}>
          <Ionicons name="search-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.bottomBarPlusWrapper}>
          <Ionicons name="add" size={20} color="#fff" />
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/inbox')}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/ProfilePage11')}>
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