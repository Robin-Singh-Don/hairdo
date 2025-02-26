import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';

const CustomDropdown = ({
  label,
  value,
  options,
  onChange, // Make sure to handle onChange
  style,
  displayData = 'value'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownHeight = useState(new Animated.Value(0))[0];
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    console.log('dropdownHeight'), dropdownHeight
    Animated.timing(dropdownHeight, {
      toValue: isOpen ? 0 : 120, // Adjust height as needed
      duration: 300,
      useNativeDriver: false, // Important: set to false for height animation
    }).start();
  };

  const handleOptionPress = (option) => {
    if (onChange) {
      onChange(option); // Call onChange with the selected value
    }
    toggleDropdown();
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.inputContainer}>
        <Text style={styles.inputValue}>{value || label}</Text>
        <View style={styles.caret}>
          <View style={[styles.caretLine, isOpen && styles.caretLineOpen]} />
          <View style={[styles.caretLine, isOpen && styles.caretLineOpen, styles.caretLineRight]} />
        </View>
      </TouchableOpacity>
      {isOpen && (
        <Animated.View
          style={[
            styles.dropdownContainer,
          ]}
        >

          <ScrollView style={styles.optionsList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleOptionPress(option.value)} // Call handleOptionPress
                style={styles.optionItem}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </Animated.View>)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 16,
  },
  inputValue: {
    color: 'gray',
  },
  dropdownContainer: {


    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 5,
    backgroundColor: 'white', // Add background color to dropdown
  },
  optionsList: {
    // height: 100,
    maxHeight: 200,
  },
  optionItem: {
    padding: 10,
    backgroundColor: 'white', // Add background color to items
    dropdownContent: {
      position: 'absolute', // To overlay the dropdown
      width: 200,
      backgroundColor: '#f9f9f9',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      elevation: 3, // For Android shadow
      shadowColor: '#000', // For iOS shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,

    },
  },
  optionText: {
    fontSize: 14,
  },
  caret: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#000',
    marginLeft: 5,
  },
  caretLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
  caretLineOpen: {
    transform: [{ rotate: '180deg' }],
  },
  caretLineRight: {
    left: 'auto',
    right: 0,
  },
});

export default CustomDropdown;