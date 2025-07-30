import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const SCREEN_WIDTH = 375;
const SCREEN_HEIGHT = 812;
const PANEL_WIDTH = 365;
const PANEL_HEIGHT = 230;
const SLIDER_WIDTH = 280;
const SLIDER_HEIGHT = 2;
const SLIDER_HANDLE_DIAM = 10;
const SLIDER_LEFT_MARGIN = 20;
const SLIDER_TOP_MARGIN = 10;
const SLIDER_HANDLE_INIT = 100; // px from left
const NAV_HEIGHT = 60;

const AppearanceScreen = () => {
  const [theme, setTheme] = useState('dark');
  const [sliderX, setSliderX] = useState(SLIDER_HANDLE_INIT);
  const [isHandleActive, setIsHandleActive] = useState(false);
  const [isSubmitActive, setIsSubmitActive] = useState(false);
  const [activeNav, setActiveNav] = useState(null);

  // PanResponder for slider handle
  const pan = React.useRef(new Animated.Value(sliderX)).current;
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsHandleActive(true),
    onPanResponderMove: (e, gestureState) => {
      let newX = sliderX + gestureState.dx;
      newX = Math.max(0, Math.min(newX, SLIDER_WIDTH));
      pan.setValue(newX);
    },
    onPanResponderRelease: (e, gestureState) => {
      let newX = sliderX + gestureState.dx;
      newX = Math.max(0, Math.min(newX, SLIDER_WIDTH));
      setSliderX(newX);
      pan.setValue(newX);
      setIsHandleActive(false);
    },
  });

  // For handle position
  React.useEffect(() => {
    pan.setValue(sliderX);
  }, [sliderX]);

  // Font size based on slider position (min 12px, max 20px)
  const fontSize = 12 + ((sliderX / SLIDER_WIDTH) * 8);

  // Nav icons
  const navIcons = [
    { key: 'book', icon: <Feather name="book" size={24} color="#FFFFFF" /> },
    { key: 'grid', icon: <Feather name="grid" size={24} color="#FFFFFF" /> },
    { key: 'plus', icon: <Feather name="plus" size={24} color="#FFFFFF" /> },
    { key: 'bell', icon: <Feather name="bell" size={24} color="#FFFFFF" /> },
    { key: 'home', icon: <Feather name="home" size={24} color="#FFFFFF" /> },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {/* Title Bar */}
        <View style={styles.titleBar}>
          <TouchableOpacity
            style={styles.backArrowWrap}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: '#000000' }]}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Appearance and Accessibility</Text>
        </View>

        {/* Main Panel */}
        <View style={styles.panelWrap}>
          <View style={styles.panel}>
            {/* Theme Section */}
            <View style={styles.themeRow}>
              <Text style={styles.themeLabel}>Theme</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioBtn}
                  onPress={() => setTheme('light')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioOuter, theme === 'light' && styles.radioOuterActive]}>
                    {theme === 'light' ? <View style={styles.radioInner} /> : null}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioBtn}
                  onPress={() => setTheme('dark')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioOuter, theme === 'dark' && styles.radioOuterActive]}>
                    {theme === 'dark' ? <View style={styles.radioInner} /> : null}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Font Section */}
            <View style={styles.fontSection}>
              <Text style={styles.fontLabel}>Font</Text>
              <Text style={styles.fontSubtext}>Hover Typing will adjust</Text>
              {/* Slider */}
              <View style={styles.sliderWrap}>
                <Text style={styles.sliderA}>A</Text>
                <View style={styles.sliderTrackArea}>
                  <View style={styles.sliderTrack} />
                  <Animated.View
                    style={[
                      styles.sliderHandle,
                      {
                        left: pan,
                        backgroundColor: isHandleActive ? '#333' : '#000',
                      },
                    ]}
                    {...panResponder.panHandlers}
                  />
                </View>
                <Text style={styles.sliderA}>A</Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitActive && styles.submitBtnActive]}
              activeOpacity={0.7}
              onPressIn={() => setIsSubmitActive(true)}
              onPressOut={() => setIsSubmitActive(false)}
            >
              <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          {navIcons.map((item, idx) => (
            <TouchableOpacity
              key={item.key}
              style={styles.navIconWrap}
              activeOpacity={0.7}
              onPressIn={() => setActiveNav(idx)}
              onPressOut={() => setActiveNav(null)}
            >
              {React.cloneElement(item.icon, {
                color: activeNav === idx ? '#CCCCCC' : '#FFFFFF',
              })}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  root: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    height: 50,
    marginTop: 10,
    marginBottom: 10,
    position: 'relative',
  },
  backArrowWrap: {
    position: 'absolute',
    left: 20,
    height: 50,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 16,
    fontWeight: 'bold',
    height: 16,
    width: 16,
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    flex: 1,
  },
  panelWrap: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    padding: 20,
    justifyContent: 'flex-start',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  themeLabel: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#000000',
    fontWeight: '400',
    marginRight: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  radioBtn: {
    marginRight: 10,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterActive: {
    backgroundColor: '#000000',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  fontSection: {
    marginTop: 0,
  },
  fontLabel: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#000000',
    fontWeight: '400',
    marginBottom: 5,
  },
  fontSubtext: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#808080',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  sliderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 0,
    width: '100%',
    justifyContent: 'center',
  },
  sliderA: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#000000',
    marginHorizontal: 5,
  },
  sliderTrackArea: {
    width: SLIDER_WIDTH,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sliderTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: SLIDER_HEIGHT,
    backgroundColor: '#000000',
    borderRadius: 1,
    width: SLIDER_WIDTH,
    transform: [{ translateY: -1 }],
  },
  sliderHandle: {
    position: 'absolute',
    top: 7,
    width: SLIDER_HANDLE_DIAM,
    height: SLIDER_HANDLE_DIAM,
    borderRadius: SLIDER_HANDLE_DIAM / 2,
    backgroundColor: '#000000',
    borderWidth: 0,
    zIndex: 2,
  },
  submitBtn: {
    width: 100,
    height: 40,
    backgroundColor: '#000000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  submitBtnActive: {
    backgroundColor: '#333333',
  },
  submitBtnText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: NAV_HEIGHT,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
  },
  navIconWrap: {
    padding: 10,
    borderRadius: 20,
  },
});

export default AppearanceScreen; 