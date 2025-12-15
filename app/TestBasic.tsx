import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

export default function TestBasic() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Basic Test</Text>
      <TouchableOpacity 
        style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8 }}
        onPress={() => Alert.alert('Success', 'Basic button works!')}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Test Button</Text>
      </TouchableOpacity>
    </View>
  );
}
