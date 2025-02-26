import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

const PopupComponent = ({ isVisible, onClose, toggleButton, title, option1Text, option2Text }) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
    //   onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
        {title && <Text style={styles.modalTitle}>{title}</Text>} 
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>x</Text>
          </TouchableOpacity>
           {/* Conditionally render title */}
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity style={[styles.modalButton, styles.optionButton]} onPress={ () => toggleButton(option1Text)}>
              <Text style={styles.optionButtonText}>{option1Text}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>or</Text>
            <TouchableOpacity style={[styles.modalButton, styles.anotherButton]} onPress={ () => toggleButton(option2Text)}>
              <Text style={styles.modalButtonText}>{option2Text}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
    justifyContent: 'center',
    alignItems: 'center',
    // width: '90%'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '85%'
  },
  modalTitle: {
    fontSize: 16,
    // fontWeight: 'bold',
    marginBottom: 10,
    color: 'grey'
  },
  modalButtonsContainer: {
    flexDirection: 'column',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // rowGap: '5px'
  },
  optionButton: {
    backgroundColor: 'white',
    border: '2px solid black',
    color: 'black !important',
    textAlign: 'center'
  },
  anotherButton: {
    backgroundColor: 'black',
    color: 'white',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    fontSize: 18,
    fontWeight: 'bold',
    width: '150%',
    textAlign: 'center'
  },
  optionButtonText: {
    textAlign: 'center',
    color: 'black'
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center'
  },

  closeButton: {
    position: 'absolute',
    top: 0,
    right: 5,
    padding: 10,
  },
  closeText: {
    fontSize: 11,
    color: '#000',
  },
});

export default PopupComponent;
