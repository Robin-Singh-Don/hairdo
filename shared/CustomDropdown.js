import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomDropdown = ({
  label, // Used as placeholder
  value,
  options,
  onChange,
  style,
  displayData = 'value', // Kept for compatibility, though unused
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef(null); // Reference to the button for measuring its position
  const [selectedValue, setSelectedValue] = useState(null);

  // Toggle dropdown visibility and measure button position
  const toggleDropdown = () => {
    if (!isOpen) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        // Use screen coordinates (pageX, pageY) for accurate positioning
        setButtonLayout({ x: pageX, y: pageY, width, height });
        setIsOpen(true);
      });
    } else {
      setIsOpen(false);
    }
  };

  // Handle option selection
  const handleOptionPress = (optionValue) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  // Determine display text: selected option's label or placeholder
  // const selectedLabel = value ? options.find(option => option.value === value)?.value : label;
  const selectedLabel = value && options.find(option => option.value === value)?.value;
  selectedLabel && console.log('selectedLabel', selectedLabel);
  return (
    <View style={[styles.container, style]}>
      {/* Dropdown Button */}
      <TouchableOpacity
        ref={buttonRef} // Attach ref to the button
        onPress={toggleDropdown}
        style={styles.inputContainer}
      >
        <Text style={[  styles.inputValue , label && !selectedLabel && styles.inputTextStyle]}>{selectedLabel || label}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={14}
          color="#000"
        />
      </TouchableOpacity>

      {/* Dropdown List */}
      {isOpen && (
        <Modal
          visible={isOpen}
          transparent={true}
          onRequestClose={() => setIsOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={[
                    styles.dropdownContainer,
                    {
                      top: buttonLayout.y + buttonLayout.height + 5, // Position below button with a small gap
                      left: buttonLayout.x, // Align with button's left edge
                      width: buttonLayout.width, // Match button's width
                    },
                  ]}
                >
                  <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                    {options.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleOptionPress(option.value)}
                        style={styles.optionItem}
                      >
                        <Text style={styles.optionText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#00000061',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    fontSize: 14,

  },
  inputValue: {
    color: '#000',
   },
  inputTextStyle: {
    color: 'grey'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#00000061',
    borderRadius: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  scrollContentContainer: {
    paddingVertical: 5,
  },
  optionItem: {
    padding: 10,
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 14,
    color: '#000',
  },
});

export default CustomDropdown;

// import React, { useState } from 'react';
// import { View, StyleSheet, Platform } from 'react-native';
// import RNPickerSelect from 'react-native-picker-select';
// // import { Ionicons } from '@expo/vector-icons';

// const CustomDropdown = () => {
//   const [selectedValue, setSelectedValue] = useState(null);

//   const options = [
//     { label: 'Male', value: 'male' },
//     { label: 'Female', value: 'female' },
//     { label: 'Other', value: 'other' },
//   ];

//   return (
//     <View style={styles.container}>
//       <RNPickerSelect
//         onValueChange={(value) => setSelectedValue(value)}
//         items={options}
//         value={selectedValue}
//         placeholder={{ label: 'Gender', value: null }}
//         useNativeAndroidPickerStyle={false}
//         style=  {[{
//           ...pickerSelectStyles,
//           inputIOS: { ...pickerSelectStyles.inputIOS, borderWidth: 0 },
//           inputAndroid: { ...pickerSelectStyles.inputAndroid, borderWidth: 0 },
//         }]}
//         // {{borderWidth: 3, borderColor: 'green',}}
//         fixAndroidTouchableBug={true}
//         // Icon={() => <Ionicons name="chevron-down" size={20} color="gray" 
//       //   />
//       // }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'white',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     // borderWidth: 0,
//     paddingVertical: 15, // Increased vertical padding
//     paddingHorizontal: 20, // Increased horizontal padding
//     justifyContent: 'center',
//     backgroundColor: '#fff', 
//   },
//   inputContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     // borderWidth: 0,
//     paddingVertical: 15, // Increased vertical padding
//     paddingHorizontal: 20, // Increased horizontal padding
//     justifyContent: 'center',
//     backgroundColor: '#fff', // Solid background for the dropdown button
//   },
// });

// const pickerSelectStyles = StyleSheet.create({
//   inputIOS: {
//     fontSize: 16,
//     color: 'black',
//     borderWidth: 0, // Removes inner border
//     backgroundColor: 'transparent', // Ensures no extra background
//     paddingVertical: 0, // Removes extra padding that might cause a border effect
//     paddingHorizontal: 0,
//   },
//   inputAndroid: {
//     fontSize: 16,
//     color: 'black',
//     borderWidth: 0, // Removes inner border
//     backgroundColor: 'transparent',
//     paddingVertical: 0,
//     paddingHorizontal: 0,
//   },
//   iconContainer: {
//     top: Platform.OS === 'ios' ? 15 : 10,
//     right: 10,
//   },
//   modalViewBottom: {
//     backgroundColor: 'white',
//     maxHeight: 200, // Ensuring dropdown list height is 200
//   },
// });

// export default CustomDropdown;



// // const styles = StyleSheet.create({
// //   container: {
// //     borderWidth: 1,
// //     borderColor: '#ccc',
// //     borderRadius: 8,
// //     paddingHorizontal: 12,
// //     paddingVertical: Platform.OS === 'ios' ? 12 : 8,
// //     justifyContent: 'center',
// //     backgroundColor: 'white',
// //   },
// //   iconContainer: {
// //     top: Platform.OS === 'ios' ? 12 : 10,
// //     right: 10,
// //     position: 'absolute',
// //     pointerEvents: 'none',
// //   },
// // });

// // const pickerSelectStyles = StyleSheet.create({
// //   inputIOS: {
// //     fontSize: 16,
// //     paddingVertical: 12,
// //     paddingHorizontal: 10,
// //     color: 'black',
// //     paddingRight: 30, // To ensure text doesn't overlap with icon
// //   },
// //   inputAndroid: {
// //     fontSize: 16,
// //     paddingHorizontal: 10,
// //     paddingVertical: 8,
// //     color: 'black',
// //     paddingRight: 30,
// //   },
// //   modalViewBottom: {
// //     backgroundColor: 'white',
// //     maxHeight: 200, // <-- Max height for option list
// //   },
// // });

// // export default CustomDropdown;
