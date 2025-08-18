import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RewardClaimPopup from './RewardClaimPopup';
import { useRewards } from './RewardsContext';

const LoyaltyRewards = ({ navigation }) => {
    const [userData, setUserData] = useState({
        currentPoints: 850,
        totalPoints: 1250,
        tier: 'Gold',
        tierProgress: 75, // percentage to next tier
        nextTier: 'Platinum',
        pointsToNextTier: 150,
        memberSince: 'March 2023',
        totalBookings: 24,
        totalSavings: 180,
        referralCode: 'SHARK2024',
        referralCount: 3
    });

    const [showRewardPopup, setShowRewardPopup] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const { claimedRewards, addClaimedReward } = useRewards();

    const [rewards] = useState([
        {
            id: '1',
            title: 'Free Haircut',
            description: 'Get a free haircut after 5 bookings',
            pointsRequired: 500,
            isAvailable: true,
            icon: 'cut'
        },
        {
            id: '2',
            title: '20% Off Beard Trim',
            description: 'Save 20% on beard trimming services',
            pointsRequired: 200,
            isAvailable: true,
            icon: 'pricetag'
        },
        {
            id: '3',
            title: 'Free Styling',
            description: 'Free styling service with any haircut',
            pointsRequired: 300,
            isAvailable: false,
            icon: 'star'
        },
        {
            id: '4',
            title: 'VIP Treatment',
            description: 'Priority booking and special treatment',
            pointsRequired: 1000,
            isAvailable: true,
            icon: 'diamond'
        }
    ]);

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

    const renderRewardsSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            {rewards.map((reward) => (
                <TouchableOpacity
                    key={reward.id}
                    style={[styles.rewardCard, !reward.isAvailable && styles.disabledCard]}
                    onPress={() => handleRewardPress(reward)}
                    disabled={!reward.isAvailable}
                >
                    <View style={styles.rewardInfo}>
                        <Ionicons name={reward.icon} size={24} color="#AEB4F7" />
                        <View style={styles.rewardText}>
                            <Text style={styles.rewardTitle}>{reward.title}</Text>
                            <Text style={styles.rewardDescription}>{reward.description}</Text>
                        </View>
                    </View>
                    <View style={styles.rewardPoints}>
                        <Text style={styles.pointsText}>{reward.pointsRequired}</Text>
                        <Text style={styles.pointsLabel}>points</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderSpecialOffers = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            {specialOffers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                    <View style={styles.offerInfo}>
                        <Ionicons name={offer.icon} size={24} color="#FF6B6B" />
                        <View style={styles.offerText}>
                            <Text style={styles.offerTitle}>{offer.title}</Text>
                            <Text style={styles.offerDescription}>{offer.description}</Text>
                            <Text style={styles.offerValid}>Valid until: {offer.validUntil}</Text>
                        </View>
                    </View>
                </View>
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
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Loyalty & Rewards</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Tier Card */}
                {renderTierCard()}

                {/* Rewards Section */}
                {renderRewardsSection()}

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
    tierCard: {
        margin: 16,
        padding: 20,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
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
        color: '#666',
        marginTop: 4,
    },
    progressSection: {
        marginTop: 8,
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E9ECEF',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#AEB4F7',
        borderRadius: 3,
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
    rewardCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 12,
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
        color: '#666',
        marginTop: 2,
    },
    rewardPoints: {
        alignItems: 'center',
    },
    pointsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#AEB4F7',
    },
    pointsLabel: {
        fontSize: 12,
        color: '#666',
    },
    offerCard: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFE5E5',
        marginBottom: 12,
    },
    offerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
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
        color: '#666',
        marginTop: 2,
    },
    offerValid: {
        fontSize: 12,
        color: '#FF6B6B',
        marginTop: 4,
    },
    referralCard: {
        padding: 16,
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0F0FF',
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
        color: '#666',
        marginTop: 2,
    },
    referralStats: {
        alignItems: 'center',
        marginBottom: 16,
    },
    referralCode: {
        fontSize: 24,
        fontWeight: '600',
        color: '#AEB4F7',
        letterSpacing: 2,
    },
    referralCount: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#AEB4F7',
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
        backgroundColor: '#AEB4F7',
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
        color: '#666',
        textAlign: 'center',
        lineHeight: 16,
    },
    claimedRewardCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#F8FFF8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D4EDDA',
        marginBottom: 12,
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
        color: '#666',
        marginTop: 2,
    },
    claimedRewardDate: {
        fontSize: 12,
        color: '#28A745',
        marginTop: 4,
        fontWeight: '500',
    },
    claimedRewardStatus: {
        alignItems: 'center',
    },
    claimedRewardStatusText: {
        fontSize: 12,
        color: '#28A745',
        marginTop: 4,
        fontWeight: '500',
    },
});

export default LoyaltyRewards;