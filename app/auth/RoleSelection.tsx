import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function RoleSelection() {
  const router = useRouter();
  const { login } = useAuth();

  const handleRoleSelection = (role: 'customer' | 'employee' | 'owner') => {
    console.log('Button pressed for role:', role);
    
    // Navigate directly based on role
    switch (role) {
      case 'customer':
        console.log('Navigating to customer explore page');
        router.push('/(customer)/explore');
        break;
      case 'employee':
        console.log('Navigating to employee AdminHomeScreen');
        router.push('/(employee)/AdminHomeScreen');
        break;
      case 'owner':
        console.log('Navigating to owner OwnerDashboard');
        router.push('/(owner)/OwnerDashboard');
        break;
      default:
        console.log('Unknown role, staying on role selection');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>Select how you want to use the app</Text>

        <View style={styles.roleContainer}>
          {/* Customer Role */}
          <TouchableOpacity
            style={[styles.roleCard, styles.customerCard]}
            onPress={() => handleRoleSelection('customer')}
          >
            <View style={styles.roleIcon}>
              <Ionicons name="person-outline" size={40} color="#4CAF50" />
            </View>
            <Text style={styles.roleTitle}>Customer</Text>
            <Text style={styles.roleDescription}>
              Book appointments, find barbers, and manage your hair care
            </Text>
          </TouchableOpacity>

          {/* Employee Role */}
          <TouchableOpacity
            style={[styles.roleCard, styles.employeeCard]}
            onPress={() => handleRoleSelection('employee')}
          >
            <View style={styles.roleIcon}>
              <Ionicons name="cut-outline" size={40} color="#FF9800" />
            </View>
            <Text style={styles.roleTitle}>Employee</Text>
            <Text style={styles.roleDescription}>
              Manage appointments, view schedule, and communicate with team
            </Text>
          </TouchableOpacity>

          {/* Owner Role */}
          <TouchableOpacity
            style={[styles.roleCard, styles.ownerCard]}
            onPress={() => handleRoleSelection('owner')}
          >
            <View style={styles.roleIcon}>
              <Ionicons name="business-outline" size={40} color="#FF6B35" />
            </View>
            <Text style={styles.roleTitle}>Business Owner</Text>
            <Text style={styles.roleDescription}>
              Manage business, staff, analytics, and operations
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  roleContainer: {
    gap: 20,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  customerCard: {
    borderColor: '#4CAF50',
  },
  employeeCard: {
    borderColor: '#FF9800',
  },
  ownerCard: {
    borderColor: '#FF6B35',
  },
  roleIcon: {
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  roleDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
});
