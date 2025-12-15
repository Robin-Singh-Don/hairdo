# 🚀 **AppointmentContext Supabase Setup Guide**
## Step-by-Step Instructions to Enable Real Data Persistence

---

## 📋 **Overview**

This guide will help you set up Supabase for AppointmentContext, enabling real data persistence instead of mock data (TempDB).

**What This Does:**
- ✅ Appointments save to a real database
- ✅ Data persists when app closes
- ✅ All users see the same data
- ✅ Works across all devices

---

## 🎯 **Prerequisites**

Before starting, make sure you have:
- [ ] A Supabase account (free at [supabase.com](https://supabase.com))
- [ ] Node.js and npm installed
- [ ] Your project set up and running

---

## 📝 **Step 1: Install Supabase Package**

Open your terminal in the project root and run:

```bash
npm install @supabase/supabase-js
```

**Verify Installation:**
```bash
npm list @supabase/supabase-js
```

You should see the package version listed.

---

## 📝 **Step 2: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name:** `hairdo-app` (or your preferred name)
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for project to initialize

---

## 📝 **Step 3: Get Supabase Credentials**

1. In your Supabase project dashboard, click **Settings** (gear icon)
2. Click **API** in the left sidebar
3. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

**Copy both values** - you'll need them in the next step.

---

## 📝 **Step 4: Set Environment Variables**

### **Option A: Using .env file (Recommended)**

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add these lines:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace:**
- `https://xxxxx.supabase.co` with your Project URL
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your anon/public key

3. **Important:** Add `.env` to `.gitignore` to keep credentials safe:

```gitignore
# Environment variables
.env
```

### **Option B: Using Expo Config (app.json or app.config.js)**

If you prefer, you can add environment variables in your Expo config:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://xxxxx.supabase.co",
      "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Note:** For Expo, you need to use `EXPO_PUBLIC_` prefix for environment variables to be accessible in the app.

---

## 📝 **Step 5: Create Database Tables**

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file: `docs/SUPABASE_APPOINTMENTS_SCHEMA.sql`
4. Copy **ALL** the SQL code from that file
5. Paste it into the SQL Editor
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

**What This Creates:**
- ✅ `appointments` table - Stores all appointments
- ✅ `employees` table - Stores employee/staff information
- ✅ `clients` table - Stores client/customer information
- ✅ Indexes for fast queries
- ✅ Security policies (RLS)
- ✅ Helper functions for calculations

**Expected Result:**
You should see "Success. No rows returned" - this means the tables were created successfully.

---

## 📝 **Step 6: Verify Tables Were Created**

1. In Supabase dashboard, click **Table Editor** in the left sidebar
2. You should see three new tables:
   - ✅ `appointments`
   - ✅ `employees`
   - ✅ `clients`

If you see these tables, you're good to go! 🎉

---

## 📝 **Step 7: Test the Connection**

### **Test 1: Check if Supabase Client Loads**

1. Restart your Expo development server:
   ```bash
   npm start
   ```

2. Open your app and check the console/logs

3. You should **NOT** see: "Supabase package not installed"

### **Test 2: Create a Test Appointment**

1. In your app, try to create an appointment (through AddClientScreen or similar)
2. Check Supabase dashboard → Table Editor → `appointments` table
3. You should see the new appointment appear!

**If you see the appointment in Supabase:**
- ✅ **Success!** AppointmentContext is now using Supabase!

**If you don't see the appointment:**
- Check environment variables are set correctly
- Check Supabase URL and key are correct
- Check console for errors

---

## 🔧 **Troubleshooting**

### **Problem: "Supabase package not installed"**

**Solution:**
```bash
npm install @supabase/supabase-js
```

Then restart your development server.

---

### **Problem: "Supabase client is required"**

**Solution:**
1. Check your `.env` file exists and has correct values
2. Make sure variable names start with `EXPO_PUBLIC_`
3. Restart your development server after changing `.env`

---

### **Problem: "Error fetching appointments"**

**Solution:**
1. Check Supabase dashboard → Table Editor → verify `appointments` table exists
2. Check SQL Editor → verify schema was run successfully
3. Check RLS policies are set correctly (they should be created by the schema)

---

### **Problem: "Permission denied" or RLS errors**

**Solution:**
1. In Supabase dashboard, go to **Authentication** → **Policies**
2. Check that RLS policies were created (they should be from the schema)
3. For testing, you can temporarily disable RLS:
   ```sql
   ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
   ```
   **⚠️ Warning:** Only do this for testing! Re-enable RLS before production.

---

### **Problem: Data not persisting**

**Solution:**
1. Check that you're using the Supabase repository (not TempDB)
2. Check console logs for errors
3. Verify environment variables are loaded:
   ```typescript
   console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
   ```

---

## ✅ **Verification Checklist**

After setup, verify everything works:

- [ ] Supabase package installed
- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Database tables created (appointments, employees, clients)
- [ ] Can create appointment in app
- [ ] Appointment appears in Supabase dashboard
- [ ] Appointment persists after app restart
- [ ] Owner dashboard shows appointments
- [ ] Employee schedule shows appointments
- [ ] Customer bookings show appointments

---

## 🎯 **What Happens Next?**

Once AppointmentContext is using Supabase:

1. **✅ All Appointments Persist**
   - Data saved to cloud database
   - Survives app restarts
   - Works across devices

2. **✅ Real-Time Updates**
   - Owner creates appointment → Employee sees it
   - Customer books → Owner sees it
   - Everyone sees the same data

3. **✅ Analytics Work**
   - Revenue calculations use real data
   - Statistics are accurate
   - Reports are meaningful

4. **✅ Ready for Production**
   - Can test with real users
   - Data is secure
   - Scalable infrastructure

---

## 📚 **Next Steps**

After AppointmentContext is working:

1. **Migrate Employees Data**
   - Update `employees` table with real staff data
   - Connect employee management to Supabase

2. **Migrate Clients Data**
   - Update `clients` table with real customer data
   - Connect client management to Supabase

3. **Add Real-Time Subscriptions**
   - Subscribe to appointment changes
   - Update UI automatically when data changes

4. **Optimize Performance**
   - Add caching
   - Optimize queries
   - Add pagination

---

## 🆘 **Need Help?**

If you encounter issues:

1. Check the troubleshooting section above
2. Check Supabase dashboard logs (Settings → Logs)
3. Check your app console for errors
4. Verify all steps were completed

---

## 🎉 **Success!**

Once you see appointments appearing in Supabase, **you've successfully migrated AppointmentContext!**

**Your app now has:**
- ✅ Real data persistence
- ✅ Cloud-based storage
- ✅ Multi-user support
- ✅ Production-ready foundation

**Congratulations!** 🚀

