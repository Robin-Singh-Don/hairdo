import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

const CustomSwitch = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[
        styles.switchBase,
        { backgroundColor: value ? '#555' : '#555' }, // Always dark gray
      ]}
    >
      <View
        style={[
          styles.thumb,
          {
            left: value ? 22 : 2, // Move thumb
            borderColor: '#555', // Border matches track
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchBase: {
    width: 35,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#555',
    justifyContent: 'center',
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    width: 19,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    top:0,
    left:16
    // left is set dynamically
  },
});

export default CustomSwitch;