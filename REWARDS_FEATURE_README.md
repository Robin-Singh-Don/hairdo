# Loyalty Rewards Feature

This feature allows users to claim rewards from the loyalty page and apply them to their bookings.

## How It Works

### 1. Loyalty & Rewards Page
- Users can view available rewards based on their current points
- Clicking on an available reward card opens a popup
- The popup shows reward details, points required, and user's current points
- Users can claim rewards if they have sufficient points

### 2. Reward Claiming Process
- When a user claims a reward:
  - Points are deducted from their account
  - The reward is added to their claimed rewards list
  - A success message is displayed
  - The reward appears in the "Claimed Rewards" section

### 3. Booking Confirmation Integration
- Claimed rewards automatically appear in the booking confirmation page
- Rewards are displayed in an "Applied Rewards" section
- Price calculations include rewards discounts
- The final total reflects the applied rewards

## Components

### RewardClaimPopup.js
- Modal popup for claiming rewards
- Shows reward details and points requirements
- Validates if user has enough points
- Handles reward claiming logic

### RewardsContext.js
- React Context for sharing claimed rewards data
- Manages the state of claimed rewards across the app
- Provides functions to add, remove, and clear rewards

### Updated Files
- `LoyaltyRewards.js` - Added clickable reward cards and popup integration
- `booking-confirmation.tsx` - Added claimed rewards display and price calculations
- `_layout.tsx` - Wrapped app with RewardsProvider

## Features

- **Clickable Reward Cards**: Available rewards are now clickable
- **Interactive Popup**: Beautiful modal for claiming rewards
- **Points Validation**: Checks if user has sufficient points
- **Real-time Updates**: Points and rewards update immediately
- **Booking Integration**: Claimed rewards automatically apply to bookings
- **Price Calculations**: Discounts are calculated and applied to totals

## Usage

1. Navigate to Loyalty & Rewards page
2. Click on any available reward card
3. Review reward details in the popup
4. Click "Claim Reward" if you have enough points
5. The reward will appear in your claimed rewards
6. When booking, claimed rewards will automatically apply
7. View applied rewards and discounts in the booking confirmation

## Technical Details

- Uses React Context for state management
- Responsive design with proper styling
- Error handling for insufficient points
- Automatic price calculations with rewards
- Persistent state across navigation
