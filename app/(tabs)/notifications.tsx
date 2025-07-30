import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Pressable, Animated, Easing, AccessibilityRole } from 'react-native';
import { useRouter } from 'expo-router';

const GROUP_SPACING = 24;
const SECTION_TOP = 32;
const ROW_HEIGHT = 72;
const H_MARGIN = 16;
const ACTIVE_COLOR = '#5B5B5B';
const INACTIVE_COLOR = '#888FA9';
const THUMB_COLOR = '#FFFFFF';
const DISABLED_COLOR = '#F4F4F5';
const LABEL_COLOR = '#0B0B0B';
const HELPER_COLOR = '#6F6F6F';
const DIVIDER_COLOR = '#E4E4E7';

const notificationRows = [
  {
    key: 'pause_all',
    label: 'Pause all notifications',
    helper: 'Stop all CuttTack alerts.',
    group: 0,
  },
  {
    key: 'post_stories_comments',
    label: 'Post, stories and comments',
    helper: 'Updates when people follow or comment.',
    group: 1,
  },
  {
    key: 'messages',
    label: 'Messages',
    helper: 'Receive a ping whenever you get a new in-app message.',
    group: 1,
  },
  {
    key: 'email',
    label: 'Email notifications',
    helper: 'Receive friendly updates, reminders, and deals by email.',
    group: 2,
  },
  {
    key: 'appointment_reminders',
    label: 'Appointment Reminders',
    helper: 'Alerts before upcoming appointments.',
    group: 3,
  },
  {
    key: 'waitlist_last_minute',
    label: 'Waitlist & Last-Minute',
    helper: 'Alerts when a last-minute slot opens.',
    group: 3,
  },
];

const groupIndices = [0, 1, 2, 3];

function ToggleSwitch({ value, onValueChange, disabled, accessibilityLabel }: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [INACTIVE_COLOR, ACTIVE_COLOR],
  });
  const thumbTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 18], // 2px left, 18px right (track: 40px, thumb: 20px, margin: 2px)
  });
  const thumbColor = disabled ? DISABLED_COLOR : THUMB_COLOR;

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.toggleTouchTarget,
        disabled && { opacity: 0.5 },
        pressed && !disabled && { opacity: 0.7 },
      ]}
      hitSlop={4}
      android_ripple={disabled ? undefined : { color: '#ccc', borderless: true }}
    >
      <Animated.View
        style={[
          styles.toggleTrack,
          { backgroundColor: trackColor },
        ]}
      >
        <Animated.View
          style={[
            styles.toggleThumb,
            {
              backgroundColor: thumbColor,
              transform: [{ translateX: thumbTranslate }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState({
    pause_all: false,
    post_stories_comments: true,
    messages: false,
    email: true,
    appointment_reminders: true,
    waitlist_last_minute: true,
  });

  const disabled = prefs.pause_all;

  const updatePref = (key: keyof typeof prefs, value: boolean) => {
    if (key === 'pause_all') {
      setPrefs(prev => ({ ...prev, pause_all: value }));
    } else {
      setPrefs(prev => ({ ...prev, [key]: value }));
    }
  };

  // Group rows by group index
  const groupedRows = groupIndices.map(group =>
    notificationRows.filter(row => row.group === group)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centeredContent}>
        {groupedRows.map((rows, groupIdx) => (
          <View key={groupIdx} style={{ marginTop: groupIdx === 0 ? SECTION_TOP : GROUP_SPACING }}>
            {rows.map((row, idx) => (
              <View key={row.key}>
                <View style={[
                  styles.rowContainer,
                  idx < rows.length - 1 && styles.rowSpacing,
                ]}>
                  <View style={styles.labelCol}>
                    <Text
                      style={[
                        styles.rowLabel,
                        disabled && row.key !== 'pause_all' && styles.disabledLabel,
                      ]}
                      numberOfLines={2}
                    >
                      {row.label}
                    </Text>
                    <Text
                      style={[
                        styles.rowHelper,
                        disabled && row.key !== 'pause_all' && styles.disabledHelper,
                      ]}
                      numberOfLines={2}
                    >
                      {row.helper}
                    </Text>
                  </View>
                  <ToggleSwitch
                    value={prefs[row.key as keyof typeof prefs]}
                    onValueChange={v => updatePref(row.key as keyof typeof prefs, v)}
                    disabled={row.key !== 'pause_all' && disabled}
                    accessibilityLabel={row.label}
                  />
                </View>
              </View>
            ))}
          </View>
        ))}
        <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
    paddingHorizontal: H_MARGIN,
    borderBottomWidth: 0,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: LABEL_COLOR,
    opacity: 0.8,
    marginLeft: 0,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: LABEL_COLOR,
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  centeredContent: {
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ROW_HEIGHT,
    paddingHorizontal: H_MARGIN,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  rowSpacing: {
    marginBottom: 16,
  },
  labelCol: {
    flex: 1,
    marginRight: 16,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: LABEL_COLOR,
    marginBottom: 4,
  },
  rowHelper: {
    fontSize: 13,
    color: HELPER_COLOR,
    fontWeight: '400',
  },
  disabledLabel: {
    color: '#B3B3B3',
    opacity: 0.4,
  },
  disabledHelper: {
    color: '#B3B3B3',
    opacity: 0.4,
  },
  toggleTouchTarget: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTrack: {
    width: 40,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: INACTIVE_COLOR,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THUMB_COLOR,
    position: 'absolute',
    top: 2.5,
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
}); 