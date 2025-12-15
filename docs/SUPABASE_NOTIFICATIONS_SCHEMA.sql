-- ============================================
-- SUPABASE NOTIFICATIONS TABLE SCHEMA
-- ============================================
-- This SQL script creates the notifications table for the owner notification system
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_type VARCHAR(20) DEFAULT 'owner', -- 'owner' | 'employee' | 'customer'
  business_id UUID, -- Optional: for business-specific notifications
  
  -- Notification content
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL, -- Main notification message
  type VARCHAR(50) NOT NULL, -- Notification type (see types below)
  priority VARCHAR(10) DEFAULT 'medium', -- 'high' | 'medium' | 'low'
  
  -- Category (derived from type, but can be set explicitly)
  category VARCHAR(20), -- 'business' | 'staff' | 'customer' | 'system'
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Action data
  action_url TEXT, -- URL to navigate when notification is clicked
  action_data JSONB, -- Additional data for actions (appointment_id, staff_id, etc.)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_type);
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert notifications for users
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true); -- Adjust based on your security needs

-- Policy: Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- ============================================
-- NOTIFICATION TYPES REFERENCE
-- ============================================
-- Staff Notifications (category: 'staff'):
--   - staff_schedule_change
--   - staff_time_off_request
--   - staff_time_off_approved
--   - staff_time_off_rejected
--   - staff_added
--   - staff_removed
--   - staff_schedule_conflict
--
-- Customer Notifications (category: 'customer'):
--   - appointment_booked
--   - appointment_cancelled
--   - appointment_rescheduled
--   - appointment_reminder
--   - customer_review
--   - customer_complaint
--   - customer_no_show
--
-- Business Notifications (category: 'business'):
--   - revenue_milestone
--   - payment_received
--   - payment_failed
--   - low_inventory
--   - marketing_campaign_started
--   - marketing_campaign_completed
--   - business_hours_changed
--
-- System Notifications (category: 'system'):
--   - system_update
--   - security_alert
--   - account_verification
--   - subscription_expiring
--   - subscription_expired
--   - maintenance_scheduled
-- ============================================

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment and modify to insert test notifications
/*
INSERT INTO notifications (user_id, user_type, title, body, type, priority, category) VALUES
  ('YOUR_USER_ID', 'owner', 'New Appointment', 'John Doe booked an appointment for tomorrow', 'appointment_booked', 'medium', 'customer'),
  ('YOUR_USER_ID', 'owner', 'Staff Schedule Change', 'Sarah requested time off next week', 'staff_time_off_request', 'high', 'staff'),
  ('YOUR_USER_ID', 'owner', 'Payment Received', 'Payment of $150 received from appointment #123', 'payment_received', 'low', 'business'),
  ('YOUR_USER_ID', 'owner', 'System Update', 'New features available in your dashboard', 'system_update', 'low', 'system');
*/

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get all unread notifications for a user
-- SELECT * FROM notifications 
-- WHERE user_id = 'YOUR_USER_ID' 
-- AND is_read = FALSE 
-- ORDER BY created_at DESC;

-- Get notifications by category
-- SELECT * FROM notifications 
-- WHERE user_id = 'YOUR_USER_ID' 
-- AND category = 'staff' 
-- ORDER BY created_at DESC;

-- Mark all notifications as read
-- UPDATE notifications 
-- SET is_read = TRUE, read_at = NOW() 
-- WHERE user_id = 'YOUR_USER_ID' 
-- AND is_read = FALSE;

-- Get notification count by category
-- SELECT category, COUNT(*) as count 
-- FROM notifications 
-- WHERE user_id = 'YOUR_USER_ID' 
-- AND is_read = FALSE 
-- GROUP BY category;

