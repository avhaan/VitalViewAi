# ✅ VitalView AI Deployment Checklist

## Before Deployment

- [ ] All code is committed and pushed to GitHub
- [ ] `.env.example` contains all required variables
- [ ] Local build works: `npm run build`
- [ ] All features tested locally
- [ ] API keys are ready (Gemini, Google Maps, ElevenLabs)

## Vercel Setup

- [ ] GitHub repository connected to Vercel
- [ ] Framework detected as Next.js
- [ ] Build command: `next build`
- [ ] Install command: `npm install`

## Environment Variables (Add in Vercel Dashboard)

### Required:
- [ ] `GEMINI_API_KEY` - Gemini AI for medical analysis
- [ ] `GOOGLE_PLACES_API_KEY` - Google Places for nearby search
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps display

### Optional:
- [ ] `ELEVENLABS_API_KEY` - Voice synthesis for chatbot

## Post-Deployment Testing

### Homepage
- [ ] Page loads correctly
- [ ] Hero section displays
- [ ] Upload button works
- [ ] Navigation links work

### Medical Report Analysis
- [ ] PDF upload works
- [ ] AI analysis generates
- [ ] Visualizations render (charts, gauges)
- [ ] Detailed analysis displays

### Dr. Chick Chatbot
- [ ] Chatbot opens
- [ ] AI responses work
- [ ] 3D model loads
- [ ] Voice (ElevenLabs) plays (if enabled)

### Nearby Care
- [ ] Location permission prompt shows
- [ ] Map displays
- [ ] Places search works
- [ ] Results list populates
- [ ] "Open in Maps" links work

### BMI Calculator
- [ ] Calculator opens
- [ ] Calculations are correct
- [ ] Results display

### Performance
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Images load properly
- [ ] 3D models load
- [ ] Responsive on mobile

## Security

- [ ] Server-side API keys not exposed
- [ ] Google Maps API key restricted to domain
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic on Vercel)

## Domain & DNS (Optional)

- [ ] Custom domain added
- [ ] DNS configured
- [ ] SSL certificate active

## Monitoring

- [ ] Vercel Analytics enabled
- [ ] Error tracking works
- [ ] Performance metrics visible

## Documentation

- [ ] README.md updated with live URL
- [ ] API documentation complete
- [ ] Environment variables documented

---

## Quick Deploy Command

```bash
# Option 1: Automated script
./deploy-vercel.sh

# Option 2: Manual
npm run build && vercel --prod
```

---

## Emergency Rollback

If something breaks:
1. Go to Vercel Dashboard
2. Click your project
3. Go to "Deployments"
4. Find last working deployment
5. Click "..." → "Promote to Production"

---

## Support Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Deployment Guide:** See `DEPLOYMENT_GUIDE.md`

---

**Last Updated:** 2025-11-16
**Status:** Ready for Deployment ✅
