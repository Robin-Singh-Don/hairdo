import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function TestMinimal() {
  const [count, setCount] = useState(0);

  const handlePress = () => {
    setCount(count + 1);
    Alert.alert('Button Pressed!', `Count: ${count + 1}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minimal Test</Text>
      <Text style={styles.count}>Count: {count}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Increment & Alert</Text>
      </TouchableOpacity>
      <Text style={styles.instructions}>
        If this works, the issue is with the login page.
        If this doesn't work, there's a fundamental app issue.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  count: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});
