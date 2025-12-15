import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsAndPolicies = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('terms'); // 'terms' or 'privacy'

    const renderTermsContent = () => (
        <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                <Text style={styles.sectionText}>
                    By accessing and using the HairDo mobile application ("App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Description of Service</Text>
                <Text style={styles.sectionText}>
                    HairDo is a mobile application that connects users with barbers and salons for appointment booking services. The App allows users to browse salons, book appointments, manage their bookings, and access loyalty rewards.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. User Accounts</Text>
                <Text style={styles.sectionText}>
                    You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Booking and Payment</Text>
                <Text style={styles.sectionText}>
                    • All bookings are subject to availability and confirmation by the salon.{'\n'}
                    • Payment is processed at the time of booking.{'\n'}
                    • Prices are subject to change without notice.{'\n'}
                    • Cancellations must be made at least 2 hours before the appointment.{'\n'}
                    • No-shows may result in charges or account restrictions.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Cancellation Policy</Text>
                <Text style={styles.sectionText}>
                    • Free cancellation up to 2 hours before appointment.{'\n'}
                    • Late cancellations may incur charges.{'\n'}
                    • No-shows will be charged the full service price.{'\n'}
                    • Emergency cancellations will be reviewed on a case-by-case basis.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>6. User Conduct</Text>
                <Text style={styles.sectionText}>
                    You agree not to:{'\n'}
                    • Use the service for any unlawful purpose{'\n'}
                    • Harass or abuse salon staff{'\n'}
                    • Provide false or misleading information{'\n'}
                    • Attempt to gain unauthorized access to the system{'\n'}
                    • Interfere with the proper working of the service
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
                <Text style={styles.sectionText}>
                    The App and its original content, features, and functionality are owned by HairDo and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
                <Text style={styles.sectionText}>
                    HairDo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>9. Dispute Resolution</Text>
                <Text style={styles.sectionText}>
                    Any disputes arising from the use of this service shall be resolved through binding arbitration in accordance with the laws of the jurisdiction where HairDo operates.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
                <Text style={styles.sectionText}>
                    We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the App. Continued use of the service constitutes acceptance of the modified terms.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>11. Contact Information</Text>
                <Text style={styles.sectionText}>
                    If you have any questions about these Terms of Service, please contact us at:{'\n'}
                    Email: legal@hairdo.com{'\n'}
                    Phone: 1-800-HAIRDO{'\n'}
                    Address: HairDo Legal Department, 123 Main Street, City, State 12345
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    By using the HairDo app, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </Text>
            </View>
        </View>
    );

    const renderPrivacyContent = () => (
        <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
            
            <View style={styles.section}>
                <Text style={styles.sectionText}>
                    At HairDo, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                <Text style={styles.sectionText}>
                    <Text style={styles.bold}>Personal Information:</Text>{'\n'}
                    • Name, email address, phone number{'\n'}
                    • Payment information (processed securely){'\n'}
                    • Profile information and preferences{'\n'}
                    • Booking history and service preferences{'\n\n'}
                    <Text style={styles.bold}>Location Information:</Text>{'\n'}
                    • GPS location to find nearby salons{'\n'}
                    • Location data for service area verification{'\n\n'}
                    <Text style={styles.bold}>Device Information:</Text>{'\n'}
                    • Device type and operating system{'\n'}
                    • App usage statistics{'\n'}
                    • Crash reports and performance data
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                <Text style={styles.sectionText}>
                    We use your information to:{'\n'}
                    • Process and manage your bookings{'\n'}
                    • Provide customer support{'\n'}
                    • Send appointment reminders and updates{'\n'}
                    • Process payments and manage billing{'\n'}
                    • Improve our services and user experience{'\n'}
                    • Send promotional offers (with your consent){'\n'}
                    • Ensure app security and prevent fraud
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Information Sharing</Text>
                <Text style={styles.sectionText}>
                    We may share your information with:{'\n\n'}
                    <Text style={styles.bold}>Salons and Barbers:</Text>{'\n'}
                    • Booking details and appointment information{'\n'}
                    • Contact information for appointment coordination{'\n\n'}
                    <Text style={styles.bold}>Service Providers:</Text>{'\n'}
                    • Payment processors for secure transactions{'\n'}
                    • Cloud storage providers for data backup{'\n'}
                    • Analytics services to improve our app{'\n\n'}
                    <Text style={styles.bold}>Legal Requirements:</Text>{'\n'}
                    • When required by law or court order{'\n'}
                    • To protect our rights and safety{'\n'}
                    • To investigate fraud or security issues
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Data Security</Text>
                <Text style={styles.sectionText}>
                    We implement industry-standard security measures to protect your information:{'\n\n'}
                    • Encryption of data in transit and at rest{'\n'}
                    • Secure payment processing{'\n'}
                    • Regular security audits and updates{'\n'}
                    • Access controls and authentication{'\n'}
                    • Secure data centers and infrastructure
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Your Rights and Choices</Text>
                <Text style={styles.sectionText}>
                    You have the right to:{'\n\n'}
                    • Access your personal information{'\n'}
                    • Correct inaccurate data{'\n'}
                    • Delete your account and data{'\n'}
                    • Opt-out of marketing communications{'\n'}
                    • Control location permissions{'\n'}
                    • Request data portability{'\n'}
                    • File a complaint with authorities
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
                <Text style={styles.sectionText}>
                    We use cookies and similar technologies to:{'\n\n'}
                    • Remember your preferences{'\n'}
                    • Analyze app usage and performance{'\n'}
                    • Provide personalized content{'\n'}
                    • Improve our services{'\n\n'}
                    You can control cookie settings in your device preferences.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
                <Text style={styles.sectionText}>
                    Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>8. International Data Transfers</Text>
                <Text style={styles.sectionText}>
                    Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>9. Data Retention</Text>
                <Text style={styles.sectionText}>
                    We retain your information for as long as necessary to:{'\n\n'}
                    • Provide our services{'\n'}
                    • Comply with legal obligations{'\n'}
                    • Resolve disputes{'\n'}
                    • Enforce our agreements{'\n\n'}
                    You may request deletion of your data at any time.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
                <Text style={styles.sectionText}>
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by:{'\n\n'}
                    • Sending an email to your registered address{'\n'}
                    • Displaying a notice in the app{'\n'}
                    • Updating the "Last updated" date{'\n\n'}
                    Continued use of the app after changes constitutes acceptance of the updated policy.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>11. Contact Us</Text>
                <Text style={styles.sectionText}>
                    If you have questions about this Privacy Policy or our data practices, please contact us:{'\n\n'}
                    Email: privacy@hairdo.com{'\n'}
                    Phone: 1-800-HAIRDO{'\n'}
                    Address: HairDo Privacy Team, 123 Main Street, City, State 12345{'\n\n'}
                    We will respond to your inquiry within 30 days.
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    By using the HairDo app, you acknowledge that you have read and understood this Privacy Policy and consent to the collection and use of your information as described herein.
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms and Policies</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'terms' && styles.activeTab]} 
                    onPress={() => setActiveTab('terms')}
                >
                    <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>
                        Terms of Service
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'privacy' && styles.activeTab]} 
                    onPress={() => setActiveTab('privacy')}
                >
                    <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>
                        Privacy Policy
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {activeTab === 'terms' ? renderTermsContent() : renderPrivacyContent()}
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 8,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#AEB4F7',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    lastUpdated: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    bold: {
        fontWeight: '600',
    },
    footer: {
        marginTop: 32,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default TermsAndPolicies; 