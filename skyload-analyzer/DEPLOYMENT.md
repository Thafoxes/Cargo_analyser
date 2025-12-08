# 🚀 Deploying to Vercel

This guide will help you deploy SkyLoad Analyzer to Vercel.

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
2. **GitHub Account**: (optional, but recommended for automatic deployments)
3. **Node.js 18+**: Installed locally for testing builds

---

## 🎯 Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
cd skyload-analyzer
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - SkyLoad Analyzer Phase 1"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/cargo_space_analyser.git
git branch -M main
git push -u origin main
```

### Step 2: Import Project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository (`cargo_space_analyser`)
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Project

**Project Settings:**
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `skyload-analyzer` ⚠️ **IMPORTANT!**
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 4: Add Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

```
ANTHROPIC_API_KEY = your_actual_api_key_here
```

> **Note:** If you don't have an API key, you can skip this. The app will use fallback algorithms.

### Step 5: Deploy!

Click **"Deploy"** and wait ~2-3 minutes. Your app will be live at:
```
https://your-project-name.vercel.app
```

---

## 🛠️ Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Navigate to Project

```bash
cd skyload-analyzer
```

### Step 4: Deploy

```bash
# First deployment (follow prompts)
vercel

# For production deployment
vercel --prod
```

**CLI Prompts:**
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N` (first time)
- **Project name?** → `skyload-analyzer` (or your choice)
- **Directory?** → `./` (current directory)
- **Override settings?** → `N` (use defaults)

### Step 5: Add Environment Variables

```bash
# Add environment variable
vercel env add ANTHROPIC_API_KEY

# When prompted:
# - Value: paste your API key
# - Environment: Production, Preview, Development (select all)
```

### Step 6: Redeploy with Environment Variables

```bash
vercel --prod
```

---

## ⚙️ Important Configuration

### Root Directory Setting

Since your Next.js app is in the `skyload-analyzer` subfolder, you **must** set the root directory in Vercel:

**Vercel Dashboard → Settings → General → Root Directory:**
```
skyload-analyzer
```

### Build Settings (Auto-detected)

Vercel should auto-detect these, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |
| **Node.js Version** | 18.x or 20.x |

---

## 🔧 Troubleshooting

### Issue: Build Fails - "Cannot find module"

**Solution:**
```bash
# Make sure you're in the skyload-analyzer directory
cd skyload-analyzer

# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Issue: 404 on All Routes

**Solution:** Check that **Root Directory** is set to `skyload-analyzer` in Vercel settings.

### Issue: Environment Variables Not Working

**Solution:**
1. Go to **Settings → Environment Variables**
2. Make sure variables are added to **Production**, **Preview**, and **Development**
3. Redeploy after adding variables

### Issue: API Routes Return 500

**Solution:**
- Check Vercel function logs: **Deployments → [Your Deployment] → Functions**
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API route code for errors

---

## 📊 Post-Deployment

### View Logs

```bash
# Via CLI
vercel logs

# Or in Dashboard
# Deployments → [Your Deployment] → Functions → View Logs
```

### Update Deployment

Every push to your `main` branch will trigger a new deployment automatically (if connected to GitHub).

### Custom Domain

1. Go to **Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Homepage loads at `https://your-app.vercel.app`
- [ ] Dashboard page works
- [ ] CSV upload works
- [ ] 3D Optimizer page loads
- [ ] AI placement API works (if API key is set)
- [ ] Environment variables are set correctly
- [ ] No console errors in browser DevTools

---

## 🎉 You're Done!

Your SkyLoad Analyzer is now live on Vercel! 🚀

**Next Steps:**
- Share your deployment URL
- Set up custom domain (optional)
- Monitor performance in Vercel dashboard
- Set up preview deployments for pull requests

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

