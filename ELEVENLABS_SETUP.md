# ElevenLabs Text-to-Speech Setup Guide

## Overview
Dr. Chick chatbot now uses **ElevenLabs AI** for ultra-realistic, natural-sounding text-to-speech instead of browser's built-in voice.

## 🎯 Why ElevenLabs?

### **Browser Speech vs ElevenLabs**

| Feature | Browser TTS | ElevenLabs AI |
|---------|-------------|---------------|
| **Voice Quality** | Robotic, mechanical | Natural, human-like |
| **Emotions** | Flat, monotone | Expressive, emotional |
| **Accents** | Limited | Multiple accents available |
| **Consistency** | Varies by browser | Always high quality |
| **Cost** | Free | ~$0.30 per 1,000 characters |
| **Speed** | Instant | ~1-2 second generation |

---

## 📋 Setup Steps

### **Step 1: Create ElevenLabs Account**

1. Go to **[ElevenLabs.io](https://elevenlabs.io/)**
2. Click **"Sign Up"** (or **"Get Started"**)
3. Create account with email or Google
4. **Free Plan Includes:**
   - 10,000 characters/month
   - 3 custom voices
   - Access to all pre-made voices

---

### **Step 2: Get Your API Key**

1. Log in to ElevenLabs
2. Click your **profile icon** (top right)
3. Go to **"Profile + API Key"**
4. Click **"Copy"** next to your API key
5. It looks like: `sk_...` (long string)

---

### **Step 3: Add to Your Project**

Open `.env.local` and add:

```bash
ELEVENLABS_API_KEY=sk_your_actual_key_here
```

**Important:** 
- Don't add quotes around the key
- Keep `.env.local` in `.gitignore` (already done)
- Never commit API keys to Git

---

### **Step 4: Restart Dev Server**

```bash
# Stop server (Ctrl+C)
npm run dev
```

The server will automatically load the new environment variable.

---

## 🎤 Voice Options

The chatbot currently uses **"Rachel"** voice (warm, friendly female voice - perfect for Dr. Chick).

### **Available Voices**

| Voice ID | Name | Description | Best For |
|----------|------|-------------|----------|
| `21m00Tcm4TlvDq8ikWAM` | **Rachel** | Warm, friendly female | Medical assistant (default) |
| `EXAVITQu4vr4xnSDxMaL` | **Bella** | Soft, calm female | Wellness advice |
| `ErXwobaYiN019PkySvjV` | **Antoni** | Warm, friendly male | General health info |
| `VR6AewLTigWG4xSOukaG` | **Arnold** | Strong, confident male | Fitness advice |
| `pNInz6obpgDQGcFmaJgB` | **Adam** | Deep, calm male | Serious medical topics |

### **Change Voice**

Edit `/app/api/elevenlabs-tts/route.ts`:

```typescript
// Line 23: Change this voice ID
const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel (current)

// To use Bella instead:
const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella
```

---

## 🎛️ Voice Settings (Advanced)

In `/app/api/elevenlabs-tts/route.ts`, adjust these parameters:

```typescript
voice_settings: {
  stability: 0.5,        // 0-1: Lower = more expressive
  similarity_boost: 0.75, // 0-1: Higher = closer to original voice
  style: 0.0,            // 0-1: Style exaggeration
  use_speaker_boost: true // Enhance clarity
}
```

### **Recommended Settings**

**For Medical Content (Current):**
```typescript
stability: 0.5,           // Balanced
similarity_boost: 0.75,   // High clarity
style: 0.0,              // Neutral
```

**For Friendly Chat:**
```typescript
stability: 0.3,           // More expressive
similarity_boost: 0.5,    // Natural variation
style: 0.5,              // Moderate style
```

**For Serious Advice:**
```typescript
stability: 0.8,           // Very stable
similarity_boost: 0.9,    // Consistent
style: 0.0,              // No exaggeration
```

---

## 💰 Pricing & Usage

### **Free Tier**
- **10,000 characters/month**
- ~3,000 words
- ~20-30 chatbot conversations

### **Starter Plan** ($5/month)
- **30,000 characters/month**
- ~10,000 words
- ~100 chatbot conversations

### **Creator Plan** ($22/month)
- **100,000 characters/month**
- ~33,000 words
- ~300 chatbot conversations

### **Character Count Example**
```
User: "What is high blood pressure?"
Dr. Chick: "High blood pressure, or hypertension, is when..."
(~200 characters = $0.06)
```

**Average Cost:** ~$0.30 per 1,000 characters

---

## 🎯 Features Implemented

### **1. Auto-Play**
- New Dr. Chick responses automatically speak
- Can be disabled with voice toggle
- 500ms delay for smooth experience

### **2. Manual Playback**
- Click speaker button on any message
- Replay old messages anytime
- Individual message control

### **3. Loading States**
- Spinner shows while generating audio (1-2 seconds)
- Animated pulse when playing
- Clear visual feedback

### **4. Voice Toggle**
- Enable/disable in header
- Stops current playback when disabled
- Persists for session

### **5. Error Handling**
- Graceful fallback if API fails
- User-friendly error messages
- Automatic retry capability

---

## 🔧 Technical Details

### **API Flow**
```
1. User sends message
2. Dr. Chick responds with text
3. Text cleaned (remove emojis, etc.)
4. POST to /api/elevenlabs-tts
5. ElevenLabs generates audio (MP3)
6. Audio returned as blob
7. HTML Audio API plays sound
8. Animation synced with playback
```

### **Audio Format**
- **Format:** MP3
- **Quality:** High (ElevenLabs default)
- **Streaming:** No (downloads first, then plays)
- **Caching:** No (generates fresh each time)

### **Performance**
- **Generation Time:** 1-2 seconds
- **File Size:** ~50-200 KB per message
- **Network:** Requires internet connection
- **Fallback:** Silent mode if API fails

---

## 🐛 Troubleshooting

### **Issue: No sound plays**

**Check:**
1. Is ElevenLabs API key in `.env.local`?
2. Did you restart the server?
3. Is voice toggle enabled (🔊 not 🔇)?
4. Check browser console for errors

**Fix:**
```bash
# Verify API key is set
cat .env.local | grep ELEVENLABS

# Should show:
# ELEVENLABS_API_KEY=sk_...

# Restart server
npm run dev
```

---

### **Issue: "Failed to generate speech" error**

**Causes:**
- Invalid API key
- Quota exceeded (free plan limit)
- Network issue

**Check Quota:**
1. Go to ElevenLabs.io
2. Click profile → Usage
3. See remaining characters

**Fix:**
- Upgrade plan if over quota
- Wait for monthly reset
- Verify API key is correct

---

### **Issue: Audio loading too slow**

**Causes:**
- Long messages (more characters = longer generation)
- Slow internet connection
- ElevenLabs server load

**Solutions:**
- Keep messages concise
- Auto-play only important messages
- Add skip button (future enhancement)

---

### **Issue: Voice sounds wrong**

**Fix:**
Change voice ID in `/app/api/elevenlabs-tts/route.ts`:
```typescript
const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Try different voice
```

---

## 🚀 Testing

### **Test Checklist**

- [ ] Start dev server with API key
- [ ] Open chatbot (click 🐥)
- [ ] Send message: "hello"
- [ ] Dr. Chick responds and speaks
- [ ] Voice sounds natural and clear
- [ ] Click voice toggle to disable
- [ ] Send another message (silent)
- [ ] Click speaker button on message
- [ ] That message plays
- [ ] Loading spinner appears briefly
- [ ] Pause button works

---

## 📊 Monitoring Usage

### **Track Your Usage**

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app/usage)
2. View:
   - Characters used this month
   - Remaining quota
   - Usage history

