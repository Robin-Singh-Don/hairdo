import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DayHours {
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

interface EditDayHoursModalProps {
  visible: boolean;
  day: DayKey;
  dayHours: DayHours;
  onClose: () => void;
  onSave: (dayHours: DayHours) => void;
}

const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

// Generate time slots (every 30 minutes from 6 AM to 11 PM)
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const hours = [6, 7, 8, 9, 10, 11, 12];
  const pmHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  
  // AM hours
  hours.forEach(hour => {
    slots.push(`${hour}:00 AM`);
    if (hour !== 12) {
      slots.push(`${hour}:30 AM`);
    }
  });
  
  // PM hours
  pmHours.forEach(hour => {
    slots.push(`${hour}:00 PM`);
    if (hour !== 11) {
      slots.push(`${hour}:30 PM`);
    }
  });
  
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function EditDayHoursModal({
  visible,
  day,
  dayHours,
  onClose,
  onSave,
}: EditDayHoursModalProps) {
  const [isOpen, setIsOpen] = useState(dayHours.isOpen);
  const [openingTime, setOpeningTime] = useState(dayHours.openingTime);
  const [closingTime, setClosingTime] = useState(dayHours.closingTime);
  const [showOpeningPicker, setShowOpeningPicker] = useState(false);
  const [showClosingPicker, setShowClosingPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsOpen(dayHours.isOpen);
      setOpeningTime(dayHours.openingTime);
      setClosingTime(dayHours.closingTime);
    }
  }, [visible, dayHours]);

  // Convert time string to minutes for comparison
  const timeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  const handleSave = () => {
    if (isOpen && openingTime && closingTime) {
      // Validate that opening time is before closing time
      const openingMinutes = timeToMinutes(openingTime);
      const closingMinutes = timeToMinutes(closingTime);
      
      if (openingMinutes >= closingMinutes) {
        Alert.alert(
          'Invalid Time',
          'Opening time must be before closing time. Please correct the times.',
          [{ text: 'OK' }]
        );
        return; // Don't save invalid times
      }
      
      onSave({
        isOpen,
        openingTime,
        closingTime,
      });
      onClose();
    } else if (!isOpen) {
      onSave({
        isOpen: false,
        openingTime: dayHours.openingTime,
        closingTime: dayHours.closingTime,
      });
      onClose();
    }
  };

  const handleTimeSelect = (time: string, isOpening: boolean) => {
    if (isOpening) {
      setOpeningTime(time);
      setShowOpeningPicker(false);
      // If new opening time is after current closing time, adjust closing time
      const openingMinutes = timeToMinutes(time);
      const closingMinutes = timeToMinutes(closingTime);
      if (openingMinutes >= closingMinutes) {
        // Find next valid closing time
        const currentIndex = TIME_SLOTS.indexOf(time);
        if (currentIndex !== -1 && currentIndex < TIME_SLOTS.length - 1) {
          setClosingTime(TIME_SLOTS[currentIndex + 1]);
        }
      }
    } else {
      setClosingTime(time);
      setShowClosingPicker(false);
    }
  };

  const renderTimePicker = (isOpening: boolean) => {
    const currentTime = isOpening ? openingTime : closingTime;
    const otherTime = isOpening ? closingTime : openingTime;
    
    // Filter times based on which picker we're showing
    let availableTimes = TIME_SLOTS;
    
    if (isOpening) {
      // For opening time, filter out times after closing time
      const closingIndex = TIME_SLOTS.indexOf(closingTime);
      if (closingIndex !== -1) {
        availableTimes = TIME_SLOTS.slice(0, closingIndex);
      }
    } else {
      // For closing time, filter out times before opening time
      const openingIndex = TIME_SLOTS.indexOf(openingTime);
      if (openingIndex !== -1) {
        availableTimes = TIME_SLOTS.slice(openingIndex + 1);
      }
    }
    
    return (
      <Modal
        visible={isOpening ? showOpeningPicker : showClosingPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          if (isOpening) setShowOpeningPicker(false);
          else setShowClosingPicker(false);
        }}
      >
        <View style={styles.pickerOverlay}>
          <TouchableOpacity
            style={styles.pickerBackdrop}
            activeOpacity={1}
            onPress={() => {
              if (isOpening) setShowOpeningPicker(false);
              else setShowClosingPicker(false);
            }}
          />
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                Select {isOpening ? 'Opening' : 'Closing'} Time
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (isOpening) setShowOpeningPicker(false);
                  else setShowClosingPicker(false);
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerContent}>
              <View style={styles.timeGrid}>
                {availableTimes.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeOption,
                      currentTime === time && styles.timeOptionSelected,
                    ]}
                    onPress={() => handleTimeSelect(time, isOpening)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        currentTime === time && styles.timeOptionTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{DAY_LABELS[day]}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Toggle Switch */}
              <View style={styles.toggleSection}>
                <Text style={styles.toggleLabel}>Open Today?</Text>
                <View style={styles.toggleContainer}>
                  <Text style={[styles.toggleText, !isOpen && styles.toggleTextOff]}>
                    {isOpen ? 'ON' : 'OFF'}
                  </Text>
                  <Switch
                    value={isOpen}
                    onValueChange={setIsOpen}
                    trackColor={{ false: '#E0E0E0', true: '#000' }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              {/* Time Pickers */}
              {isOpen && (
                <>
                  <View style={styles.timeSection}>
                    <Text style={styles.timeLabel}>Opening Time</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setShowOpeningPicker(true)}
                    >
                      <Ionicons name="time-outline" size={20} color="#666" />
                      <Text style={styles.timeButtonText}>{openingTime}</Text>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeSection}>
                    <Text style={styles.timeLabel}>Closing Time</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setShowClosingPicker(true)}
                    >
                      <Ionicons name="time-outline" size={20} color="#666" />
                      <Text style={styles.timeButtonText}>{closingTime}</Text>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Pickers */}
      {renderTimePicker(true)}
      {renderTimePicker(false)}
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  
  // Toggle Section
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  toggleTextOff: {
    color: '#999',
  },
  
  // Time Section
  timeSection: {
    marginBottom: 24,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  timeButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  
  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Time Picker Modal
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  pickerContent: {
    maxHeight: 400,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    minWidth: '30%',
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});

