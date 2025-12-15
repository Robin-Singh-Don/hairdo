import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsOfService = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                        <Text style={styles.sectionTitle}>7. Privacy and Data</Text>
                        <Text style={styles.sectionText}>
                            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding the collection and use of your personal information.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
                        <Text style={styles.sectionText}>
                            The App and its original content, features, and functionality are owned by HairDo and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
                        <Text style={styles.sectionText}>
                            HairDo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>10. Dispute Resolution</Text>
                        <Text style={styles.sectionText}>
                            Any disputes arising from the use of this service shall be resolved through binding arbitration in accordance with the laws of the jurisdiction where HairDo operates.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
                        <Text style={styles.sectionText}>
                            We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the App. Continued use of the service constitutes acceptance of the modified terms.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>12. Contact Information</Text>
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

export default TermsOfService; 