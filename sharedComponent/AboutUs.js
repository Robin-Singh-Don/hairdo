import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutUs = ({ navigation }) => {
    const handleContact = () => {
        Linking.openURL('mailto:hello@hairdo.com');
    };

    const handleWebsite = () => {
        Linking.openURL('https://www.hairdo.com');
    };

    const handleSocialMedia = (platform) => {
        const urls = {
            facebook: 'https://facebook.com/hairdo',
            twitter: 'https://twitter.com/hairdo',
            instagram: 'https://instagram.com/hairdo',
            linkedin: 'https://linkedin.com/company/hairdo'
        };
        Linking.openURL(urls[platform]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Us</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Company Logo/Icon */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="cut" size={48} color="#AEB4F7" />
                        </View>
                        <Text style={styles.appName}>HairDo</Text>
                        <Text style={styles.appTagline}>Your Perfect Style, One Tap Away</Text>
                    </View>

                    {/* Mission Statement */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Our Mission</Text>
                        <Text style={styles.sectionText}>
                            At HairDo, we believe everyone deserves access to quality grooming services. Our mission is to connect people with the best barbers and salons in their area, making it easier than ever to look and feel your best.
                        </Text>
                    </View>

                    {/* What We Do */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What We Do</Text>
                        <View style={styles.featureList}>
                            <View style={styles.featureItem}>
                                <Ionicons name="search" size={20} color="#AEB4F7" />
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>Find the Best Salons</Text>
                                    <Text style={styles.featureDescription}>Discover top-rated barbers and salons near you</Text>
                                </View>
                            </View>
                            
                            <View style={styles.featureItem}>
                                <Ionicons name="calendar" size={20} color="#AEB4F7" />
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>Easy Booking</Text>
                                    <Text style={styles.featureDescription}>Book appointments with just a few taps</Text>
                                </View>
                            </View>
                            
                            <View style={styles.featureItem}>
                                <Ionicons name="star" size={20} color="#AEB4F7" />
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>Loyalty Rewards</Text>
                                    <Text style={styles.featureDescription}>Earn points and get discounts on services</Text>
                                </View>
                            </View>
                            
                            <View style={styles.featureItem}>
                                <Ionicons name="shield-checkmark" size={20} color="#AEB4F7" />
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>Secure Payments</Text>
                                    <Text style={styles.featureDescription}>Safe and secure payment processing</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Company Story */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Our Story</Text>
                        <Text style={styles.sectionText}>
                            Founded in 2024, HairDo was born from a simple idea: making great grooming services accessible to everyone. We started as a small team passionate about technology and style, and today we're proud to serve thousands of users across the country.
                        </Text>
                        <Text style={styles.sectionText}>
                            Our platform connects customers with skilled barbers and stylists, ensuring everyone can find the perfect service for their needs. We're committed to building a community where style meets convenience.
                        </Text>
                    </View>

                    {/* Statistics */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>By the Numbers</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>10,000+</Text>
                                <Text style={styles.statLabel}>Happy Customers</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>500+</Text>
                                <Text style={styles.statLabel}>Partner Salons</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>50+</Text>
                                <Text style={styles.statLabel}>Cities Served</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>4.8★</Text>
                                <Text style={styles.statLabel}>Average Rating</Text>
                            </View>
                        </View>
                    </View>

                    {/* Team */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Our Team</Text>
                        <Text style={styles.sectionText}>
                            HairDo is powered by a diverse team of developers, designers, customer service specialists, and grooming enthusiasts. We're united by our passion for creating the best possible experience for our users and salon partners.
                        </Text>
                    </View>

                    {/* Contact Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Get in Touch</Text>
                        <TouchableOpacity style={styles.contactItem} onPress={handleContact}>
                            <Ionicons name="mail" size={20} color="#AEB4F7" />
                            <View style={styles.contactText}>
                                <Text style={styles.contactTitle}>Email Us</Text>
                                <Text style={styles.contactValue}>hello@hairdo.com</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                        
                        <View style={styles.contactItem}>
                            <Ionicons name="call" size={20} color="#AEB4F7" />
                            <View style={styles.contactText}>
                                <Text style={styles.contactTitle}>Call Us</Text>
                                <Text style={styles.contactValue}>1-800-HAIRDO</Text>
                            </View>
                        </View>
                        
                        <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
                            <Ionicons name="globe" size={20} color="#AEB4F7" />
                            <View style={styles.contactText}>
                                <Text style={styles.contactTitle}>Visit Our Website</Text>
                                <Text style={styles.contactValue}>www.hairdo.com</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                    </View>

                    {/* Social Media */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Follow Us</Text>
                        <View style={styles.socialGrid}>
                            <TouchableOpacity style={styles.socialItem} onPress={() => handleSocialMedia('facebook')}>
                                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                                <Text style={styles.socialText}>Facebook</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.socialItem} onPress={() => handleSocialMedia('twitter')}>
                                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                                <Text style={styles.socialText}>Twitter</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.socialItem} onPress={() => handleSocialMedia('instagram')}>
                                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                                <Text style={styles.socialText}>Instagram</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.socialItem} onPress={() => handleSocialMedia('linkedin')}>
                                <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
                                <Text style={styles.socialText}>LinkedIn</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* App Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>App Information</Text>
                        <View style={styles.appInfo}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Version:</Text>
                                <Text style={styles.infoValue}>1.0.0</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Build:</Text>
                                <Text style={styles.infoValue}>2024.12.01</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Platform:</Text>
                                <Text style={styles.infoValue}>iOS & Android</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Size:</Text>
                                <Text style={styles.infoValue}>45.2 MB</Text>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            © 2024 HairDo. All rights reserved.
                        </Text>
                        <Text style={styles.footerText}>
                            Made with ❤️ for the grooming community
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
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    appTagline: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    sectionText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 12,
    },
    featureList: {
        marginTop: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureText: {
        marginLeft: 12,
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: 12,
        color: '#666',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        width: '48%',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#AEB4F7',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    contactText: {
        marginLeft: 12,
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    contactValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    socialGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    socialItem: {
        width: '48%',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    socialText: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
    appInfo: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 4,
    },
});

export default AboutUs; 