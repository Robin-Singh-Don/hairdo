# 🚀 **Complete Supabase Setup Guide**
## Step-by-Step Instructions to Connect Your App to Supabase

---

## ✅ **Step 1: Supabase Package Installed**

✅ **DONE!** The `@supabase/supabase-js` package has been installed.

**Verify Installation:**
```bash
npm list @supabase/supabase-js
```

You should see the package version listed.

---

## 📝 **Step 2: Create Supabase Project**

### **2.1. Sign Up / Log In**
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account (or log in if you have one)
3. Click **"New Project"**

### **2.2. Create Project**
Fill in the project details:
- **Name:** `hairdo-app` (or your preferred name)
- **Database Password:** Create a strong password (save it securely!)
- **Region:** Choose the region closest to your users
- Click **"Create new project"**

### **2.3. Wait for Setup**
- Wait 2-3 minutes for the project to initialize
- You'll see a progress indicator

---

## 🔑 **Step 3: Get Supabase Credentials**

### **3.1. Navigate to API Settings**
1. In your Supabase project dashboard, click **Settings** (gear icon ⚙️)
2. Click **API** in the left sidebar

### **3.2. Copy Credentials**
You'll see two important values:

1. **Project URL**
   - Example: `https://xxxxxxxxxxxxx.supabase.co`
   - Click the copy button to copy it

2. **anon public key**
   - Long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Click the copy button to copy it

**⚠️ Keep these secure!** You'll need them in the next step.

---

## 📝 **Step 4: Configure Environment Variables**

### **4.1. Open .env File**
1. Open the `.env` file in your project root
2. You'll see placeholder values:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### **4.2. Replace with Your Credentials**
Replace the placeholder values with your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **4.3. Save the File**
- Save the `.env` file
- Make sure there are no extra spaces or quotes

---

## 🗄️ **Step 5: Create Database Tables**

### **5.1. Open SQL Editor**
1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **"New query"**

### **5.2. Run Appointments Schema**
1. Open the file: `docs/SUPABASE_APPOINTMENTS_SCHEMA.sql`
2. Copy **ALL** the SQL code
3. Paste it into the SQL Editor
4. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

**This creates:**
- ✅ `appointments` table
- ✅ `employees` table
- ✅ `clients` table
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for auto-updates

### **5.3. Verify Tables Created**
1. Click **Table Editor** in the left sidebar
2. You should see:
   - `appointments`
   - `employees`
   - `clients`

If you see these tables, ✅ **Success!**

---

## 🔄 **Step 6: Restart Development Server**

### **6.1. Stop Current Server**
- Press `Ctrl+C` in your terminal (if server is running)

### **6.2. Clear Cache (Optional but Recommended)**
```bash
npx expo start --clear
```

Or:
```bash
npm start -- --clear
```

### **6.3. Start Server**
```bash
npm start
```

### **6.4. Check Console**
Look for this message in your console:
```
✅ Supabase client initialized successfully
```

If you see this, ✅ **Supabase is connected!**

---

## ✅ **Step 7: Verify Connection**

### **7.1. Test in App**
1. Open your app
2. Try creating an appointment
3. Check your Supabase dashboard → Table Editor → `appointments` table
4. You should see the new appointment!

### **7.2. Check Console Logs**
- Look for: `✅ Supabase client initialized successfully`
- If you see: `⚠️ Supabase URL or key not configured` → Check your `.env` file

---

## 🎯 **What's Now Working**

### ✅ **Appointments**
- ✅ Create appointments → Saves to Supabase
- ✅ Update appointments → Updates in Supabase
- ✅ Delete appointments → Removes from Supabase
- ✅ View appointments → Loads from Supabase
- ✅ Data persists across app restarts
- ✅ All users see the same data

### ✅ **Automatic Features**
- ✅ Automatic data sync
- ✅ Real-time updates (when configured)
- ✅ Error handling with fallback
- ✅ Type-safe data mapping

---

## 🔧 **Troubleshooting**

### **Problem: "Supabase URL or key not configured"**

**Solution:**
1. Check `.env` file exists in project root
2. Verify values are correct (no quotes, no spaces)
3. Restart development server
4. Make sure you're using `EXPO_PUBLIC_` prefix

### **Problem: "Failed to initialize Supabase repository"**

**Solution:**
1. Check Supabase project is active
2. Verify credentials are correct
3. Check internet connection
4. App will fallback to TempDB (mock data) if Supabase fails

### **Problem: "Table does not exist"**

**Solution:**
1. Go to SQL Editor in Supabase
2. Run the schema from `docs/SUPABASE_APPOINTMENTS_SCHEMA.sql`
3. Verify tables exist in Table Editor

### **Problem: "Permission denied"**

**Solution:**
1. Check Row Level Security (RLS) policies
2. Make sure you ran the complete schema
3. Verify RLS policies are enabled

---

## 📊 **Next Steps**

### **1. Test Appointments**
- Create a few test appointments
- Verify they appear in Supabase dashboard
- Check data persists after app restart

### **2. Set Up Other Tables (Optional)**
- Profiles: `docs/SUPABASE_MESSAGES_SCHEMA.sql` (if using messages)
- Notifications: `docs/SUPABASE_NOTIFICATIONS_SCHEMA.sql` (if using notifications)

### **3. Configure Real-Time (Optional)**
- Enable real-time subscriptions for live updates
- See Supabase documentation for real-time setup

---

## 🎉 **Success!**

Your app is now connected to Supabase! 

**What Changed:**
- ✅ Appointments save to real database
- ✅ Data persists permanently
- ✅ Ready for production use
- ✅ Multi-user support enabled

**What Still Works:**
- ✅ All existing features
- ✅ All pages work as before
- ✅ Automatic fallback if Supabase unavailable

---

## 📚 **Additional Resources**

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Appointment Schema:** `docs/SUPABASE_APPOINTMENTS_SCHEMA.sql`
- **Setup Guide:** `docs/APPOINTMENT_CONTEXT_SETUP_GUIDE.md`
- **Verification Report:** `docs/APPOINTMENT_CONTEXT_VERIFICATION.md`

---

## 🆘 **Need Help?**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all steps were completed
3. Check Supabase dashboard for errors
4. Review console logs for error messages

**Status:** Ready to use Supabase! 🚀

