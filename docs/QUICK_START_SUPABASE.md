# ⚡ **Quick Start: Connect Supabase in 5 Minutes**

## ✅ **Step 1: Package Installed** ✅
The Supabase package is already installed!

---

## 📝 **Step 2: Create .env File**

Create a `.env` file in your project root with:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Get these values from:**
1. Go to [supabase.com](https://supabase.com)
2. Create a project (or use existing)
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon public key**

---

## 🗄️ **Step 3: Create Database Tables**

1. In Supabase dashboard → **SQL Editor**
2. Open `docs/SUPABASE_APPOINTMENTS_SCHEMA.sql`
3. Copy ALL SQL code
4. Paste in SQL Editor → Click **Run**

---

## 🔄 **Step 4: Restart Server**

```bash
npm start -- --clear
```

Look for: `✅ Supabase client initialized successfully`

---

## ✅ **Done!**

Your app now uses Supabase! 🚀

**Full guide:** `docs/SUPABASE_COMPLETE_SETUP_GUIDE.md`

