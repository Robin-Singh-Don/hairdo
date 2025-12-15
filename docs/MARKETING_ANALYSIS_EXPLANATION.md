# 📊 Marketing Analysis Page - Complete Explanation

## 🎯 Overview

The **Marketing Analysis** page helps salon owners understand the effectiveness of their marketing efforts. It tracks:
- **Marketing Campaigns** (promotions, ads, emails, social media)
- **Customer Acquisition Channels** (where new customers come from)
- **Promotion Performance** (discount codes, referral programs)
- **ROI (Return on Investment)** and **CPA (Cost Per Acquisition)**
- **Client Segments** (VIP, Regular, New, At-Risk customers)

---

## 🔴 **CURRENT STATE (What's Happening Now)**

### Frontend - Current Implementation

**Card on BusinessAnalytics.tsx:**
```typescript
// Lines 312-338 in BusinessAnalytics.tsx
case 'marketing':
  return (
    <TouchableOpacity 
      onPress={() => router.push('/(owner)/MarketingAnalysis')}
    >
      <Text>Marketing Analysis</Text>
      <Text>Promotion: Spring '20% Off Haircuts.' Start and End Date: Mar 1 - Mar 15.</Text>
      <Text>Current Revenue: $2,500</Text>
      <Text>Moderate</Text> // Progress bar at 50%
    </TouchableOpacity>
  );
```

**What this means:**
- The card shows **hardcoded/fake data**
- Promotion text is static ("Spring '20% Off Haircuts'")
- Revenue is hardcoded ($2,500)
- Progress bar is always at 50%
- Clicking navigates to the detailed MarketingAnalysis page

**MarketingAnalysis Page:**
- Has 6 tabs: Overview, Campaigns, Acquisition, Segments, Promotions, Funnel
- Shows sample/mock data for campaigns, channels, and promotions
- All calculations are done from hardcoded arrays
- No connection to real appointments or customer data

**Problem:** This doesn't reflect real business data! It's just placeholder data.

---

## 🟢 **HOW IT SHOULD WORK (With Real Data)**

### Frontend - Real Implementation

#### Step 1: Get Data Sources
```typescript
// We need these data sources:
const { appointments } = useAppointments(); // All appointments
const promotions = await ownerAPI.getPromotions(); // Active promotions
const campaigns = await ownerAPI.getMarketingCampaigns(); // Marketing campaigns
const customers = await ownerAPI.getCustomers(); // Customer data with acquisition source
```

#### Step 2: Calculate Active Promotion for Card
```typescript
// For the selected date, find active promotion
const activePromotion = useMemo(() => {
  const today = new Date();
  return promotions.find(promo => {
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    return promo.status === 'active' && 
           today >= startDate && 
           today <= endDate;
  });
}, [promotions]);

// Calculate revenue from this promotion
const promotionRevenue = useMemo(() => {
  if (!activePromotion) return 0;
  
  const promoAppointments = appointments.filter(apt => {
    return apt.promotionCode === activePromotion.code &&
           apt.date >= activePromotion.startDate &&
           apt.date <= activePromotion.endDate;
  });
  
  return promoAppointments.reduce((total, apt) => total + apt.price, 0);
}, [activePromotion, appointments]);

// Calculate promotion progress (revenue vs target)
const promotionProgress = activePromotion?.targetRevenue 
  ? Math.min(100, Math.round((promotionRevenue / activePromotion.targetRevenue) * 100))
  : 50; // Default to 50% if no target
```

