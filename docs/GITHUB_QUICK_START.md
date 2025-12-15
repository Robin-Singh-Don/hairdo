# ⚡ **Quick Start: Push to GitHub**

## ✅ **Step 1: Create GitHub Repository**

1. Go to [github.com](https://github.com) and sign in
2. Click **"+"** → **"New repository"**
3. Name: `hairdo` (or your choice)
4. **⚠️ DO NOT** check "Initialize with README"
5. Click **"Create repository"**
6. **Copy the repository URL** (HTTPS format)

---

## 📝 **Step 2: Connect to GitHub**

Run these commands (replace with your actual GitHub URL):

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/hairdo.git

# Verify it was added
git remote -v
```

---

## 💾 **Step 3: Create Initial Commit**

```bash
# Create commit
git commit -m "Initial commit: HairDo app with Supabase integration"
```

---

## 🚀 **Step 4: Push to GitHub**

```bash
# Push to GitHub
git push -u origin main
```

**Note:** If you get an error about `main` branch, try:
```bash
git push -u origin master
```

---

## ✅ **Done!**

Your code is now on GitHub! 🎉

**Future updates:**
```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 🔒 **What's Protected**

Your `.env` file (with Supabase credentials) is **NOT** pushed to GitHub - it's in `.gitignore` ✅

