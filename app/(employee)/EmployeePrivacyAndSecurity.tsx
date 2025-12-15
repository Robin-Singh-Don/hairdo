import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getPrivacyPrefs, setPrivacyPrefs, getSecurityPrefs, setSecurityPrefs, PrivacyPrefs, SecurityPrefs } from '../../services/preferences/employeePreferences';
// Reuse existing shared change password modal for consistent UX
import ChangePasswordPopup from '../../sharedComponent/ChangePasswordPopup';
import { changePassword } from '../../services/api/authAPI';
import { Alert } from 'react-native';

export default function EmployeePrivacyAndSecurity() {
  const router = useRouter();
  const [privacyPrefs, setPrivacyPrefsState] = useState<PrivacyPrefs | null>(null);
  const [securityPrefs, setSecurityPrefsState] = useState<SecurityPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [p, s] = await Promise.all([getPrivacyPrefs(), getSecurityPrefs()]);
        setPrivacyPrefsState(p);
        setSecurityPrefsState(s);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !privacyPrefs || !securityPrefs) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading Privacy & Security...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
        </View>

        <Row
          icon="shield-outline"
          label="Allow profile discovery"
          value={privacyPrefs.allowProfileDiscovery}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, allowProfileDiscovery: v });
            await setPrivacyPrefs({ allowProfileDiscovery: v });
          }}
        />

        <Row
          icon="person-circle-outline"
          label="Show online status"
          value={privacyPrefs.showOnlineStatus}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, showOnlineStatus: v });
            await setPrivacyPrefs({ showOnlineStatus: v });
          }}
        />

        <Row
          icon="images-outline"
          label="Share work gallery publicly"
          value={privacyPrefs.shareWorkGalleryPublicly}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, shareWorkGalleryPublicly: v });
            await setPrivacyPrefs({ shareWorkGalleryPublicly: v });
          }}
        />

        <Row
          icon="star-outline"
          label="Show reviews on profile"
          value={privacyPrefs.showReviewsOnProfile}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, showReviewsOnProfile: v });
            await setPrivacyPrefs({ showReviewsOnProfile: v });
          }}
        />

        <Row
          icon="eye-outline"
          label="Show profile to clients"
          value={privacyPrefs.showProfileToClients}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, showProfileToClients: v });
            await setPrivacyPrefs({ showProfileToClients: v });
          }}
        />

        <Row
          icon="call-outline"
          label="Show contact information"
          value={privacyPrefs.showContactInfo}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, showContactInfo: v });
            await setPrivacyPrefs({ showContactInfo: v });
          }}
        />

        <Row
          icon="share-social-outline"
          label="Show social media"
          value={privacyPrefs.showSocialMedia}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, showSocialMedia: v });
            await setPrivacyPrefs({ showSocialMedia: v });
          }}
        />

        <Row
          icon="chatbubble-ellipses-outline"
          label="Allow messages from non‑clients"
          value={privacyPrefs.allowMessagesFromNonClients}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, allowMessagesFromNonClients: v });
            await setPrivacyPrefs({ allowMessagesFromNonClients: v });
          }}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
        </View>

        <Row
          icon="folder-outline"
          label="Data collection"
          value={privacyPrefs.dataCollection}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, dataCollection: v });
            await setPrivacyPrefs({ dataCollection: v });
          }}
        />

        <Row
          icon="analytics-outline"
          label="Analytics"
          value={privacyPrefs.analytics}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, analytics: v });
            await setPrivacyPrefs({ analytics: v });
          }}
        />

        <Row
          icon="time-outline"
          label="Data retention"
          value={privacyPrefs.dataRetention}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, dataRetention: v });
            await setPrivacyPrefs({ dataRetention: v });
          }}
        />

        <Row
          icon="navigate-outline"
          label="Location tracking"
          value={privacyPrefs.locationTracking}
          onChange={async (v) => {
            setPrivacyPrefsState({ ...privacyPrefs, locationTracking: v });
            await setPrivacyPrefs({ locationTracking: v });
          }}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
        </View>

        {/* Change Password */}
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => setShowChangePassword(true)}
          activeOpacity={0.8}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="lock-closed-outline" size={22} color="#374151" style={{ marginRight: 12 }} />
            <Text style={styles.rowLabel}>Change password</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <Row
          icon="key-outline"
          label="Two‑factor authentication (2FA)"
          value={securityPrefs.twoFactorAuthEnabled}
          onChange={async (v) => {
            setSecurityPrefsState({ ...securityPrefs, twoFactorAuthEnabled: v });
            await setSecurityPrefs({ twoFactorAuthEnabled: v });
          }}
        />

        <Row
          icon="mail-outline"
          label="Login alerts (email)"
          value={securityPrefs.loginAlertsEmail}
          onChange={async (v) => {
            setSecurityPrefsState({ ...securityPrefs, loginAlertsEmail: v });
            await setSecurityPrefs({ loginAlertsEmail: v });
          }}
        />

        <Row
          icon="notifications-outline"
          label="Login alerts (push)"
          value={securityPrefs.loginAlertsPush}
          onChange={async (v) => {
            setSecurityPrefsState({ ...securityPrefs, loginAlertsPush: v });
            await setSecurityPrefs({ loginAlertsPush: v });
          }}
        />

        {/* Security Essentials info */}
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#2563EB" />
          <Text style={styles.infoText}>
            Use a strong unique password, enable 2FA, and review active sessions regularly.
            Keep your recovery email/phone up to date for account recovery.
          </Text>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <ChangePasswordPopup
        isVisible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onPasswordChange={async (payload: { currentPassword: string; newPassword: string }) => {
          try {
            const res = await changePassword(payload);
            if (!res.success) {
              Alert.alert('Error', 'Failed to change password. Please try again.');
            }
          } catch {
            Alert.alert('Error', 'Failed to change password. Please try again.');
          } finally {
            setShowChangePassword(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  value,
  onChange,
}: {
  icon: any;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void | Promise<void>;
}) {
  return (
    <View style={styles.rowItem}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color="#666" style={{ marginRight: 12 }} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  content: { flex: 1, padding: 16 },
  section: { marginTop: 12, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowLabel: { fontSize: 16, color: '#333', fontWeight: '500' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: { marginLeft: 10, color: '#1F2937', flex: 1, lineHeight: 18 },
});


