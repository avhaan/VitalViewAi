#!/bin/bash

# 🚀 VitalView AI - Vercel Deployment Script
# This script helps you deploy to Vercel quickly

echo "🩺 VitalView AI - Deployment Script"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI found"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. Have you added your API keys to .env.local? (local testing)"
echo "2. Have you tested the build locally? (npm run build)"
echo "3. Have you committed all changes? (git status)"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔨 Running production build test..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to production
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Don't forget to add environment variables in Vercel Dashboard:"
echo "   - GEMINI_API_KEY"
echo "   - GOOGLE_PLACES_API_KEY"
echo "   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
echo "   - ELEVENLABS_API_KEY (optional)"
echo ""
echo "🌐 Visit your dashboard: https://vercel.com/dashboard"
echo ""
echo "Happy deploying! 🎉"
