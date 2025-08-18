import React, { createContext, useContext, useState } from 'react';

const RewardsContext = createContext();

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (!context) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
};

export const RewardsProvider = ({ children }) => {
  const [claimedRewards, setClaimedRewards] = useState([]);

  const addClaimedReward = (reward) => {
    const claimedReward = {
      ...reward,
      claimedAt: new Date().toISOString(),
      id: `claimed_${Date.now()}`
    };
    setClaimedRewards(prev => [...prev, claimedReward]);
  };

  const removeClaimedReward = (rewardId) => {
    setClaimedRewards(prev => prev.filter(reward => reward.id !== rewardId));
  };

  const clearClaimedRewards = () => {
    setClaimedRewards([]);
  };

  const value = {
    claimedRewards,
    addClaimedReward,
    removeClaimedReward,
    clearClaimedRewards,
  };

  return (
    <RewardsContext.Provider value={value}>
      {children}
    </RewardsContext.Provider>
  );
};
