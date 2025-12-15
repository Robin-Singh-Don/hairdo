import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Image,
  Alert,
  Share,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ownerAPI } from '../../services/api/ownerAPI';
import { MarketingCampaign } from '../../services/mock/AppMockData';
import { useCallback } from 'react';

const { width } = Dimensions.get('window');

interface CampaignData {
  // Step 1: Choose the offer
  offerType: 'discount' | 'referral' | 'loyalty' | '';
  discount: string;
  offerName: string;
  startDate: string;
  endDate: string;
  
  // Step 2: Photos & logo
  photos: string[];
  logo: string;
  
  // Step 3: Message
  message: string;
  
  // Step 4: Poster/Video
  posterImage: string;
  
  // Step 5: Share platforms
  sharePlatforms: string[];
  
  // Step 6: Boost budget (optional)
  boostBudget: string;
  boostEnabled: boolean;
  
  // Step 7: Response settings
  autoRespond: boolean;
  responseMessage: string;
  
  // Step 8: Track results
  campaignId?: string;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

const OFFER_TYPES = [
  { id: 'discount', label: 'Discount', icon: 'pricetag', description: 'Percentage or fixed discount', color: '#6366F1' },
  { id: 'referral', label: 'Referral Program', icon: 'people', description: 'Reward for referrals', color: '#10B981' },
  { id: 'loyalty', label: 'Loyalty Reward', icon: 'star', description: 'Reward loyal customers', color: '#F59E0B' },
];

const SHARE_PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
  { id: 'twitter', label: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
  { id: 'email', label: 'Email', icon: 'mail', color: '#666' },
  { id: 'sms', label: 'SMS', icon: 'chatbubble', color: '#666' },
];

export default function MarketingAnalysis() {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [historyTab, setHistoryTab] = useState<'active' | 'previous'>('active');
  const [allCampaigns, setAllCampaigns] = useState<MarketingCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  
  const [campaignData, setCampaignData] = useState<CampaignData>({
    offerType: '',
    discount: '',
    offerName: '',
    startDate: '',
    endDate: '',
    photos: [],
    logo: '',
    message: '',
    posterImage: '',
    sharePlatforms: [],
    boostBudget: '',
    boostEnabled: false,
    autoRespond: false,
    responseMessage: 'Thank you for your interest! We\'ll get back to you soon.',
    views: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  
  // Load campaigns on mount and focus
  useFocusEffect(
    useCallback(() => {
      const loadCampaigns = async () => {
        try {
          setLoadingCampaigns(true);
          const campaigns = await ownerAPI.getAllMarketingCampaigns();
          setAllCampaigns(campaigns);
        } catch (error) {
          console.error('Error loading campaigns:', error);
        } finally {
          setLoadingCampaigns(false);
        }
      };
      loadCampaigns();
    }, [])
  );

  // Step 1: Choose the offer
  const renderStep1 = () => (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.offerScrollContainer}
      >
        {OFFER_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.offerCard,
              campaignData.offerType === type.id && styles.offerCardSelected
            ]}
            onPress={() => setCampaignData({ ...campaignData, offerType: type.id as any })}
          >
            <View style={[
              styles.offerIconContainer,
              campaignData.offerType === type.id && { backgroundColor: type.color + '20' }
            ]}>
              <Ionicons 
                name={type.icon as any} 
                size={22} 
                color={campaignData.offerType === type.id ? type.color : '#666'} 
              />
            </View>
            <Text style={[
              styles.offerLabel,
              campaignData.offerType === type.id && styles.offerLabelSelected
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {campaignData.offerType && (
        <View style={styles.formCard}>
          <View style={styles.formRow}>
            <View style={styles.formRowItem}>
              <Text style={styles.inputLabel}>Offer Name</Text>
              <TextInput
                style={styles.compactInput}
                placeholder="e.g., Summer Special 20% Off"
                placeholderTextColor="#999"
                value={campaignData.offerName}
                onChangeText={(text) => setCampaignData({ ...campaignData, offerName: text })}
              />
            </View>
            <View style={styles.formRowItem}>
              <Text style={styles.inputLabel}>
                {campaignData.offerType === 'discount' ? 'Discount %' : 'Details'}
              </Text>
              <TextInput
                style={styles.compactInput}
                placeholder={campaignData.offerType === 'discount' ? '20' : 'Enter details'}
                placeholderTextColor="#999"
                value={campaignData.discount}
                onChangeText={(text) => setCampaignData({ ...campaignData, discount: text })}
                keyboardType={campaignData.offerType === 'discount' ? 'numeric' : 'default'}
              />
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TextInput
                style={styles.compactInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={campaignData.startDate}
                onChangeText={(text) => setCampaignData({ ...campaignData, startDate: text })}
              />
            </View>
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>End Date</Text>
              <TextInput
                style={styles.compactInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={campaignData.endDate}
                onChangeText={(text) => setCampaignData({ ...campaignData, endDate: text })}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );

  // Step 2: Collect photos & logo
  const requestImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos');
      return false;
    }
    return true;
  };

  const pickImage = async (type: 'photo' | 'logo') => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'logo') {
          setCampaignData({ ...campaignData, logo: result.assets[0].uri });
        } else {
          setCampaignData({ 
            ...campaignData, 
            photos: [...campaignData.photos, result.assets[0].uri]
          });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = campaignData.photos.filter((_, i) => i !== index);
    setCampaignData({ ...campaignData, photos: newPhotos });
  };

  const renderStep2 = () => (
    <View>
      <View style={styles.photoCard}>
        <Text style={styles.sectionTitle}>Store Logo</Text>
        <TouchableOpacity
          style={styles.logoPicker}
          onPress={() => pickImage('logo')}
        >
          {campaignData.logo ? (
            <Image source={{ uri: campaignData.logo }} style={styles.logoImage} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="image-outline" size={40} color="#999" />
              <Text style={styles.placeholderText}>Tap to add logo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.photoCard}>
        <Text style={styles.sectionTitle}>Promotion Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.photosContainer}>
            {campaignData.photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => pickImage('photo')}
            >
              <Ionicons name="add-circle-outline" size={40} color="#666" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  // Step 3: Write simple message
  const renderStep3 = () => (
    <View>
      <View style={styles.messageCard}>
        <Text style={styles.inputLabel}>Your Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g., Get 20% off on all haircuts this summer! Book now and save. Limited time offer."
          placeholderTextColor="#999"
          value={campaignData.message}
          onChangeText={(text) => setCampaignData({ ...campaignData, message: text })}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>
          {campaignData.message.length} characters
        </Text>

        <View style={styles.messageTips}>
          <Text style={styles.tipsTitle}>💡 Tips for a great message:</Text>
          <Text style={styles.tipText}>• Keep it short and clear</Text>
          <Text style={styles.tipText}>• Include the discount/offer</Text>
          <Text style={styles.tipText}>• Add urgency (limited time)</Text>
          <Text style={styles.tipText}>• Include a call to action</Text>
        </View>
      </View>
    </View>
  );

  // Step 4: Make poster/video
  const generatePoster = () => {
    const posterSource = campaignData.photos[0] || campaignData.logo || '';
    if (posterSource) {
      setCampaignData({ ...campaignData, posterImage: posterSource });
      Alert.alert('Poster Created!', 'Your poster has been generated. You can preview it below.');
    } else {
      Alert.alert('Add Images First', 'Please add photos or logo in Step 2 before generating a poster.');
    }
  };

  const renderStep4 = () => (
    <View>
      <TouchableOpacity
        style={styles.generateButton}
        onPress={generatePoster}
      >
        <Ionicons name="create-outline" size={22} color="#fff" />
        <Text style={styles.generateButtonText}>Generate Poster</Text>
      </TouchableOpacity>

      {campaignData.posterImage && (
        <View style={styles.posterCard}>
          <Text style={styles.sectionTitle}>Poster Preview</Text>
          <Image source={{ uri: campaignData.posterImage }} style={styles.posterImage} />
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => Alert.alert('Download', 'Poster download functionality coming soon!')}
          >
            <Ionicons name="download-outline" size={18} color="#000" />
            <Text style={styles.downloadButtonText}>Download Poster</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Step 5: Share everywhere
  const togglePlatform = (platformId: string) => {
    const platforms = campaignData.sharePlatforms.includes(platformId)
      ? campaignData.sharePlatforms.filter(p => p !== platformId)
      : [...campaignData.sharePlatforms, platformId];
    setCampaignData({ ...campaignData, sharePlatforms: platforms });
  };

  const shareCampaign = async () => {
    if (campaignData.sharePlatforms.length === 0) {
      Alert.alert('Select Platforms', 'Please select at least one platform to share on.');
      return;
    }

    const shareMessage = `${campaignData.offerName}\n\n${campaignData.message}\n\nValid: ${campaignData.startDate} - ${campaignData.endDate}`;
    
    try {
      const result = await Share.share({
        message: shareMessage,
        title: campaignData.offerName,
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert('Shared!', 'Your promotion has been shared successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share promotion');
    }
  };

  const renderStep5 = () => (
    <View>
      <View style={styles.platformsCard}>
        <View style={styles.platformsGrid}>
          {SHARE_PLATFORMS.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={[
                styles.platformCard,
                campaignData.sharePlatforms.includes(platform.id) && styles.platformCardSelected
              ]}
              onPress={() => togglePlatform(platform.id)}
            >
              <Ionicons 
                name={platform.icon as any} 
                size={20} 
                color={campaignData.sharePlatforms.includes(platform.id) ? platform.color : '#666'} 
                style={styles.platformIcon}
              />
              <Text style={[
                styles.platformLabel,
                campaignData.sharePlatforms.includes(platform.id) && styles.platformLabelSelected
              ]}>
                {platform.label}
              </Text>
              {campaignData.sharePlatforms.includes(platform.id) && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.shareButton,
          campaignData.sharePlatforms.length === 0 && styles.shareButtonDisabled
        ]}
        onPress={shareCampaign}
        disabled={campaignData.sharePlatforms.length === 0}
      >
        <Ionicons name="share-social-outline" size={20} color="#fff" />
        <Text style={styles.shareButtonText}>Share Now</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 6: Boost with small budget (optional)
  const renderStep6 = () => (
    <View>
      <View style={styles.boostCard}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Ionicons name="rocket-outline" size={20} color="#6366F1" />
            <Text style={styles.switchLabel}>Enable Budget Boost</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.switch,
              campaignData.boostEnabled && styles.switchActive
            ]}
            onPress={() => setCampaignData({ 
              ...campaignData, 
              boostEnabled: !campaignData.boostEnabled 
            })}
          >
            <View style={[
              styles.switchKnob,
              campaignData.boostEnabled && styles.switchKnobActive
            ]} />
          </TouchableOpacity>
        </View>

        {campaignData.boostEnabled && (
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Budget Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50"
              placeholderTextColor="#999"
              value={campaignData.boostBudget}
              onChangeText={(text) => setCampaignData({ ...campaignData, boostBudget: text })}
              keyboardType="numeric"
            />
            <Text style={styles.hintText}>
              Small budgets ($25-$100) work great for local promotions
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // Step 7: Respond fast
  const renderStep7 = () => (
    <View>
      <View style={styles.respondCard}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Ionicons name="flash-outline" size={20} color="#10B981" />
            <Text style={styles.switchLabel}>Auto-Respond to Messages</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.switch,
              campaignData.autoRespond && styles.switchActive
            ]}
            onPress={() => setCampaignData({ 
              ...campaignData, 
              autoRespond: !campaignData.autoRespond 
            })}
          >
            <View style={[
              styles.switchKnob,
              campaignData.autoRespond && styles.switchKnobActive
            ]} />
          </TouchableOpacity>
        </View>

        {campaignData.autoRespond && (
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Auto-Response Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Thank you for your interest! We'll get back to you soon."
              placeholderTextColor="#999"
              value={campaignData.responseMessage}
              onChangeText={(text) => setCampaignData({ ...campaignData, responseMessage: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        )}
      </View>
    </View>
  );

  // Step 8: Track results
  const renderStep8 = () => (
    <View>
      <View style={styles.resultsGrid}>
        <View style={styles.resultCard}>
          <Ionicons name="eye-outline" size={20} color="#2196F3" style={styles.resultIcon} />
          <View style={styles.resultContent}>
            <Text style={styles.resultValue}>{campaignData.views}</Text>
            <Text style={styles.resultLabel}>Views</Text>
          </View>
        </View>
        <View style={styles.resultCard}>
          <Ionicons name="hand-left-outline" size={20} color="#4CAF50" style={styles.resultIcon} />
          <View style={styles.resultContent}>
            <Text style={styles.resultValue}>{campaignData.clicks}</Text>
            <Text style={styles.resultLabel}>Clicks</Text>
          </View>
        </View>
        <View style={styles.resultCard}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#FF9800" style={styles.resultIcon} />
          <View style={styles.resultContent}>
            <Text style={styles.resultValue}>{campaignData.conversions}</Text>
            <Text style={styles.resultLabel}>Conversions</Text>
          </View>
        </View>
        <View style={styles.resultCard}>
          <Ionicons name="cash-outline" size={20} color="#9C27B0" style={styles.resultIcon} />
          <View style={styles.resultContent}>
            <Text style={styles.resultValue}>${campaignData.revenue}</Text>
            <Text style={styles.resultLabel}>Revenue</Text>
          </View>
        </View>
      </View>

      <View style={styles.completionCard}>
        <View style={styles.completionIconContainer}>
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
        </View>
        <Text style={styles.completionTitle}>Campaign Created!</Text>
        <Text style={styles.completionText}>
          Your promotion is now live. Track results here and respond to customer inquiries quickly.
        </Text>
      </View>
    </View>
  );

  const handleCreateCampaign = async () => {
    // Validation
    if (!campaignData.offerType || !campaignData.offerName) {
      Alert.alert('Incomplete', 'Please complete Step 1: Choose Your Offer');
      return;
    }
    if (!campaignData.logo && campaignData.photos.length === 0) {
      Alert.alert('Incomplete', 'Please add at least one photo or logo in Step 2');
      return;
    }
    if (!campaignData.message) {
      Alert.alert('Incomplete', 'Please write a message in Step 3');
      return;
    }
    if (campaignData.sharePlatforms.length === 0) {
      Alert.alert('Incomplete', 'Please select at least one sharing platform in Step 5');
      return;
    }
    if (!campaignData.startDate || !campaignData.endDate) {
      Alert.alert('Incomplete', 'Please set start and end dates in Step 1');
      return;
    }

    try {
      setLoading(true);

      const campaignPayload = {
        name: campaignData.offerName,
        offerType: campaignData.offerType as 'discount' | 'referral' | 'loyalty',
        offerName: campaignData.offerName,
        discount: campaignData.discount || undefined,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
        message: campaignData.message,
        photos: campaignData.photos || [],
        logo: campaignData.logo || undefined,
        posterImage: campaignData.posterImage || undefined,
        sharePlatforms: campaignData.sharePlatforms || [],
        boostBudget: campaignData.boostEnabled && campaignData.boostBudget ? parseFloat(campaignData.boostBudget) : undefined,
        boostEnabled: campaignData.boostEnabled,
        autoRespond: campaignData.autoRespond,
        responseMessage: campaignData.responseMessage || undefined,
      };

      let result;
      if (editingCampaignId) {
        // Update existing campaign
        result = await ownerAPI.updateMarketingCampaign(editingCampaignId, {
          ...campaignPayload,
          status: 'active', // Keep status, or restore if paused
        });
        Alert.alert('Success!', 'Your marketing campaign has been updated successfully!');
      } else {
        // Create new campaign
        result = await ownerAPI.createMarketingCampaign({
          ...campaignPayload,
          status: 'active',
        });
        Alert.alert('Success!', 'Your marketing campaign has been created and is now active!');
      }

      // Reset form
      setCampaignData({
        offerType: '',
        discount: '',
        offerName: '',
        startDate: '',
        endDate: '',
        photos: [],
        logo: '',
        message: '',
        posterImage: '',
        sharePlatforms: [],
        boostBudget: '',
        boostEnabled: false,
        autoRespond: false,
        responseMessage: 'Thank you for your interest! We\'ll get back to you soon.',
        views: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      });
      setEditingCampaignId(null);

      // Refresh campaigns list
      const campaigns = await ownerAPI.getAllMarketingCampaigns();
      setAllCampaigns(campaigns);

      // Switch back to history view
      setShowCreateForm(false);
      setHistoryTab('active');
    } catch (error) {
      console.error('Error saving campaign:', error);
      Alert.alert('Error', `Failed to ${editingCampaignId ? 'update' : 'create'} campaign. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate campaign duration in days
  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Helper function to format date range
  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#10B981';
      case 'completed': return '#6366F1';
      case 'paused': return '#F59E0B';
      case 'draft': return '#6B7280';
      default: return '#9CA3AF';
    }
  };

  // Filter campaigns by status
  const activeCampaigns = allCampaigns.filter(c => {
    const today = new Date().toISOString().split('T')[0];
    return c.status === 'active' && c.startDate <= today && c.endDate >= today;
  });

  const previousCampaigns = allCampaigns.filter(c => {
    const today = new Date().toISOString().split('T')[0];
    return c.status === 'completed' || (c.status === 'active' && c.endDate < today);
  });

  // Handle delete campaign
  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    try {
      setLoading(true);
      const success = await ownerAPI.deleteMarketingCampaign(campaignToDelete);
      
      if (success) {
        // Refresh campaigns list
        const campaigns = await ownerAPI.getAllMarketingCampaigns();
        setAllCampaigns(campaigns);
        Alert.alert('Success', 'Campaign deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      Alert.alert('Error', 'Failed to delete campaign. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setCampaignToDelete(null);
    }
  };

  // Handle pause/resume campaign
  const handleToggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const success = await ownerAPI.updateCampaignStatus(campaignId, newStatus);
      
      if (success) {
        // Refresh campaigns list
        const campaigns = await ownerAPI.getAllMarketingCampaigns();
        setAllCampaigns(campaigns);
        Alert.alert('Success', `Campaign ${newStatus === 'active' ? 'resumed' : 'paused'} successfully`);
      } else {
        Alert.alert('Error', 'Failed to update campaign status');
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
      Alert.alert('Error', 'Failed to update campaign status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render campaign card
  const renderCampaignCard = (campaign: MarketingCampaign) => {
    const duration = calculateDuration(campaign.startDate, campaign.endDate);
    const daysRunning = campaign.status === 'active' 
      ? calculateDuration(campaign.startDate, new Date().toISOString().split('T')[0])
      : duration;
    const canEdit = campaign.status !== 'completed';
    const canPauseResume = campaign.status === 'active' || campaign.status === 'paused';
    
    return (
      <View key={campaign.id} style={styles.campaignHistoryCard}>
        <View style={styles.campaignHistoryHeader}>
          <View style={styles.campaignHistoryTitleRow}>
            <View style={styles.campaignHistoryTitleContainer}>
              <Text style={styles.campaignHistoryName}>{campaign.offerName}</Text>
              <View style={[styles.campaignStatusBadge, { backgroundColor: getStatusColor(campaign.status) + '20' }]}>
                <View style={[styles.campaignStatusDot, { backgroundColor: getStatusColor(campaign.status) }]} />
                <Text style={[styles.campaignStatusText, { color: getStatusColor(campaign.status) }]}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Text>
              </View>
            </View>
            {/* Action buttons */}
            <View style={styles.campaignActions}>
              {canPauseResume && (
                <TouchableOpacity
                  onPress={() => handleToggleCampaignStatus(campaign.id, campaign.status)}
                  style={styles.campaignActionButton}
                >
                  <Ionicons 
                    name={campaign.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'} 
                    size={24} 
                    color={campaign.status === 'active' ? '#F59E0B' : '#10B981'} 
                  />
                </TouchableOpacity>
              )}
              {canEdit && (
                <TouchableOpacity
                  onPress={() => {
                    // Load campaign data for editing
                    setCampaignData({
                      offerType: campaign.offerType,
                      discount: campaign.discount || '',
                      offerName: campaign.offerName,
                      startDate: campaign.startDate,
                      endDate: campaign.endDate,
                      photos: campaign.photos || [],
                      logo: campaign.logo || '',
                      message: campaign.message,
                      posterImage: campaign.posterImage || '',
                      sharePlatforms: campaign.sharePlatforms || [],
                      boostBudget: campaign.boostBudget?.toString() || '',
                      boostEnabled: campaign.boostEnabled,
                      autoRespond: campaign.autoRespond,
                      responseMessage: campaign.responseMessage || 'Thank you for your interest! We\'ll get back to you soon.',
                      campaignId: campaign.id,
                      views: campaign.views,
                      clicks: campaign.clicks,
                      conversions: campaign.conversions,
                      revenue: campaign.revenue,
                    });
                    setEditingCampaignId(campaign.id);
                    setShowCreateForm(true);
                  }}
                  style={styles.campaignActionButton}
                >
                  <Ionicons name="pencil-outline" size={24} color="#6366F1" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  setCampaignToDelete(campaign.id);
                  setShowDeleteConfirm(true);
                }}
                style={styles.campaignActionButton}
              >
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.campaignHistoryType}>{campaign.offerType.charAt(0).toUpperCase() + campaign.offerType.slice(1)} Campaign</Text>
        </View>

        <View style={styles.campaignHistoryMetrics}>
          <View style={styles.campaignMetricItem}>
            <Ionicons name="cash-outline" size={20} color="#10B981" />
            <View style={styles.campaignMetricContent}>
              <Text style={styles.campaignMetricValue}>${campaign.revenue.toLocaleString()}</Text>
              <Text style={styles.campaignMetricLabel}>Revenue</Text>
            </View>
          </View>
          <View style={styles.campaignMetricItem}>
            <Ionicons name="time-outline" size={20} color="#6366F1" />
            <View style={styles.campaignMetricContent}>
              <Text style={styles.campaignMetricValue}>{duration} days</Text>
              <Text style={styles.campaignMetricLabel}>Duration</Text>
            </View>
          </View>
          <View style={styles.campaignMetricItem}>
            <Ionicons name="eye-outline" size={20} color="#F59E0B" />
            <View style={styles.campaignMetricContent}>
              <Text style={styles.campaignMetricValue}>{campaign.views.toLocaleString()}</Text>
              <Text style={styles.campaignMetricLabel}>Views</Text>
            </View>
          </View>
          <View style={styles.campaignMetricItem}>
            <Ionicons name="hand-left-outline" size={20} color="#EF4444" />
            <View style={styles.campaignMetricContent}>
              <Text style={styles.campaignMetricValue}>{campaign.clicks.toLocaleString()}</Text>
              <Text style={styles.campaignMetricLabel}>Clicks</Text>
            </View>
          </View>
        </View>

        <View style={styles.campaignHistoryDetails}>
          <View style={styles.campaignDetailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.campaignDetailText}>{formatDateRange(campaign.startDate, campaign.endDate)}</Text>
          </View>
          <View style={styles.campaignDetailRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
            <Text style={styles.campaignDetailText}>{campaign.conversions} conversions</Text>
          </View>
          {campaign.boostEnabled && (
            <View style={styles.campaignDetailRow}>
              <Ionicons name="rocket-outline" size={16} color="#666" />
              <Text style={styles.campaignDetailText}>Boost: ${campaign.spent} spent</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render campaigns history view
  const renderCampaignsHistory = () => (
    <View style={styles.historyContainer}>
      {/* Sub-tabs for Active/Previous */}
      <View style={styles.historyTabContainer}>
        <TouchableOpacity
          style={[styles.historyTab, historyTab === 'active' && styles.historyTabActive]}
          onPress={() => setHistoryTab('active')}
        >
          <Text style={[styles.historyTabText, historyTab === 'active' && styles.historyTabTextActive]}>
            Active ({activeCampaigns.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.historyTab, historyTab === 'previous' && styles.historyTabActive]}
          onPress={() => setHistoryTab('previous')}
        >
          <Text style={[styles.historyTabText, historyTab === 'previous' && styles.historyTabTextActive]}>
            Previous ({previousCampaigns.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Campaigns List */}
      <ScrollView style={styles.campaignsList} showsVerticalScrollIndicator={false}>
        {loadingCampaigns ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading campaigns...</Text>
          </View>
        ) : historyTab === 'active' ? (
          activeCampaigns.length > 0 ? (
            activeCampaigns.map(renderCampaignCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No active campaigns</Text>
              <Text style={styles.emptySubtext}>Create a new campaign to get started</Text>
            </View>
          )
        ) : (
          previousCampaigns.length > 0 ? (
            previousCampaigns.map(renderCampaignCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="archive-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No previous campaigns</Text>
              <Text style={styles.emptySubtext}>Completed campaigns will appear here</Text>
            </View>
          )
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {showCreateForm ? (
          <TouchableOpacity 
            onPress={() => {
              setShowCreateForm(false);
              setEditingCampaignId(null);
              setCampaignData({
                offerType: '',
                discount: '',
                offerName: '',
                startDate: '',
                endDate: '',
                photos: [],
                logo: '',
                message: '',
                posterImage: '',
                sharePlatforms: [],
                boostBudget: '',
                boostEnabled: false,
                autoRespond: false,
                responseMessage: 'Thank you for your interest! We\'ll get back to you soon.',
                views: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0,
              });
            }} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {showCreateForm 
            ? (editingCampaignId ? 'Edit Marketing Campaign' : 'Create Marketing Campaign')
            : 'Marketing Campaigns'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content - Conditional Rendering */}
      {!showCreateForm ? (
        <>
          {renderCampaignsHistory()}
          {/* Floating Action Button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              setShowCreateForm(true);
              setEditingCampaignId(null);
              setCampaignData({
                offerType: '',
                discount: '',
                offerName: '',
                startDate: '',
                endDate: '',
                photos: [],
                logo: '',
                message: '',
                posterImage: '',
                sharePlatforms: [],
                boostBudget: '',
                boostEnabled: false,
                autoRespond: false,
                responseMessage: 'Thank you for your interest! We\'ll get back to you soon.',
                views: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0,
              });
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </>
      ) : (
      /* Scrollable Content - All Steps */
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Step 1 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepSectionTitle}>Choose the Offer</Text>
              <Text style={styles.stepSectionSubtitle}>Select promotion type and details</Text>
            </View>
          </View>
          {renderStep1()}
        </View>

        {/* Step 2 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepSectionTitle}>Collect Photos & Logo</Text>
              <Text style={styles.stepSectionSubtitle}>Add images to make your promotion attractive</Text>
            </View>
          </View>
          {renderStep2()}
        </View>

        {/* Step 3 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepSectionTitle}>Write a Simple Message</Text>
              <Text style={styles.stepSectionSubtitle}>Create a clear and compelling message</Text>
            </View>
          </View>
          {renderStep3()}
        </View>

        {/* Step 4 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepSectionTitle}>Make Poster/Video</Text>
              <Text style={styles.stepSectionSubtitle}>Generate an attractive poster</Text>
            </View>
          </View>
          {renderStep4()}
        </View>

        {/* Step 5 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepSectionTitle}>Share Everywhere</Text>
              <Text style={styles.stepSectionSubtitle}>Select platforms to share your promotion</Text>
            </View>
          </View>
          {renderStep5()}
        </View>

        {/* Step 6 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>6</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepSectionTitle}>Boost with Small Budget (Optional)</Text>
              <Text style={styles.stepSectionSubtitle}>Optionally boost with paid advertising</Text>
            </View>
          </View>
          {renderStep6()}
        </View>

        {/* Step 7 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>7</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepSectionTitle}>Respond Fast</Text>
              <Text style={styles.stepSectionSubtitle}>Set up automatic responses</Text>
            </View>
          </View>
          {renderStep7()}
        </View>

        {/* Step 8 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>8</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepSectionTitle}>Track Results</Text>
              <Text style={styles.stepSectionSubtitle}>Monitor your campaign performance</Text>
            </View>
          </View>
          {renderStep8()}
        </View>

        {/* Create Campaign Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateCampaign}
        >
          <Ionicons name="rocket-outline" size={24} color="#fff" />
          <Text style={styles.createButtonText}>
            {editingCampaignId ? 'Update Campaign' : 'Create & Launch Campaign'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmModalTitle}>Delete Campaign</Text>
            <Text style={styles.confirmModalMessage}>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </Text>
            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setCampaignToDelete(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteButton]}
                onPress={handleDeleteCampaign}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  stepHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  stepHeaderContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  stepSectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  offerScrollContainer: {
    paddingRight: 20,
    gap: 12,
  },
  offerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: 110,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  offerCardSelected: {
    borderColor: '#1F2937',
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  offerLabelSelected: {
    color: '#fff',
  },
  formCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formSection: {
    marginTop: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formRowItem: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    color: '#1F2937',
  },
  compactInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: -12,
    marginBottom: 12,
  },
  messageCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageTips: {
    backgroundColor: '#EEF2FF',
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4338CA',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#6366F1',
    marginBottom: 4,
    lineHeight: 18,
  },
  photoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  logoPicker: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
  },
  photoImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  posterCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  posterImage: {
    width: width - 104,
    height: (width - 104) * 1.3,
    borderRadius: 12,
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  platformsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 100,
  },
  platformCardSelected: {
    borderColor: '#1F2937',
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  platformIcon: {
    marginRight: 8,
  },
  platformLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  platformLabelSelected: {
    color: '#1F2937',
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  boostCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  respondCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  switch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchActive: {
    backgroundColor: '#10B981',
  },
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchKnobActive: {
    alignSelf: 'flex-end',
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 100,
    flex: 1,
    maxWidth: '48%',
  },
  resultIcon: {
    marginRight: 10,
  },
  resultContent: {
    flex: 1,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  resultLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  completionCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  completionIconContainer: {
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  historyTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  historyTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  historyTabActive: {
    backgroundColor: '#6366F1',
  },
  historyTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  historyTabTextActive: {
    color: '#fff',
  },
  campaignsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  campaignHistoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campaignHistoryHeader: {
    marginBottom: 16,
  },
  campaignHistoryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  campaignHistoryTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  campaignHistoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  campaignStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  campaignStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  campaignStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  campaignHistoryType: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  campaignHistoryMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  campaignMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: '45%',
  },
  campaignMetricContent: {
    flex: 1,
  },
  campaignMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  campaignMetricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  campaignHistoryDetails: {
    gap: 8,
  },
  campaignDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  campaignDetailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  // Campaign Actions
  campaignActions: {
    flexDirection: 'row',
    gap: 8,
  },
  campaignActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  // Delete Confirmation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  confirmModalMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
