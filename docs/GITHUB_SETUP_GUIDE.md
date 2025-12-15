# 🚀 **GitHub Setup Guide**
## Push Your Code to GitHub

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Create GitHub Repository**

1. Go to [github.com](https://github.com)
2. Sign in (or create account)
3. Click **"+"** (top right) → **"New repository"**
4. Fill in:
   - **Repository name:** `hairdo` (or your preferred name)
   - **Description:** (optional) "HairDo - Hair Salon Management App"
   - **Visibility:** Choose Public or Private
   - **⚠️ DO NOT** check "Initialize with README" (we already have files)
5. Click **"Create repository"**

---

### **Step 2: Copy Repository URL**

After creating the repository, GitHub will show you the repository URL:
- **HTTPS:** `https://github.com/yourusername/hairdo.git`
- **SSH:** `git@github.com:yourusername/hairdo.git`

**Copy the HTTPS URL** (easier for first-time setup)

---

### **Step 3: Connect Local Repository to GitHub**

Run these commands in your terminal:

```bash
# Add remote repository (replace with your actual URL)
git remote add origin https://github.com/yourusername/hairdo.git

# Verify remote was added
git remote -v
```

---

### **Step 4: Create Initial Commit**

```bash
# Create initial commit
git commit -m "Initial commit: HairDo app with Supabase integration"
```

---

### **Step 5: Push to GitHub**

```bash
# Push to GitHub (first time)
git push -u origin main
```

**Note:** If your default branch is `master` instead of `main`, use:
```bash
git push -u origin master
```

---

## ✅ **What's Protected**

Your `.gitignore` file ensures these files are **NOT** pushed to GitHub:

- ✅ `.env` - Your Supabase credentials (kept private)
- ✅ `node_modules/` - Dependencies (too large)
- ✅ `.expo/` - Expo build files
- ✅ Build artifacts and temporary files

**Your sensitive data is safe!** 🔒

---

## 🔄 **Future Updates**

After the initial push, to update GitHub:

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

## 🔧 **Troubleshooting**

### **"Repository not found"**
- Check repository URL is correct
- Verify you have access to the repository
- Make sure repository exists on GitHub

### **"Authentication failed"**
- GitHub may require personal access token
- Go to: GitHub → Settings → Developer settings → Personal access tokens
- Create token with `repo` permissions
- Use token as password when prompted

### **"Branch 'main' does not exist"**
- Your default branch might be `master`
- Use: `git push -u origin master` instead

---

## 📚 **Useful Git Commands**

```bash
# Check status
git status

# See what files changed
git diff

# View commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout branch-name
```

---

## 🎉 **Success!**

Once you see "Everything up-to-date" or similar, your code is on GitHub! 🚀

**Next Steps:**
- Share repository with team members
- Set up GitHub Actions (optional)
- Create issues for tracking tasks
- Add README.md with project description

---

## 📝 **Quick Reference**

**First Time Setup:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/hairdo.git
git push -u origin main
```

**Regular Updates:**
```bash
git add .
git commit -m "Your commit message"
git push
```

---

**Need help?** Check GitHub documentation or ask for assistance!

