import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLanguagePreferences, setLanguagePreferences } from '../services/preferences/languagePreferences';

const LanguageRegional = ({ navigation }) => {
    const [currentLanguage, setCurrentLanguage] = useState('English');
    const [currentRegion, setCurrentRegion] = useState('Canada');
    const [currentCurrency, setCurrentCurrency] = useState('CAD');
    const [deviceTimezone, setDeviceTimezone] = useState('');
    const [currentDateFormat, setCurrentDateFormat] = useState('MM/DD/YYYY');
    const [currentTimeFormat, setCurrentTimeFormat] = useState('12-hour');
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [showRegionalDropdown, setShowRegionalDropdown] = useState(false);
    const [loading, setLoading] = useState(true);

    const [languageSettings, setLanguageSettings] = useState({
        autoDetectLanguage: true,
        showLanguageIndicator: true,
        translateReviews: false,
        translateNotifications: true
    });

    const [regionalSettings, setRegionalSettings] = useState({
        showLocalTime: true,
        showLocalCurrency: true,
        showLocalSalons: true,
        useMetricSystem: false,
        useDeviceTimezone: true
    });

    // Load saved preferences
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const prefs = await getLanguagePreferences();
            setCurrentLanguage(prefs.currentLanguage);
            setCurrentRegion(prefs.currentRegion);
            setCurrentCurrency(prefs.currentCurrency);
            setCurrentDateFormat(prefs.currentDateFormat);
            setCurrentTimeFormat(prefs.currentTimeFormat);
            setDeviceTimezone(prefs.deviceTimezone || '');
            setLanguageSettings(prefs.languageSettings);
            setRegionalSettings(prefs.regionalSettings);
            
            // If timezone not set, detect it
            if (!prefs.deviceTimezone) {
                detectDeviceTimezone();
            }
        } catch (error) {
            console.error('Error loading language preferences:', error);
            detectDeviceTimezone();
        } finally {
            setLoading(false);
        }
    };

    // Save preferences when any setting changes
    const savePreferences = useCallback(async (updates) => {
        try {
            const current = await getLanguagePreferences();
            const merged = { ...current, ...updates };
            await setLanguagePreferences(merged);
        } catch (error) {
            console.error('Error saving language preferences:', error);
        }
    }, []);

    // Auto-detect device timezone on component mount
    useEffect(() => {
        if (!deviceTimezone) {
            detectDeviceTimezone();
        }
    }, []);

    const detectDeviceTimezone = () => {
        try {
            // Get device timezone
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            setDeviceTimezone(timezone);
            
            // Get timezone offset
            const offset = new Date().getTimezoneOffset();
            const offsetHours = Math.abs(Math.floor(offset / 60));
            const offsetMinutes = Math.abs(offset % 60);
            const offsetString = offset <= 0 ? `+${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}` : `-${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;
            
            console.log('Device timezone detected:', timezone, `(UTC${offsetString})`);
        } catch (error) {
            console.log('Error detecting timezone:', error);
            setDeviceTimezone('Unknown');
        }
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
        { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
        { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
        { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
        { code: 'pt', name: 'Portuguese', flag: '🇵🇹', native: 'Português' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
        { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' }
    ];

    const regions = [
        { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', timezone: 'EST (UTC-5)' }
    ];

    const currencies = [
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
    ];

    const handleLanguageChange = async (language) => {
        setCurrentLanguage(language.name);
        await savePreferences({ currentLanguage: language.name });
        Alert.alert(
            'Language Changed',
            `App language changed to ${language.name}`,
            [{ text: 'OK' }]
        );
    };

    const handleRegionChange = async (region) => {
        setCurrentRegion(region.name);
        setCurrentCurrency(region.currency);
        await savePreferences({ 
            currentRegion: region.name,
            currentCurrency: region.currency 
        });
        Alert.alert(
            'Region Changed',
            `Region changed to ${region.name}`,
            [{ text: 'OK' }]
        );
    };

    const handleCurrencyChange = async (currency) => {
        setCurrentCurrency(currency.code);
        await savePreferences({ currentCurrency: currency.code });
        Alert.alert(
            'Currency Changed',
            `Currency changed to ${currency.name}`,
            [{ text: 'OK' }]
        );
    };

    const handleSettingChange = async (key, value) => {
        // Update local state immediately
        setLanguageSettings(prev => ({
            ...prev,
            [key]: value
        }));
        // Save to storage
        await savePreferences({ 
            languageSettings: { ...languageSettings, [key]: value }
        });
    };

    const handleRegionalSettingChange = async (key, value) => {
        // Update local state immediately
        setRegionalSettings(prev => ({
            ...prev,
            [key]: value
        }));
        // Save to storage
        await savePreferences({ 
            regionalSettings: { ...regionalSettings, [key]: value }
        });
    };

    const renderLanguageSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language</Text>
            
            <View style={styles.currentSetting}>
                <View style={styles.settingInfo}>
                    <Ionicons name="language" size={20} color="#AEB4F7" />
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Current Language</Text>
                        <Text style={styles.settingValue}>{currentLanguage}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}>
                    <Ionicons 
                        name={showLanguageDropdown ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#AEB4F7" 
                    />
                </TouchableOpacity>
            </View>

            {showLanguageDropdown && (
                <View style={styles.dropdownContainer}>
                    <ScrollView 
                        style={styles.dropdownScrollView}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        {languages.map((language) => (
                            <TouchableOpacity
                                key={language.code}
                                style={[
                                    styles.dropdownItem,
                                    currentLanguage === language.name && styles.selectedDropdownItem
                                ]}
                                onPress={() => {
                                    handleLanguageChange(language);
                                    setShowLanguageDropdown(false);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={styles.dropdownItemContent}>
                                    <Text style={styles.dropdownFlag}>{language.flag}</Text>
                                    <View style={styles.dropdownText}>
                                        <Text style={styles.dropdownName}>{language.name}</Text>
                                        <Text style={styles.dropdownNative}>{language.native}</Text>
                                    </View>
                                </View>
                                {currentLanguage === language.name && (
                                    <Ionicons name="checkmark" size={20} color="#AEB4F7" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.settingsSection}>
                <View style={styles.optionRow}>
                    <View style={styles.textContainer}>
                        <Text style={styles.optionText}>Auto-detect Language</Text>
                        <Text style={styles.explanationText}>Automatically detect and set your preferred language</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.customSwitch,
                            languageSettings.autoDetectLanguage ? styles.switchActive : styles.switchInactive
                        ]}
                        onPress={() => handleSettingChange('autoDetectLanguage', !languageSettings.autoDetectLanguage)}
                        activeOpacity={0.8}
                    >
                        <View style={[
                            styles.switchKnob,
                            languageSettings.autoDetectLanguage ? styles.knobActive : styles.knobInactive
                        ]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.optionRow}>
                    <View style={styles.textContainer}>
                        <Text style={styles.optionText}>Translate Notifications</Text>
                        <Text style={styles.explanationText}>Translate all notifications to your selected language</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.customSwitch,
                            languageSettings.translateNotifications ? styles.switchActive : styles.switchInactive
                        ]}
                        onPress={() => handleSettingChange('translateNotifications', !languageSettings.translateNotifications)}
                        activeOpacity={0.8}
                    >
                        <View style={[
                            styles.switchKnob,
                            languageSettings.translateNotifications ? styles.knobActive : styles.knobInactive
                        ]} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderRegionalSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Regional Settings</Text>
            
            <View style={styles.currentSetting}>
                <View style={styles.settingInfo}>
                    <Ionicons name="location" size={20} color="#AEB4F7" />
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Current Region</Text>
                        <Text style={styles.settingValue}>{currentRegion}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setShowRegionalDropdown(!showRegionalDropdown)}>
                    <Ionicons 
                        name={showRegionalDropdown ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#AEB4F7" 
                    />
                </TouchableOpacity>
            </View>

            {showRegionalDropdown && (
                <View style={styles.dropdownContainer}>
                    <ScrollView 
                        style={styles.dropdownScrollView}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        {regions.map((region) => (
                            <TouchableOpacity
                                key={region.code}
                                style={[
                                    styles.dropdownItem,
                                    currentRegion === region.name && styles.selectedDropdownItem
                                ]}
                                onPress={() => {
                                    handleRegionChange(region);
                                    setShowRegionalDropdown(false);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={styles.dropdownItemContent}>
                                    <Text style={styles.dropdownFlag}>{region.flag}</Text>
                                    <View style={styles.dropdownText}>
                                        <Text style={styles.dropdownName}>{region.name}</Text>
                                        <Text style={styles.dropdownDetails}>{region.currency} • {region.timezone}</Text>
                                    </View>
                                </View>
                                {currentRegion === region.name && (
                                    <Ionicons name="checkmark" size={20} color="#AEB4F7" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );

    const renderCurrencySection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currency</Text>
            
            <View style={styles.currentSetting}>
                <View style={styles.settingInfo}>
                    <Ionicons name="cash" size={20} color="#AEB4F7" />
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Current Currency</Text>
                        <Text style={styles.settingValue}>CAD (Canadian Dollar)</Text>
                    </View>
                </View>
                <View style={styles.currencyInfo}>
                    <Text style={styles.currencySymbol}>C$</Text>
                </View>
            </View>
            
            <View style={styles.infoMessage}>
                <Ionicons name="information-circle" size={16} color="#AEB4F7" />
                <Text style={styles.infoText}>Currently launching in Canada with CAD currency</Text>
            </View>
        </View>
    );

    const renderTimezoneSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timezone</Text>
            
            <View style={styles.currentSetting}>
                <View style={styles.settingInfo}>
                    <Ionicons name="time" size={20} color="#AEB4F7" />
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Device Timezone</Text>
                        <Text style={styles.settingValue}>{deviceTimezone}</Text>
                    </View>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>

            <View style={styles.timezoneInfo}>
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={20} color="#2196F3" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoTitle}>Auto-Detected Timezone</Text>
                        <Text style={styles.infoDescription}>
                            Your device timezone is automatically detected and used for all time-related features including booking times, notifications, and salon hours.
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderRegionalSettings = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Regional Preferences</Text>
            
            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Show Local Time</Text>
                    <Text style={styles.explanationText}>Display times in your local timezone</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        regionalSettings.showLocalTime ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleRegionalSettingChange('showLocalTime', !regionalSettings.showLocalTime)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        regionalSettings.showLocalTime ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Show Local Currency</Text>
                    <Text style={styles.explanationText}>Display prices in your local currency</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        regionalSettings.showLocalCurrency ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleRegionalSettingChange('showLocalCurrency', !regionalSettings.showLocalCurrency)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        regionalSettings.showLocalCurrency ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Show Local Salons</Text>
                    <Text style={styles.explanationText}>Prioritize salons in your area</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        regionalSettings.showLocalSalons ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleRegionalSettingChange('showLocalSalons', !regionalSettings.showLocalSalons)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        regionalSettings.showLocalSalons ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.optionText}>Use Metric System</Text>
                    <Text style={styles.explanationText}>Display distances in kilometers</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        regionalSettings.useMetricSystem ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => handleRegionalSettingChange('useMetricSystem', !regionalSettings.useMetricSystem)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        regionalSettings.useMetricSystem ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Language & Regional</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Language Section */}
                {renderLanguageSection()}

                {/* Regional Section */}
                {renderRegionalSection()}

                {/* Currency Section */}
                {renderCurrencySection()}

                {/* Timezone Section */}
                {renderTimezoneSection()}

                {/* Regional Settings */}
                {renderRegionalSettings()}

                {/* Information */}
                <View style={styles.infoSection}>
                    <Ionicons name="information-circle" size={20} color="#666" />
                    <Text style={styles.infoText}>
                        These settings help personalize your experience by showing content in your preferred language and regional format.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    currentSetting: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 14,
        color: '#666',
    },
    settingValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
        marginTop: 2,
    },
    languageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    languageCard: {
        width: '48%',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 8,
        alignItems: 'center',
    },
    selectedCard: {
        borderColor: '#AEB4F7',
        backgroundColor: '#F0F8FF',
    },
    languageFlag: {
        fontSize: 24,
        marginBottom: 4,
    },
    languageName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
    },
    languageNative: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 2,
    },
    regionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    regionCard: {
        width: '48%',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 8,
        alignItems: 'center',
    },
    regionFlag: {
        fontSize: 24,
        marginBottom: 4,
    },
    regionName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
    },
    regionCurrency: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        marginTop: 2,
    },
    currencyList: {
        marginBottom: 16,
    },
    currencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 8,
    },
    selectedItem: {
        borderColor: '#AEB4F7',
        backgroundColor: '#F0F8FF',
    },
    currencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: '600',
        color: '#AEB4F7',
        marginRight: 12,
    },
    currencyDetails: {
        flex: 1,
    },
    currencyCode: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    currencyName: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    timezoneInfo: {
        marginBottom: 16,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    infoText: {
        marginLeft: 12,
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976D2',
        marginBottom: 4,
    },
    infoDescription: {
        fontSize: 12,
        color: '#424242',
        lineHeight: 16,
    },
    settingsSection: {
        marginTop: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    optionText: {
        fontSize: 16,
        color: '#111',
        fontWeight: '500',
    },
    explanationText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        lineHeight: 18,
    },
    infoSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#F8F8F8',
        marginHorizontal: 16,
        marginVertical: 20,
        borderRadius: 8,
    },
    infoMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F0F4FF',
        borderRadius: 8,
        marginTop: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
        lineHeight: 20,
    },
    // Custom Switch Styles
    customSwitch: {
        width: 40,
        height: 25,
        borderRadius: 12.5,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    switchActive: {
        backgroundColor: '#8B91B4',
    },
    switchInactive: {
        backgroundColor: '#555555',
    },
    switchKnob: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    knobActive: {
        alignSelf: 'flex-end',
    },
    knobInactive: {
        alignSelf: 'flex-start',
    },
    // Dropdown Styles
    dropdownContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginTop: 8,
        maxHeight: 300,
        overflow: 'hidden',
    },
    dropdownScrollView: {
        maxHeight: 300,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    selectedDropdownItem: {
        backgroundColor: '#F0F8FF',
        borderLeftWidth: 3,
        borderLeftColor: '#AEB4F7',
    },
    dropdownItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dropdownFlag: {
        fontSize: 24,
        marginRight: 12,
    },
    dropdownText: {
        flex: 1,
    },
    dropdownName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 2,
    },
    dropdownNative: {
        fontSize: 12,
        color: '#666',
    },
    dropdownDetails: {
        fontSize: 12,
        color: '#666',
    },
});

export default LanguageRegional;