#### Step 3: Calculate Marketing Metrics
```typescript
// Customer Acquisition Channels
const acquisitionChannels = useMemo(() => {
  const channels: Record<string, { newClients: number; totalSpent: number; revenue: number }> = {};
  
  // Group customers by acquisition source
  customers.forEach(customer => {
    const source = customer.acquisitionSource || 'Walk-ins';
    
    if (!channels[source]) {
      channels[source] = { newClients: 0, totalSpent: 0, revenue: 0 };
    }
    
    // Count new clients (first appointment in selected period)
    const firstAppt = appointments
      .filter(apt => apt.customerId === customer.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    
    if (firstAppt && isInPeriod(firstAppt.date, selectedPeriod)) {
      channels[source].newClients++;
    }
    
    // Calculate revenue from this channel
    const channelAppointments = appointments.filter(
      apt => apt.customerId === customer.id && 
             isInPeriod(apt.date, selectedPeriod)
    );
    channels[source].revenue += channelAppointments.reduce(
      (sum, apt) => sum + apt.price, 0
    );
  });
  
  // Get campaign spend for each channel
  campaigns.forEach(campaign => {
    const channelName = mapCampaignTypeToChannel(campaign.type);
    if (channels[channelName]) {
      channels[channelName].totalSpent += campaign.spent;
    }
  });
  
  // Calculate CPA and ROI for each channel
  return Object.entries(channels).map(([name, data]) => {
    const cpa = data.newClients > 0 ? data.totalSpent / data.newClients : 0;
    const roi = data.totalSpent > 0 
      ? Math.round(((data.revenue - data.totalSpent) / data.totalSpent) * 100)
      : data.revenue > 0 ? 999 : 0; // Infinite ROI for free channels
    
    return {
      name,
      newClients: data.newClients,
      totalSpent: data.totalSpent,
      revenue: data.revenue,
      cpa: Math.round(cpa * 100) / 100,
      roi,
      conversionRate: calculateConversionRate(name, data.newClients),
      trend: calculateTrend(name, previousPeriodData)
    };
  });
}, [customers, appointments, campaigns, selectedPeriod]);
```

#### Step 4: Display in UI
```typescript
// In the card render:
<View style={styles.card}>
  {activePromotion ? (
    <>
      <Text>
        Promotion: {activePromotion.name}
        {activePromotion.startDate} - {activePromotion.endDate}
      </Text>
      <Text>Current Revenue: ${promotionRevenue.toLocaleString()}</Text>
      <View style={styles.progressBar}>
        <View style={{ width: `${promotionProgress}%` }} />
      </View>
      <Text>{getProgressLabel(promotionProgress)}</Text>
    </>
  ) : (
    <Text>No active promotion</Text>
  )}
</View>
```

---

## 🔵 **BACKEND - How Data Is Stored and Calculated**

### Database Tables Needed

#### 1. **Marketing Campaigns Table**
```sql
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email', 'social', 'referral', 'promotion', 'advertisement'
  status VARCHAR(20) NOT NULL, -- 'active', 'paused', 'completed', 'draft'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  spent DECIMAL(10,2) DEFAULT 0,
  target_leads INTEGER,
  target_revenue DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **Promotions Table**
```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., "SPRING20"
  type VARCHAR(50) NOT NULL, -- 'discount', 'package', 'referral', 'loyalty'
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_revenue DECIMAL(10,2),
  max_redemptions INTEGER,
  status VARCHAR(20) NOT NULL, -- 'active', 'expired', 'paused'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. **Customer Acquisition Source (Add to Customers Table)**
```sql
ALTER TABLE customers ADD COLUMN acquisition_source VARCHAR(100);
-- Values: 'social_media', 'referral', 'google_ads', 'email', 'walk_in', 'other'

ALTER TABLE customers ADD COLUMN referral_code VARCHAR(50);
-- For tracking referral sources
```

#### 4. **Promotion Redemptions Table**
```sql
CREATE TABLE promotion_redemptions (
  id UUID PRIMARY KEY,
  promotion_id UUID REFERENCES promotions(id),
  appointment_id UUID REFERENCES appointments(id),
  customer_id UUID REFERENCES customers(id),
  discount_amount DECIMAL(10,2) NOT NULL,
  redeemed_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. **Campaign Tracking Table**
```sql
CREATE TABLE campaign_tracking (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES marketing_campaigns(id),
  appointment_id UUID REFERENCES appointments(id),
  customer_id UUID REFERENCES customers(id),
  event_type VARCHAR(50), -- 'lead', 'appointment', 'revenue'
  revenue DECIMAL(10,2),
  tracked_at TIMESTAMP DEFAULT NOW()
);
```

### Backend API Endpoints

#### Option 1: Calculate on Backend (Recommended)
```typescript
// GET /api/owner/marketing-analysis?period=month

