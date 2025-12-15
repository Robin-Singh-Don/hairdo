// Optional Supabase import - only loads when package is installed
let supabaseClient: any = null;

try {
  // Only import if the package is installed
  const { createClient } = require('@supabase/supabase-js');
  
  // Supabase configuration
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Only create client if both URL and key are provided
  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url' && supabaseAnonKey !== 'your-supabase-anon-key') {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized successfully');
  } else {
    console.log('⚠️ Supabase URL or key not configured. Using mock service only.');
    supabaseClient = null;
  }
} catch (error) {
  console.log('⚠️ Supabase package not installed. Using mock service only.');
  supabaseClient = null;
}

export { supabaseClient };

// Database schema for profiles table
export const PROFILE_TABLE_SCHEMA = `
-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  bio TEXT,
  email VARCHAR(255),
  phone VARCHAR(20),
  gender VARCHAR(20),
  birthday DATE,
  location VARCHAR(100),
  preferences TEXT,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true);

-- Create storage policy for profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile images are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');
`;

// Helper function to initialize database (run once)
export const initializeDatabase = async () => {
  try {
    console.log('Initializing Supabase database...');
    // Note: In production, run these SQL commands directly in Supabase dashboard
    // or use a migration tool
    console.log('Please run the following SQL in your Supabase dashboard:');
    console.log(PROFILE_TABLE_SCHEMA);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export default supabaseClient;
