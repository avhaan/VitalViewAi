# 🚀 VitalView AI - Deployment Guide

## 📋 Overview
This Next.js full-stack application includes:
- **Frontend:** React UI with Tailwind CSS
- **Backend:** Next.js API routes (built-in)
- **AI:** Gemini API for medical analysis
- **Voice:** ElevenLabs TTS for chatbot
- **Location:** Google Maps & Places API
- **3D:** Spline 3D models

---

## ✅ Recommended: Deploy to Vercel (Free)

**Why Vercel?**
- Built specifically for Next.js
- Zero configuration needed
- Free SSL, custom domains
- Automatic API routes deployment
- Edge functions included
- Instant deployments from Git

---

## 🎯 Quick Deploy Steps

### **1. Push to GitHub**

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - VitalView AI"

# Create GitHub repo and push
gh repo create vitalview-ai --public --source=. --remote=origin --push
```

OR manually:
1. Create repo on github.com
2. ```bash
   git remote add origin https://github.com/YOUR_USERNAME/vitalview-ai.git
   git branch -M main
   git push -u origin main
   ```

---

### **2. Deploy to Vercel**

#### **Option A: Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. **Import** your GitHub repository
4. Vercel auto-detects Next.js ✅
5. **Add Environment Variables** (see below)
6. Click **"Deploy"**
7. Done! 🎉

#### **Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? vitalview-ai
# - Directory? ./
# - Override settings? No

# Production deployment
vercel --prod
```

---

## 🔐 Environment Variables for Vercel

In the Vercel dashboard, add these environment variables:

### **Required:**

```bash
# Gemini AI (server-side)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Maps (client-side - visible in browser)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Google Places (server-side)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### **Optional (for full features):**

```bash
# ElevenLabs TTS (server-side)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**How to add them:**
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add each variable (Name + Value)
3. Select environments: ✅ Production, ✅ Preview, ✅ Development
4. Click **"Save"**

---

## 🛠️ Build Settings (Auto-detected by Vercel)

Vercel automatically uses:

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "next dev"
}
```

**Framework:** Next.js  
**Node Version:** 18.x (auto-detected)

---

## 🌍 Custom Domain (Optional)

1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain (e.g., `vitalview.ai`)
3. Follow DNS setup instructions
4. Vercel provides SSL automatically 🔒

---

## 🔧 Post-Deployment Checklist

### **Test All Features:**

- [ ] **Homepage** loads correctly
- [ ] **Upload PDF** - Medical report analysis works
- [ ] **Visualizations** - Charts and gauges render
- [ ] **Dr. Chick Chatbot** - AI responses work
- [ ] **Voice** - ElevenLabs TTS plays audio
- [ ] **Nearby Care** - Map and location search work
- [ ] **BMI Calculator** - Calculations are correct
- [ ] **3D Models** - Spline animations load

### **Check Console:**
- No API errors
- All assets load (images, fonts, 3D models)
- CORS configured correctly

---

## 📊 Deployment Output

After successful deployment, you'll get:

```
✅ Production: https://vitalview-ai.vercel.app
✅ Preview: https://vitalview-ai-git-main-username.vercel.app
```

**Share these URLs with:**
- Users
- Doctors
- Team members
- Portfolio

---

## 🚀 Alternative Hosting Options

### **Option 2: Netlify (Free)**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

**Build settings for Netlify:**
```toml
# netlify.toml
[build]
  command = "next build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### **Option 3: Railway (Free Tier)**

1. Go to [railway.app](https://railway.app)
2. Import GitHub repo
3. Add environment variables
4. Deploy automatically

---

## 🔄 Continuous Deployment (Auto-deploy)

**With Vercel (automatic):**
- Every `git push` to `main` → auto-deploys to production
- Pull requests → get preview URLs
- Rollback to any previous deployment in 1 click

**GitHub Actions (optional - Vercel does this automatically):**
Already built-in! No setup needed.

---

## 📈 Monitoring & Analytics

### **Vercel Analytics (Free)**

Already included! Check:
- Page views
- Performance metrics
- User behavior
- API endpoint usage

Access: Vercel Dashboard → Your Project → **Analytics**

---

## 🐛 Troubleshooting

### **Issue: API Routes 404**
**Fix:** Ensure API files are in `/app/api/` directory
**Verify:** Routes should be at `/api/chat`, `/api/flowchart`, etc.

### **Issue: Environment Variables Not Working**
**Fix:** 
1. Re-deploy after adding env vars
2. Check spelling (case-sensitive)
3. Restart deployment: `vercel --prod`

### **Issue: Build Fails**
**Check:**
```bash
# Test build locally first
npm run build

# If successful, commit and push
git add .
git commit -m "Fix build"
git push
```

### **Issue: 3D Models Not Loading**
**Fix:** Ensure Spline URLs are accessible
**Check:** CORS settings on Spline hosting

### **Issue: PDF Upload Fails**
**Check:** File size limits (Vercel: 4.5MB body limit)
**Fix:** Add `maxBodySize` in `next.config.js` if needed

---

## 🔐 Security Best Practices

### **✅ What's Secure:**
- ✅ Server-side API keys (GEMINI_API_KEY, ELEVENLABS_API_KEY)
- ✅ HTTPS enabled by default
- ✅ API routes protected

### **⚠️ Client-side Keys:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - visible in browser
- **Protect with:** API key restrictions in Google Cloud Console
  - Restrict to your domain: `vitalview-ai.vercel.app`
  - Limit to Maps/Places APIs only

---

## 📱 Performance Optimization

**Already implemented:**
- ✅ Code splitting (Next.js automatic)
- ✅ Image optimization
- ✅ Dynamic imports for 3D models
- ✅ Lazy loading for chatbot

**Vercel provides:**
- ✅ Edge caching
- ✅ CDN for static assets
- ✅ Automatic compression (Brotli/Gzip)

---

## 💰 Costs (Free Tier Limits)

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless function executions: 100GB-hours
- ✅ 100 builds/day
- ✅ Custom domain (1 free)

**API Usage (you pay for):**
- Gemini AI: Free tier then pay-per-use
- ElevenLabs: 10K chars/month free
- Google Maps: $200 free credit/month

---

## 📚 Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Test production build locally
npm run build && npm start

# Deploy to Vercel
vercel --prod

# Check deployment logs
vercel logs

# Remove deployment
vercel rm vitalview-ai
```

---

## 🎉 Success! Your App is Live

**Production URL:** `https://vitalview-ai.vercel.app`

**Next steps:**
1. Share with users
2. Add to portfolio
3. Monitor analytics
4. Gather feedback
5. Iterate and improve!

---

## 📞 Support

**Vercel Docs:** https://vercel.com/docs  
**Next.js Docs:** https://nextjs.org/docs  
**Gemini API:** https://ai.google.dev/docs  

---

**Happy Deploying! 🚀✨**
