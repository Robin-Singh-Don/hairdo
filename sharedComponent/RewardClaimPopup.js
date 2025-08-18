import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RewardClaimPopup = ({ isVisible, onClose, reward, onClaimReward, userPoints }) => {
  if (!reward) return null;

  const canClaim = userPoints >= reward.pointsRequired;

  const handleClaim = () => {
    if (canClaim) {
      onClaimReward(reward);
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {/* Reward Icon */}
          <View style={styles.rewardIconContainer}>
            <View style={styles.rewardIcon}>
              <Ionicons name={reward.icon} size={32} color="#AEB4F7" />
            </View>
          </View>

          {/* Reward Title */}
          <Text style={styles.rewardTitle}>{reward.title}</Text>
          
          {/* Reward Description */}
          <Text style={styles.rewardDescription}>{reward.description}</Text>

          {/* Points Required */}
          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.pointsText}>{reward.pointsRequired} points required</Text>
          </View>

          {/* User Points Status */}
          <View style={styles.userPointsContainer}>
            <Text style={styles.userPointsLabel}>Your points:</Text>
            <Text style={[styles.userPointsValue, canClaim ? styles.sufficientPoints : styles.insufficientPoints]}>
              {userPoints} points
            </Text>
          </View>

          {/* Claim Button */}
          <TouchableOpacity
            style={[styles.claimButton, !canClaim && styles.claimButtonDisabled]}
            onPress={handleClaim}
            disabled={!canClaim}
          >
            <Ionicons name="gift" size={20} color="#fff" />
            <Text style={styles.claimButtonText}>
              {canClaim ? 'Claim Reward' : 'Not Enough Points'}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 350,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  rewardIconContainer: {
    marginBottom: 16,
  },
  rewardIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  rewardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  rewardDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  userPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  userPointsLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  userPointsValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  sufficientPoints: {
    color: '#28A745',
  },
  insufficientPoints: {
    color: '#DC3545',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#AEB4F7',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  claimButtonDisabled: {
    backgroundColor: '#CCC',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RewardClaimPopup;
