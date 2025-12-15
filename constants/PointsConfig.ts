// Centralized Points Configuration
// This ensures consistent points across the entire customer application

export const DEFAULT_POINTS_CONFIG = {
  // Default user points
  CURRENT_POINTS: 1000,
  TOTAL_POINTS: 1500,
  
  // Tier configuration
  TIER: 'Gold',
  TIER_PROGRESS: 75, // percentage to next tier
  NEXT_TIER: 'Platinum',
  POINTS_TO_NEXT_TIER: 200,
  
  // Reward points requirements
  REWARDS: {
    FREE_HAIRCUT: 500,
    BEARD_TRIM_DISCOUNT: 200,
    FREE_STYLING: 300,
    VIP_TREATMENT: 1000,
  },
  
  // Points earning rates
  EARNING_RATES: {
    PER_BOOKING: 0.1, // 10% of booking total
    EVENING_MULTIPLIER: 2, // 2x points for evening appointments
  },
  
  // Other user data
  MEMBER_SINCE: 'March 2023',
  TOTAL_BOOKINGS: 24,
  TOTAL_SAVINGS: 180,
  REFERRAL_CODE: 'SHARK2024',
  REFERRAL_COUNT: 3,
};

// Helper functions
export const getDefaultUserData = () => ({
  currentPoints: DEFAULT_POINTS_CONFIG.CURRENT_POINTS,
  totalPoints: DEFAULT_POINTS_CONFIG.TOTAL_POINTS,
  tier: DEFAULT_POINTS_CONFIG.TIER,
  tierProgress: DEFAULT_POINTS_CONFIG.TIER_PROGRESS,
  nextTier: DEFAULT_POINTS_CONFIG.NEXT_TIER,
  pointsToNextTier: DEFAULT_POINTS_CONFIG.POINTS_TO_NEXT_TIER,
  memberSince: DEFAULT_POINTS_CONFIG.MEMBER_SINCE,
  totalBookings: DEFAULT_POINTS_CONFIG.TOTAL_BOOKINGS,
  totalSavings: DEFAULT_POINTS_CONFIG.TOTAL_SAVINGS,
  referralCode: DEFAULT_POINTS_CONFIG.REFERRAL_CODE,
  referralCount: DEFAULT_POINTS_CONFIG.REFERRAL_COUNT,
});

export const getDefaultRewards = () => [
  {
    id: '1',
    title: 'Free Haircut',
    description: 'Get a free haircut after 5 bookings',
    pointsRequired: DEFAULT_POINTS_CONFIG.REWARDS.FREE_HAIRCUT,
    isAvailable: true,
    icon: 'cut'
  },
  {
    id: '2',
    title: '20% Off Beard Trim',
    description: 'Save 20% on beard trimming services',
    pointsRequired: DEFAULT_POINTS_CONFIG.REWARDS.BEARD_TRIM_DISCOUNT,
    isAvailable: true,
    icon: 'pricetag'
  },
  {
    id: '3',
    title: 'Free Styling',
    description: 'Free styling service with any haircut',
    pointsRequired: DEFAULT_POINTS_CONFIG.REWARDS.FREE_STYLING,
    isAvailable: false,
    icon: 'star'
  },
  {
    id: '4',
    title: 'VIP Treatment',
    description: 'Priority booking and special treatment',
    pointsRequired: DEFAULT_POINTS_CONFIG.REWARDS.VIP_TREATMENT,
    isAvailable: true,
    icon: 'diamond'
  }
];
