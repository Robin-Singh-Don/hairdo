import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const AccountSettings = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Center</Text>
                <View style={{ width: 32 }} /> {/* Placeholder for alignment */}
            </View>
            <ScrollView contentContainerStyle={styles.containerNew}>
                {/* Profile Image */}
                <View style={styles.profileSection}>
                    <Image
                    source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }} // Replace with your image URL
                    style={styles.profileImage}
                    />
                    <Text style={styles.profileName}>Shark</Text>
                </View>

                        {/* User Info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                    <Text style={styles.label}>First name</Text>
                    <Text style={styles.value}>Shark</Text>
                    </View>
                    <View style={styles.infoColumn}>
                    <Text style={styles.label}>Last name</Text>
                    <Text style={styles.value}>Arora</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoColumnFull}>
                    <Text style={styles.label}>Mobile number</Text>
                    <Text style={styles.value}>7786364020</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                    <Text style={styles.label}>Date of birth</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Text style={styles.value}>10</Text>
                        <Text style={[styles.value, { marginHorizontal: 4 }]}>Jun</Text>
                        <Text style={styles.value}>2000</Text>
                    </View>
                    </View>
                    <View style={styles.infoColumn}>
                    <Text style={styles.label}>Gender</Text>
                    <Text style={styles.value}>Male</Text>
                    </View>
                </View>

                {/* Bio */}
                <View style={styles.bioSection}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                    style={styles.bioInput}
                    placeholder="Bio.."
                    placeholderTextColor="#9c9494ed"
                    multiline
                    />
                </View>

                {/* Buttons */}
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Change password</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Two-factor authentication</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        //  flex: 1, 
        backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        paddingHorizontal: 8,
        justifyContent: 'space-between',
    },
    backArrow: {
        fontSize: 28,
        color: '#000',
        width: 32,
        textAlign: 'left',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        textAlign: 'center',
    },
    containerNew: {
        alignItems: 'center',
        padding: 28,
        backgroundColor: '#fff',
        paddingBottom: 40,
      },
      profileSection: {
        alignItems: 'center',
        marginBottom: 18,
      },
      profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 8,
        backgroundColor: '#eee',
      },
      profileName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
      },
      infoRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 10,
        justifyContent: 'space-between',
      },
      infoColumn: {
        flex: 1,
        marginRight: 10,
      },
      infoColumnFull: {
        flex: 1,
      },
      label: {
        fontSize: 11,
        color: '#888',
        marginBottom: 2,
      },
      value: {
        fontSize: 14,
        color: '#111',
        fontWeight: '500',
      },
      bioSection: {
        width: '100%',
        marginBottom: 18,
      },
      bioInput: {
        borderWidth: 1,
        borderColor: '#c6baba',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        minHeight: 50,
        marginTop: 2,
        backgroundColor: '#fafafa',
      },
      button: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#c4bcbc',
        paddingVertical: 6,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'space-between',
      },
      buttonText: {
        fontSize: 15,
        color: '#111',
        fontWeight: '500',
      },
      chevron: {
        fontSize: 22,
        color: '#bbb',
        fontWeight: 'bold',
      },
});

export default AccountSettings;