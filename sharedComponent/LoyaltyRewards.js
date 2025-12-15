import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RewardClaimPopup from './RewardClaimPopup';
import { useRewards } from './RewardsContext';
import { getDefaultUserData, getDefaultRewards } from '../constants/PointsConfig';

const LoyaltyRewards = ({ navigation }) => {
    const [userData, setUserData] = useState(getDefaultUserData());

    const [showRewardPopup, setShowRewardPopup] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const { claimedRewards, addClaimedReward } = useRewards();
    
    // New features state
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [autoRedeemEnabled, setAutoRedeemEnabled] = useState(false);

    const [rewards] = useState(getDefaultRewards());

    const [specialOffers] = useState([
        {
            id: '1',
            title: 'Double Points Week',
            description: 'Earn double points on all bookings this week',
            validUntil: 'Dec 31, 2024',
            icon: 'gift'
        },
        {
            id: '2',
            title: 'Referral Bonus',
            description: 'Get 100 points for each friend who books',
            validUntil: 'Ongoing',
            icon: 'people'
        },
        {
            id: '3',
            title: 'Birthday Special',
            description: '50% off on your birthday month',
            validUntil: 'Jan 15, 2024',
            icon: 'cake'
        }
    ]);

    const handleRewardPress = (reward) => {
        if (reward.isAvailable) {
            setSelectedReward(reward);
            setShowRewardPopup(true);
        }
    };

    const handleClaimReward = (reward) => {
        if (userData.currentPoints >= reward.pointsRequired) {
            // Deduct points
            setUserData(prev => ({
                ...prev,
                currentPoints: prev.currentPoints - reward.pointsRequired
            }));
            
            // Add to claimed rewards using context
            addClaimedReward(reward);
            
            // Show success message
            Alert.alert(
                'Reward Claimed!',
                `You have successfully claimed "${reward.title}"!`,
                [{ text: 'OK' }]
            );
        }
    };

    const handleRedeemReward = (reward) => {
        Alert.alert(
            'Redeem Reward',
            `Are you sure you want to redeem "${reward.title}" for ${reward.pointsRequired} points?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Redeem', onPress: () => console.log('Reward redeemed:', reward.title) }
            ]
        );
    };

    const handleShareReferral = () => {
        Alert.alert(
            'Share Referral Code',
            `Share your referral code: ${userData.referralCode}`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Share', onPress: () => console.log('Referral code shared') }
            ]
        );
    };

    const renderTierCard = () => (
        <View style={styles.tierCard}>
            <View style={styles.tierHeader}>
                <Ionicons name="diamond" size={24} color="#FFD700" />
                <Text style={styles.tierTitle}>{userData.tier} Member</Text>
            </View>
            <View style={styles.tierStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userData.currentPoints}</Text>
                    <Text style={styles.statLabel}>Current Points</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userData.totalPoints}</Text>
                    <Text style={styles.statLabel}>Total Earned</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>${userData.totalSavings}</Text>
                    <Text style={styles.statLabel}>Total Saved</Text>
                </View>
            </View>
            <View style={styles.progressSection}>
                <Text style={styles.progressText}>
                    {userData.pointsToNextTier} points to {userData.nextTier}
                </Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${userData.tierProgress}%` }]} />
                </View>
            </View>
        </View>
    );

    const renderRewardsSettingsSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reward Settings</Text>
            
            {/* Toggle notifications for new reward campaigns */}
            <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                        <Ionicons name="notifications" size={24} color="#AEB4F7" />
                    </View>
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Reward Campaign Notifications</Text>
                        <Text style={styles.settingDescription}>Get notified about new reward campaigns and special offers</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        notificationsEnabled ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        notificationsEnabled ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>

            {/* Enable auto-redeem */}
            <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                        <Ionicons name="flash" size={24} color="#AEB4F7" />
                    </View>
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Auto-Redeem Points</Text>
                        <Text style={styles.settingDescription}>Automatically use points for discounts on your next booking</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[
                        styles.customSwitch,
                        autoRedeemEnabled ? styles.switchActive : styles.switchInactive
                    ]}
                    onPress={() => setAutoRedeemEnabled(!autoRedeemEnabled)}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.switchKnob,
                        autoRedeemEnabled ? styles.knobActive : styles.knobInactive
                    ]} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSpecialOffers = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            {specialOffers.map((offer) => (
                <TouchableOpacity 
                    key={offer.id} 
                    style={styles.offerCard}
                    onPress={() => navigation.navigate('PromotionsScreen')}
                    activeOpacity={0.8}
                >
                    <View style={styles.offerInfo}>
                        <Ionicons name={offer.icon} size={24} color="#FF6B6B" />
                        <View style={styles.offerText}>
                            <Text style={styles.offerTitle}>{offer.title}</Text>
                            <Text style={styles.offerDescription}>{offer.description}</Text>
                            <Text style={styles.offerValid}>Valid until: {offer.validUntil}</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderReferralSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refer & Earn</Text>
            <View style={styles.referralCard}>
                <View style={styles.referralInfo}>
                    <Ionicons name="people" size={24} color="#AEB4F7" />
                    <View style={styles.referralText}>
                        <Text style={styles.referralTitle}>Invite Friends</Text>
                        <Text style={styles.referralDescription}>
                            Share your referral code and earn 100 points for each friend who books
                        </Text>
                    </View>
                </View>
                <View style={styles.referralStats}>
                    <Text style={styles.referralCode}>{userData.referralCode}</Text>
                    <Text style={styles.referralCount}>{userData.referralCount} friends invited</Text>
                </View>
                <TouchableOpacity style={styles.shareButton} onPress={handleShareReferral}>
                    <Ionicons name="share" size={20} color="#fff" />
                    <Text style={styles.shareButtonText}>Share Code</Text>
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
                <Text style={styles.headerTitle}>Loyalty & Rewards</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Tier Card */}
                {renderTierCard()}

                {/* Reward Settings Section */}
                {renderRewardsSettingsSection()}

                {/* Special Offers */}
                {renderSpecialOffers()}

                {/* Referral Section */}
                {renderReferralSection()}

                {/* How It Works */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How It Works</Text>
                    <View style={styles.howItWorks}>
                        <View style={styles.stepCard}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <Text style={styles.stepTitle}>Book Services</Text>
                            <Text style={styles.stepDescription}>Earn points for every booking</Text>
                        </View>
                        <View style={styles.stepCard}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <Text style={styles.stepTitle}>Accumulate Points</Text>
                            <Text style={styles.stepDescription}>Build your points balance</Text>
                        </View>
                        <View style={styles.stepCard}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <Text style={styles.stepTitle}>Redeem Rewards</Text>
                            <Text style={styles.stepDescription}>Use points for discounts and free services</Text>
                        </View>
                    </View>
                </View>

                {/* Claimed Rewards Section */}
                {claimedRewards.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Claimed Rewards</Text>
                        {claimedRewards.map((claimedReward) => (
                            <View key={claimedReward.id} style={styles.claimedRewardCard}>
                                <View style={styles.claimedRewardInfo}>
                                    <Ionicons name={claimedReward.icon} size={24} color="#28A745" />
                                    <View style={styles.claimedRewardText}>
                                        <Text style={styles.claimedRewardTitle}>{claimedReward.title}</Text>
                                        <Text style={styles.claimedRewardDescription}>{claimedReward.description}</Text>
                                        <Text style={styles.claimedRewardDate}>
                                            Claimed on {new Date(claimedReward.claimedAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.claimedRewardStatus}>
                                    <Ionicons name="checkmark-circle" size={24} color="#28A745" />
                                    <Text style={styles.claimedRewardStatusText}>Claimed</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Reward Claim Popup */}
            <RewardClaimPopup
                isVisible={showRewardPopup}
                onClose={() => setShowRewardPopup(false)}
                reward={selectedReward}
                onClaimReward={handleClaimReward}
                userPoints={userData.currentPoints}
            />
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
        borderBottomColor: '#3c4c48',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    scrollView: {
        flex: 1,
    },
    tierCard: {
        margin: 16,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    tierHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    tierTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginLeft: 8,
    },
    tierStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    statLabel: {
        fontSize: 12,
        color: '#3c4c48',
        marginTop: 4,
    },
    progressSection: {
        marginTop: 8,
    },
    progressText: {
        fontSize: 14,
        color: '#3c4c48',
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(60,76,72,0.15)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#555555',
        borderRadius: 3,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(60,76,72,0.15)',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    rewardCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.08)',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disabledCard: {
        opacity: 0.5,
    },
    rewardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rewardText: {
        marginLeft: 12,
        flex: 1,
    },
    rewardTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    rewardDescription: {
        fontSize: 14,
        color: '#3c4c48',
        marginTop: 2,
    },
    rewardPoints: {
        alignItems: 'center',
    },
    pointsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#555555',
    },
    pointsLabel: {
        fontSize: 12,
        color: '#3c4c48',
    },
    offerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.15)',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    offerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    offerText: {
        marginLeft: 12,
        flex: 1,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    offerDescription: {
        fontSize: 14,
        color: '#3c4c48',
        marginTop: 2,
    },
    offerValid: {
        fontSize: 12,
        color: '#d72638',
        marginTop: 4,
        fontWeight: '500',
    },
    referralCard: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    referralInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    referralText: {
        marginLeft: 12,
        flex: 1,
    },
    referralTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    referralDescription: {
        fontSize: 14,
        color: '#3c4c48',
        marginTop: 2,
    },
    referralStats: {
        alignItems: 'center',
        marginBottom: 16,
    },
    referralCode: {
        fontSize: 24,
        fontWeight: '600',
        color: '#555555',
        letterSpacing: 2,
    },
    referralCount: {
        fontSize: 14,
        color: '#3c4c48',
        marginTop: 4,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#555555',
        paddingVertical: 12,
        borderRadius: 8,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    howItWorks: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stepCard: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#555555',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 12,
        color: '#3c4c48',
        textAlign: 'center',
        lineHeight: 16,
    },
    claimedRewardCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.15)',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    claimedRewardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    claimedRewardText: {
        marginLeft: 12,
        flex: 1,
    },
    claimedRewardTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    claimedRewardDescription: {
        fontSize: 14,
        color: '#3c4c48',
        marginTop: 2,
    },
    claimedRewardDate: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 4,
        fontWeight: '500',
    },
    claimedRewardStatus: {
        alignItems: 'center',
    },
    claimedRewardStatusText: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 4,
        fontWeight: '500',
    },
    
    // New Reward Settings Styles
    settingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(60,76,72,0.08)',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 12,
        color: '#3c4c48',
        lineHeight: 16,
    },
    
    // Custom Switch Styles (matching NotificationSettings)
    customSwitch: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    switchActive: {
        backgroundColor: '#AEB4F7',
    },
    switchInactive: {
        backgroundColor: '#E0E0E0',
    },
    switchKnob: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        alignSelf: 'flex-start',
        marginLeft: 2,
    },
    knobActive: {
        alignSelf: 'flex-end',
        marginLeft: 0,
        marginRight: 2,
    },
    knobInactive: {
        alignSelf: 'flex-start',
        marginLeft: 2,
        marginRight: 0,
    },
});

export default LoyaltyRewards;