async function getMarketingAnalysis(period: 'week' | 'month' | 'quarter' | 'year') {
  const { startDate, endDate } = getPeriodDates(period);
  
  // 1. Get active campaigns in period
  const campaigns = await db.query(`
    SELECT 
      id, name, type, status, 
      start_date, end_date,
      budget, spent,
      (SELECT COUNT(*) FROM campaign_tracking 
       WHERE campaign_id = mc.id AND event_type = 'lead') as leads,
      (SELECT COUNT(DISTINCT appointment_id) FROM campaign_tracking 
       WHERE campaign_id = mc.id AND event_type = 'appointment') as appointments,
      (SELECT COALESCE(SUM(revenue), 0) FROM campaign_tracking 
       WHERE campaign_id = mc.id) as revenue
    FROM marketing_campaigns mc
    WHERE business_id = $1
      AND (start_date <= $3 AND end_date >= $2)
  `, [businessId, startDate, endDate]);
  
  // Calculate CPA and ROI for each campaign
  const campaignsWithMetrics = campaigns.map(campaign => {
    const cpa = campaign.appointments > 0 
      ? campaign.spent / campaign.appointments 
      : 0;
    const roi = campaign.spent > 0 
      ? ((campaign.revenue - campaign.spent) / campaign.spent) * 100
      : 0;
    
    return {
      ...campaign,
      cpa: Math.round(cpa * 100) / 100,
      roi: Math.round(roi),
      engagement: calculateEngagement(campaign.id) // From tracking data
    };
  });
  
  // 2. Get customer acquisition channels
  const channels = await db.query(`
    SELECT 
      acquisition_source,
      COUNT(DISTINCT c.id) as new_clients,
      SUM(a.price) as revenue
    FROM customers c
    LEFT JOIN appointments a ON a.customer_id = c.id
    WHERE c.business_id = $1
      AND c.created_at BETWEEN $2 AND $3
    GROUP BY acquisition_source
  `, [businessId, startDate, endDate]);
  
  // Get campaign spend per channel
  const channelSpend = await db.query(`
    SELECT 
      type,
      SUM(spent) as total_spent
    FROM marketing_campaigns
    WHERE business_id = $1
      AND (start_date <= $3 AND end_date >= $2)
    GROUP BY type
  `, [businessId, startDate, endDate]);
  
  // 3. Get active promotions
  const promotions = await db.query(`
    SELECT 
      p.*,
      COUNT(pr.id) as redemptions,
      COALESCE(SUM(pr.discount_amount), 0) as cost,
      (SELECT COALESCE(SUM(a.price), 0) FROM appointments a
       JOIN promotion_redemptions pr2 ON pr2.appointment_id = a.id
       WHERE pr2.promotion_id = p.id) as revenue
    FROM promotions p
    LEFT JOIN promotion_redemptions pr ON pr.promotion_id = p.id
    WHERE p.business_id = $1
      AND p.status = 'active'
      AND (p.start_date <= $3 AND p.end_date >= $2)
    GROUP BY p.id
  `, [businessId, startDate, endDate]);
  
  return {
    campaigns: campaignsWithMetrics,
    acquisitionChannels: calculateChannelMetrics(channels, channelSpend),
    promotions,
    period: { startDate, endDate }
  };
}
```

---

## 📊 **KEY METRICS EXPLAINED**

### 1. **ROI (Return on Investment)**
```
ROI = ((Revenue - Cost) / Cost) × 100

Example:
  Campaign Cost: $1,000
  Revenue Generated: $3,000
  ROI = ((3,000 - 1,000) / 1,000) × 100 = 200%
  
Meaning: For every $1 spent, you made $3 (200% return)
```

### 2. **CPA (Cost Per Acquisition)**
```
CPA = Total Campaign Cost / Number of New Customers

Example:
  Campaign Cost: $1,500
  New Customers: 30
  CPA = 1,500 / 30 = $50
  
Meaning: It costs $50 to acquire each new customer
```

### 3. **Conversion Rate**
```
Conversion Rate = (Appointments / Leads) × 100

Example:
  Leads: 100 (people who showed interest)
  Appointments: 25 (people who actually booked)
  Conversion Rate = (25 / 100) × 100 = 25%
  
Meaning: 25% of leads convert to appointments
```

### 4. **Engagement Rate**
```
Engagement = (Interactions / Reach) × 100

Example:
  Social Media Post Reach: 1,000 people
  Likes/Comments/Shares: 150
  Engagement = (150 / 1,000) × 100 = 15%
```

---

## 📊 **Example Calculation Walkthrough**

Let's say you ran a **"Summer Hair Special"** campaign:

### Campaign Setup:
- **Type:** Social Media Promotion
- **Budget:** $2,000
- **Duration:** December 1-31, 2024
- **Spent:** $1,200 (on ads)

### Results:
- **Leads:** 45 people clicked/interested
- **Appointments:** 32 people booked
- **Revenue:** $4,800 (from those appointments)

### Calculations:
```
Conversion Rate = (32 / 45) × 100 = 71.1%
CPA = $1,200 / 32 = $37.50 per customer
ROI = ((4,800 - 1,200) / 1,200) × 100 = 300%

