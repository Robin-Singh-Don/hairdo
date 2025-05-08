import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView } from 'react-native';

const NotificationSettings = ({ navigation }) => {
  const [pauseAll, setPauseAll] = useState(false);
  const [posts, setPosts] = useState(false);
  const [messages, setMessages] = useState(true);
  const [email, setEmail] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 32 }} /> {/* Placeholder for alignment */}
      </View>
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Pause all notifications</Text>
        <Switch
          value={pauseAll}
          onValueChange={ () => setPauseAll(!pauseAll)}
          trackColor={{ false: '#888', true: '#000' }} 
          thumbColor={pauseAll ? '#000' : '#fff'} 
          ios_backgroundColor="#000" 
        />
      </View>
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Post, stories and comments</Text>
        <Switch
          value={posts}
          onValueChange={ () => setPosts(!posts)}
          trackColor={{ false: '#888', true: '#888' }}
          thumbColor={posts ? '#000' : '#fff'}
        />
      </View>
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Messages</Text>
        <Switch
          value={messages}
          onValueChange={ () => setMessages(!messages)}
          trackColor={{ false: '#888', true: '#888' }}
          thumbColor={messages ? '#000' : '#fff'}
          ios_backgroundColor="#000"
        />
      </View>
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Email notifications</Text>
        <Switch
          value={email}
          onValueChange={ () => setEmail(!email)}
          trackColor={{ false: '#888', true: '#888' }}
          thumbColor={!email ? '#000' : '#000'}
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  backArrow: {
    fontSize: 28,
    color: '#000',
    width: 32,
    textAlign: 'left',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  optionText: {
    fontSize: 16,
    color: '#111',
  },
});

export default NotificationSettings;