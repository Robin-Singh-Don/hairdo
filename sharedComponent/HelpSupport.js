import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpSupport = ({ navigation }) => {
    const [expandedFaq, setExpandedFaq] = useState(null);

    const faqData = [
        {
            id: 1,
            question: "How do I book an appointment?",
            answer: "To book an appointment, go to the Explore page, select a service, choose a salon, pick a barber, and select your preferred time slot. You can also use the 'Book Directly' option for ASAP appointments.",
            category: "Booking"
        },
        {
            id: 2,
            question: "Can I cancel or reschedule my appointment?",
            answer: "Yes, you can cancel or reschedule appointments up to 2 hours before your scheduled time. Go to your booking history and select the appointment you want to modify.",
            category: "Booking"
        },
        {
            id: 3,
            question: "How do I find salons near me?",
            answer: "The app automatically shows salons near your location. You can also use the search function to find specific salons or filter by services, ratings, or distance.",
            category: "Location"
        },
        {
            id: 4,
            question: "What payment methods are accepted?",
            answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital wallets like Apple Pay and Google Pay.",
            category: "Payment"
        },
        {
            id: 5,
            question: "How do I earn loyalty points?",
            answer: "Earn points by booking appointments, referring friends, and leaving reviews. Points can be redeemed for discounts on future appointments.",
            category: "Loyalty"
        },
        {
            id: 6,
            question: "Is my personal information secure?",
            answer: "Yes, we use industry-standard encryption to protect your personal and payment information. You can manage your privacy settings in the app.",
            category: "Security"
        },
        {
            id: 7,
            question: "What if I'm not satisfied with my service?",
            answer: "If you're not satisfied, please contact us within 24 hours of your appointment. We'll work with the salon to resolve any issues.",
            category: "Service"
        },
        {
            id: 8,
            question: "How do I contact customer support?",
            answer: "You can contact us through the in-app chat or email at support@hairdo.com. We're available 24/7.",
            category: "Support"
        }
    ];

    const supportOptions = [
        {
            id: 1,
            title: "Live Chat",
            subtitle: "Get instant help from our support team",
            icon: "chatbubbles",
            action: () => handleLiveChat()
        },
        {
            id: 2,
            title: "Email Support",
            subtitle: "Send us a detailed message",
            icon: "mail",
            action: () => handleEmailSupport()
        }
    ];

    const quickActions = [
        {
            id: 1,
            title: "Report an Issue",
            subtitle: "Report bugs or technical problems",
            icon: "bug",
            action: () => handleReportIssue()
        },
        {
            id: 2,
            title: "Request Feature",
            subtitle: "Suggest new features",
            icon: "bulb",
            action: () => handleRequestFeature()
        },
        {
            id: 3,
            title: "App Feedback",
            subtitle: "Share your experience",
            icon: "star",
            action: () => handleAppFeedback()
        },
        {
            id: 4,
            title: "Emergency Contact",
            subtitle: "Urgent support needed",
            icon: "warning",
            action: () => handleEmergencyContact()
        }
    ];

    const handleLiveChat = () => {
        Alert.alert(
            'Live Chat',
            'Connecting you to our support team...',
            [{ text: 'OK' }]
        );
    };

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@hairdo.com?subject=Support Request');
    };




    const handleReportIssue = () => {
        Alert.alert(
            'Report Issue',
            'Please describe the issue you\'re experiencing and we\'ll get back to you within 24 hours.',
            [{ text: 'OK' }]
        );
    };

    const handleRequestFeature = () => {
        Alert.alert(
            'Request Feature',
            'We\'d love to hear your feature suggestions! Please describe what you\'d like to see.',
            [{ text: 'OK' }]
        );
    };

    const handleAppFeedback = () => {
        Alert.alert(
            'App Feedback',
            'Your feedback helps us improve! Please share your experience with us.',
            [{ text: 'OK' }]
        );
    };

    const handleEmergencyContact = () => {
        Alert.alert(
            'Emergency Contact',
            'For urgent matters, please contact us immediately through live chat or email.',
            [{ text: 'OK' }]
        );
    };

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const renderSupportOptions = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get Help</Text>
            
            {supportOptions.map((option) => (
                <TouchableOpacity
                    key={option.id}
                    style={styles.supportOption}
                    onPress={option.action}
                >
                    <View style={styles.optionInfo}>
                        <View style={styles.optionIcon}>
                            <Ionicons name={option.icon} size={24} color="#AEB4F7" />
                        </View>
                        <View style={styles.optionText}>
                            <Text style={styles.optionTitle}>{option.title}</Text>
                            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderQuickActions = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.quickActionsGrid}>
                {quickActions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={styles.quickActionCard}
                        onPress={action.action}
                    >
                        <View style={styles.quickActionIcon}>
                            <Ionicons name={action.icon} size={24} color="#AEB4F7" />
                        </View>
                        <Text style={styles.quickActionTitle}>{action.title}</Text>
                        <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderFAQ = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            {faqData.map((faq) => (
                <TouchableOpacity
                    key={faq.id}
                    style={styles.faqItem}
                    onPress={() => toggleFaq(faq.id)}
                >
                    <View style={styles.faqHeader}>
                        <View style={styles.faqInfo}>
                            <Text style={styles.faqCategory}>{faq.category}</Text>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                        </View>
                        <Ionicons
                            name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#AEB4F7"
                        />
                    </View>
                    {expandedFaq === faq.id && (
                        <View style={styles.faqAnswer}>
                            <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderTroubleshooting = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Troubleshooting</Text>
            
            <View style={styles.troubleshootingCard}>
                <View style={styles.troubleshootingHeader}>
                    <Ionicons name="construct" size={24} color="#AEB4F7" />
                    <Text style={styles.troubleshootingTitle}>Common Issues</Text>
                </View>
                
                <View style={styles.issueItem}>
                    <Text style={styles.issueTitle}>App won't load</Text>
                    <Text style={styles.issueSolution}>Try restarting the app or check your internet connection</Text>
                </View>
                
                <View style={styles.issueItem}>
                    <Text style={styles.issueTitle}>Can't find nearby salons</Text>
                    <Text style={styles.issueSolution}>Enable location services in your device settings</Text>
                </View>
                
                <View style={styles.issueItem}>
                    <Text style={styles.issueTitle}>Payment failed</Text>
                    <Text style={styles.issueSolution}>Check your card details or try a different payment method</Text>
                </View>
                
                <View style={styles.issueItem}>
                    <Text style={styles.issueTitle}>No available time slots</Text>
                    <Text style={styles.issueSolution}>Try a different date or contact the salon directly</Text>
                </View>
            </View>
        </View>
    );

    const renderResources = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Helpful Resources</Text>
            
            <TouchableOpacity style={styles.resourceItem}>
                <Ionicons name="document-text" size={20} color="#AEB4F7" />
                <View style={styles.resourceText}>
                    <Text style={styles.resourceTitle}>User Guide</Text>
                    <Text style={styles.resourceSubtitle}>Complete guide to using the app</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resourceItem}>
                <Ionicons name="shield-checkmark" size={20} color="#AEB4F7" />
                <View style={styles.resourceText}>
                    <Text style={styles.resourceTitle}>Privacy Policy</Text>
                    <Text style={styles.resourceSubtitle}>How we protect your data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resourceItem}>
                <Ionicons name="document" size={20} color="#AEB4F7" />
                <View style={styles.resourceText}>
                    <Text style={styles.resourceTitle}>Terms of Service</Text>
                    <Text style={styles.resourceSubtitle}>Our terms and conditions</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Support Options */}
                {renderSupportOptions()}

                {/* Quick Actions */}
                {renderQuickActions()}

                {/* FAQ */}
                {renderFAQ()}

                {/* Troubleshooting */}
                {renderTroubleshooting()}

                {/* Resources */}
                {renderResources()}

                {/* Contact Info */}
                <View style={styles.contactSection}>
                    <View style={styles.contactCard}>
                        <Ionicons name="information-circle" size={24} color="#AEB4F7" />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactTitle}>Need More Help?</Text>
                            <Text style={styles.contactText}>
                                Our support team is available 24/7 to help you with any questions or issues.
                            </Text>
                            <Text style={styles.contactEmail}>support@hairdo.com</Text>
                        </View>
                    </View>
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
    supportOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        marginBottom: 12,
    },
    optionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    optionSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        width: '48%',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
        marginBottom: 4,
    },
    quickActionSubtitle: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
    faqItem: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    faqInfo: {
        flex: 1,
    },
    faqCategory: {
        fontSize: 12,
        color: '#AEB4F7',
        fontWeight: '500',
        marginBottom: 4,
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    faqAnswer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    faqAnswerText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    troubleshootingCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 16,
    },
    troubleshootingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    troubleshootingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginLeft: 8,
    },
    issueItem: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    issueTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        marginBottom: 4,
    },
    issueSolution: {
        fontSize: 12,
        color: '#666',
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    resourceText: {
        flex: 1,
        marginLeft: 12,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    resourceSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    contactSection: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    contactCard: {
        flexDirection: 'row',
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#AEB4F7',
    },
    contactInfo: {
        marginLeft: 12,
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    contactEmail: {
        fontSize: 14,
        color: '#AEB4F7',
        fontWeight: '500',
        marginBottom: 4,
    },
});

export default HelpSupport;