Meaning:
- 71% of leads converted (very good!)
- Each customer cost $37.50 to acquire
- You made 300% return (3x your investment)
```

---

## 🔄 **Data Flow Diagram**

```
┌─────────────────┐
│  User Selects   │  User selects period (week/month/quarter/year)
│     Period      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Frontend Request               │
│  - Get campaigns for period         │
│  - Get promotions for period        │
│  - Get customer acquisition data    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Backend API                    │
│  - Query marketing_campaigns table  │
│  - Query promotions table           │
│  - Query customers (acquisition)    │
│  - Query campaign_tracking          │
│  - Calculate metrics                │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Return Calculated Data         │
│  - Campaigns with ROI, CPA          │
│  - Acquisition channels             │
│  - Active promotions                │
│  - Client segments                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Frontend Display               │
│  - KPI Cards (New Clients, ROI)     │
│  - Campaign Cards                   │
│  - Channel Performance              │
│  - Promotion Progress               │
└─────────────────────────────────────┘
```

---

## 📝 **Card on Business Analytics Page**

### Current State (Hardcoded):
- Shows static promotion text
- Shows hardcoded revenue ($2,500)
- Shows static progress (50%)

### How It Should Work:
1. **Find Active Promotion** for the selected date
2. **Calculate Revenue** from appointments using that promotion code
3. **Calculate Progress** toward promotion target
4. **Display Dynamic Data**:
   ```
   Promotion: "Summer Special 20% Off"
   Dates: Dec 1 - Dec 31
   Current Revenue: $4,800 (from real appointments)
   Progress: 60% (if target is $8,000)
   ```

---

## 💡 **Key Concepts**

### Marketing Campaign
- A planned marketing activity (ad, email blast, social media post)
- Has a budget, start/end dates, and goals
- Tracks: leads, appointments, revenue, ROI

### Customer Acquisition Channel
- Where new customers found your business
- Examples: Social Media, Referrals, Google Ads, Email, Walk-ins
- Tracks: new clients, cost, conversion rate, ROI per channel

### Promotion
- Discount or special offer with a code
- Example: "SPRING20" for 20% off
- Tracks: redemptions, revenue, cost, performance

### ROI vs CPA
- **ROI** = How much profit you made (percentage)
- **CPA** = How much each customer cost you (dollar amount)
- **Good ROI:** > 200% (you make 2x what you spent)
- **Good CPA:** < $50 (cheap to acquire customers)

### Why This Matters
- **Low ROI (< 100%):** Campaign is losing money
- **High CPA (> $100):** Too expensive to acquire customers
- **High ROI (> 300%):** Excellent campaign, scale it up!
- **Low Conversion (< 10%):** Need to improve campaign messaging

---

## 🚀 **Implementation Steps**

### Phase 1: Frontend Card (Current Phase)
1. ⏳ Connect to `ownerAPI.getPromotions()` 
2. ⏳ Calculate active promotion for selected date
3. ⏳ Calculate revenue from promotion code
4. ⏳ Display dynamic values in card

### Phase 2: Backend API (Future)
1. ⏳ Create marketing campaigns table
2. ⏳ Create promotions table
3. ⏳ Add acquisition_source to customers
4. ⏳ Create tracking tables
5. ⏳ Build API endpoints

### Phase 3: Full Page Integration
1. ⏳ Connect all tabs to real data
2. ⏳ Calculate ROI, CPA dynamically
3. ⏳ Show real acquisition channels
4. ⏳ Display actual promotion performance

---

## 📝 **Summary**

**Current State:**
- Card shows hardcoded promotion and revenue
- MarketingAnalysis page shows sample data
- No connection to real business data

**How It Should Work:**
- **Frontend:** Calculates from appointments + promotions + customers
- **Backend:** Stores campaigns, promotions, and tracks customer acquisition
- **Display:** Shows real-time marketing performance with ROI, CPA, and channel analysis

**Next Steps:**
1. Connect card to real promotion data
2. Calculate revenue from appointments with promotion codes
3. Track customer acquisition sources
4. (Future) Build full backend for campaigns and promotions

This page helps owners understand which marketing efforts are working and where to invest their marketing budget!

