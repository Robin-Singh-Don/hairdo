-- ============================================
-- SUPABASE MESSAGES & CONVERSATIONS SCHEMA
-- ============================================
-- This SQL script creates the messages and conversations tables
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_ids UUID[] NOT NULL, -- Array of user IDs in the conversation
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_text TEXT,
  last_message_sender_id UUID,
  unread_count JSONB DEFAULT '{}', -- { "user_id": count } for each participant
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT conversations_min_participants CHECK (array_length(participant_ids, 1) >= 2)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  media_url TEXT, -- For images, videos, etc.
  media_type VARCHAR(20), -- 'image' | 'video' | 'audio' | 'file'
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_ids ON conversations USING GIN(participant_ids);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Create function to update conversation's last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_text = NEW.text,
    last_message_sender_id = NEW.sender_id,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation when new message is inserted
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Create function to update unread count
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment unread count for receiver
  IF NEW.receiver_id IS NOT NULL THEN
    UPDATE conversations
    SET unread_count = jsonb_set(
      COALESCE(unread_count, '{}'::jsonb),
      ARRAY[NEW.receiver_id::text],
      COALESCE((unread_count->NEW.receiver_id::text)::int, 0) + 1
    )
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update unread count
CREATE TRIGGER update_unread_count_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_unread_count();

-- Create function to reset unread count when message is read
CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    UPDATE conversations
    SET unread_count = jsonb_set(
      COALESCE(unread_count, '{}'::jsonb),
      ARRAY[NEW.receiver_id::text],
      '0'
    )
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to reset unread count
CREATE TRIGGER reset_unread_count_on_read
  AFTER UPDATE ON messages
  FOR EACH ROW
  WHEN (NEW.is_read = TRUE AND OLD.is_read = FALSE)
  EXECUTE FUNCTION reset_unread_count();

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
-- Users can view conversations they are part of
CREATE POLICY "Users can view their conversations"
  ON conversations
  FOR SELECT
  USING (auth.uid() = ANY(participant_ids));

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = ANY(participant_ids));

-- Users can update conversations they are part of
CREATE POLICY "Users can update their conversations"
  ON conversations
  FOR UPDATE
  USING (auth.uid() = ANY(participant_ids));

-- RLS Policies for messages
-- Users can view messages in conversations they are part of
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages
CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Users can mark messages as read if they are the receiver
CREATE POLICY "Users can mark messages as read"
  ON messages
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_id UUID,
  p_user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_ids @> ARRAY[p_user1_id, p_user2_id]
    AND array_length(participant_ids, 1) = 2
  LIMIT 1;
  
  -- If not found, create new conversation
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_ids)
    VALUES (ARRAY[p_user1_id, p_user2_id])
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE QUERIES
-- ============================================

-- Get all conversations for a user
-- SELECT c.*, 
--        p.username, 
--        p.full_name, 
--        p.profile_image
-- FROM conversations c
-- CROSS JOIN LATERAL unnest(c.participant_ids) AS participant_id
-- JOIN profiles p ON p.user_id = participant_id
-- WHERE c.participant_ids @> ARRAY['USER_ID_HERE'::UUID]
--   AND participant_id != 'USER_ID_HERE'::UUID
-- ORDER BY c.last_message_at DESC;

-- Get messages for a conversation
-- SELECT m.*, 
--        sender.username as sender_username,
--        sender.profile_image as sender_image
-- FROM messages m
-- JOIN profiles sender ON sender.user_id = m.sender_id
-- WHERE m.conversation_id = 'CONVERSATION_ID_HERE'
--   AND m.is_deleted = FALSE
-- ORDER BY m.created_at ASC;

-- Get unread message count for a user
-- SELECT COUNT(*) as unread_count
-- FROM messages m
-- JOIN conversations c ON c.id = m.conversation_id
-- WHERE m.receiver_id = 'USER_ID_HERE'
--   AND m.is_read = FALSE
--   AND m.is_deleted = FALSE;

