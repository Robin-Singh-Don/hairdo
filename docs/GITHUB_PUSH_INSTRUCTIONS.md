# 🚀 **Push to GitHub - Complete Instructions**

## ✅ **Current Status**

✅ Git repository initialized  
✅ All files staged and ready  
✅ `.gitignore` configured (`.env` file protected)  

---

## 📝 **Step 1: Set Git User Info (If Not Set)**

If you haven't set your git user info, run these commands:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

**Or set globally (for all repositories):**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 📝 **Step 2: Create Initial Commit**

```bash
git commit -m "Initial commit: HairDo app with Supabase integration"
```

---

## 📝 **Step 3: Create GitHub Repository**

1. Go to [github.com](https://github.com)
2. Sign in (or create account)
3. Click **"+"** (top right) → **"New repository"**
4. Fill in:
   - **Repository name:** `hairdo` (or your choice)
   - **Description:** (optional) "HairDo - Hair Salon Management App"
   - **Visibility:** Public or Private
   - **⚠️ IMPORTANT:** DO NOT check "Initialize with README"
5. Click **"Create repository"**

---

## 📝 **Step 4: Copy Repository URL**

After creating the repository, GitHub shows you the URL:
- **HTTPS:** `https://github.com/YOUR_USERNAME/hairdo.git`
- **SSH:** `git@github.com:YOUR_USERNAME/hairdo.git`

**Copy the HTTPS URL** (easier for first-time setup)

---

## 📝 **Step 5: Connect to GitHub**

Run this command (replace with your actual URL):

```bash
git remote add origin https://github.com/YOUR_USERNAME/hairdo.git
```

**Verify it was added:**
```bash
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/hairdo.git (fetch)
origin  https://github.com/YOUR_USERNAME/hairdo.git (push)
```

---

## 📝 **Step 6: Push to GitHub**

```bash
git push -u origin main
```

**If you get an error about `main` branch, try:**
```bash
git push -u origin master
```

**If you get authentication error:**
- GitHub may require a Personal Access Token
- Go to: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token with `repo` permissions
- Use token as password when prompted

---

## ✅ **Success!**

Once you see "Everything up-to-date" or similar, your code is on GitHub! 🎉

---

## 🔄 **Future Updates**

To push future changes:

```bash
# Check what changed
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

---

## 🔒 **What's Protected**

Your `.gitignore` ensures these files are **NOT** pushed:
- ✅ `.env` - Your Supabase credentials (kept private)
- ✅ `node_modules/` - Dependencies
- ✅ `.expo/` - Build files
- ✅ `.cursor/` - IDE files

**Your sensitive data is safe!** 🔒

---

## 🆘 **Troubleshooting**

### **"Repository not found"**
- Check repository URL is correct
- Verify repository exists on GitHub
- Make sure you have access

### **"Authentication failed"**
- Use Personal Access Token instead of password
- Create token: GitHub → Settings → Developer settings → Personal access tokens

### **"Branch 'main' does not exist"**
- Use: `git push -u origin master` instead
- Or create main branch: `git branch -M main`

---

## 📚 **Quick Reference**

**First Time:**
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/hairdo.git
git push -u origin main
```

**Regular Updates:**
```bash
git add .
git commit -m "Your message"
git push
```

---

**Need help?** Check `docs/GITHUB_SETUP_GUIDE.md` for detailed instructions!