### **Set Up Alerts**

1. Dashboard → Settings → Notifications
2. Enable "Usage alerts"
3. Get email at 80% and 100% quota

---

## 🎯 Best Practices

### **1. Optimize Text**
```typescript
// ❌ Bad: Sends emojis to API (wastes characters)
"Hello there! 👋 I'm here to help! 🩺"

// ✅ Good: Cleaned before API call
"Hello there! I'm here to help!"
```

### **2. Reasonable Message Length**
- Keep responses under 500 characters
- Break long explanations into multiple messages
- User can replay any message

### **3. Cache Strategy (Future)**
```typescript
// Cache common responses
const cache = {
  'welcome': 'audio_url_1',
  'error': 'audio_url_2'
}
```

---

## 🔮 Future Enhancements

### **Planned Features**

- [ ] **Voice Selection** - Let user choose voice
- [ ] **Speed Control** - Adjust playback speed
- [ ] **Audio Caching** - Reuse common messages
- [ ] **Streaming** - Stream audio as it generates
- [ ] **Batch Mode** - Generate multiple messages at once
- [ ] **Emotion Detection** - Vary voice based on content
- [ ] **Custom Voice** - Clone user's voice (paid feature)

---

## 📚 Resources

- **ElevenLabs Docs:** https://docs.elevenlabs.io/
- **API Reference:** https://docs.elevenlabs.io/api-reference
- **Voice Library:** https://elevenlabs.io/voice-library
- **Pricing:** https://elevenlabs.io/pricing

---

## 🎉 Result

You now have **professional, AI-powered text-to-speech** in Dr. Chick!

### **What Changed**

**Before (Browser TTS):**
- Robotic voice
- Instant but low quality
- Free but sounds cheap

**After (ElevenLabs AI):**
- ✅ Natural, human-like voice
- ✅ Professional quality
- ✅ Warm and friendly tone
- ✅ Perfect for medical assistant

---

## ⚙️ Quick Start

```bash
# 1. Get API key from elevenlabs.io

# 2. Add to .env.local
echo "ELEVENLABS_API_KEY=sk_your_key" >> .env.local

# 3. Restart server
npm run dev

# 4. Test chatbot
# - Open chat window
# - Send a message
# - Hear Dr. Chick speak! 🎤✨
```

**That's it! Dr. Chick now has a professional AI voice!** 🐥🔊

---

**Need help?** Check the troubleshooting section or reach out to support!
