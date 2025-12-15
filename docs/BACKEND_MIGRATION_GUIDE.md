# Backend Migration Guide

This guide explains how to easily switch from mock data to Supabase backend or any other backend service.

## 🏗️ Architecture Overview

The app uses a **Service Layer Pattern** with **Context API** for state management:

```
UI Components → ProfileContext → ProfileService → Backend (Mock/Supabase)
```

## 🔄 Switching to Supabase

### Step 1: Install Supabase
```bash
npm install @supabase/supabase-js
```

**Note**: The app will work without Supabase installed - it automatically falls back to mock data. Install Supabase only when you're ready to use the real backend.

### Step 2: Set Environment Variables
Create `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 3: Initialize Database
Run the SQL schema in your Supabase dashboard:
```sql
-- Copy the schema from services/supabase/SupabaseConfig.ts
```

### Step 4: Switch Configuration
In `config/AppConfig.ts`:
```typescript
export const CURRENT_CONFIG: AppConfig = PROD_CONFIG; // Change from DEV_CONFIG
```

### Step 5: Deploy
That's it! Your app now uses Supabase backend.

## 🎯 Benefits of This Architecture

### ✅ **Easy Backend Switching**
- Change one line in config to switch backends
- No code changes needed in UI components
- Seamless development → production transition

### ✅ **Multi-User Support**
- Each user gets their own profile data
- Automatic user isolation with RLS policies
- Scalable to thousands of users

### ✅ **Real-Time Updates**
- All users see updates instantly
- Optimistic updates for better UX
- Automatic error handling and retry

### ✅ **Offline Support**
- Works offline with mock data
- Automatic sync when online
- Graceful degradation

## 🔧 Adding New Backend Services

### Step 1: Create Service Class
```typescript
// services/profile/FirebaseProfileService.ts
export class FirebaseProfileService implements ProfileServiceInterface {
  // Implement all interface methods
}
```

### Step 2: Add to Factory
```typescript
// services/profile/ProfileService.ts
export class ProfileServiceFactory {
  static create(serviceType: 'mock' | 'supabase' | 'firebase', client?: any) {
    switch (serviceType) {
      case 'firebase':
        return new FirebaseProfileService(client);
      // ... other cases
    }
  }
}
```

### Step 3: Update Config
```typescript
// config/AppConfig.ts
export const PROD_CONFIG: AppConfig = {
  profileService: 'firebase', // Change backend
  // ... other config
};
```

## 📱 User Experience

### Development Mode (Mock)
- Instant loading (no network calls)
- Perfect for testing UI
- Consistent data across sessions

### Production Mode (Supabase)
- Real user data
- Multi-user support
- Persistent across devices
- Real-time updates

## 🚀 Deployment Checklist

- [ ] Set environment variables
- [ ] Initialize Supabase database
- [ ] Switch config to PROD_CONFIG
- [ ] Test user registration/login
- [ ] Verify profile updates work
- [ ] Test image uploads
- [ ] Check offline behavior

## 🔍 Debugging

### Check Current Service
```typescript
// In any component
const { profileData, loading, error } = useProfile();
console.log('Current service:', config.profileService);
console.log('Profile data:', profileData);
console.log('Loading:', loading);
console.log('Error:', error);
```

## 🛠️ Troubleshooting

### Error: "Unable to resolve module @supabase/supabase-js"
**Solution**: This is expected if Supabase isn't installed yet. The app will automatically use mock data.

To install Supabase when ready:
```bash
npm install @supabase/supabase-js
```

### Error: "Supabase client not available. Falling back to mock service"
**Solution**: This is normal behavior. The app automatically falls back to mock data when Supabase isn't configured.

### Mock Service Always Used
**Check**:
1. Verify Supabase is installed: `npm list @supabase/supabase-js`
2. Check environment variables are set
3. Verify config is set to `PROD_CONFIG`

### Mock Service Benefits
- Fast development
- No network dependencies
- Consistent test data
- Easy debugging

### Supabase Service Benefits
- Real user data
- Multi-user support
- Persistent storage
- Real-time sync

## 📊 Performance Considerations

### Mock Service
- ⚡ Instant responses
- 💾 No network calls
- 🔄 No caching needed

### Supabase Service
- 🌐 Network requests
- 💾 Automatic caching
- 🔄 Optimistic updates
- ⚠️ Error handling

## 🎉 Success!

Your app now has:
- ✅ Scalable architecture
- ✅ Easy backend switching
- ✅ Multi-user support
- ✅ Real-time updates
- ✅ Offline capability
- ✅ Production ready

The same ProfileContext works with any backend - just change the service type!
