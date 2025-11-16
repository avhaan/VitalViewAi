# Find Care Near You - Setup Guide

## Overview
The "Find Care Near You" feature allows users to locate nearby hospitals, clinics, and pharmacies using geolocation and Google Maps/Places APIs.

## Features
- 📍 **Geolocation Access** - Detect user location automatically
- 🗺️ **Interactive Map** - Display nearby medical facilities on Google Maps
- 🏥 **Hospitals** - Red markers
- 💊 **Pharmacies** - Green markers
- 🩺 **Clinics** - Blue markers
- 📊 **Results List** - Detailed cards with ratings, distance, and opening hours
- 🔒 **Privacy First** - Location is never stored

## Setup Instructions

### 1. Get Google API Keys

#### Google Maps API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Maps Embed API**
   - **Maps JavaScript API**
   - **Places API**
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key

#### Security (Recommended):
- Add HTTP referer restrictions to your API key
- Example: `https://yourdomain.com/*` or `http://localhost:3000/*`

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Google Places API Key (for searching nearby places)
GOOGLE_PLACES_API_KEY=YOUR_API_KEY_HERE

# Google Maps API Key (for map display - can be the same key)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Important:** The `NEXT_PUBLIC_` prefix makes the variable accessible in the browser for the map embed.

### 3. Install Dependencies
All required dependencies should already be installed. If not:

```bash
npm install framer-motion lucide-react
```

### 4. Test the Feature

1. Start the development server:
```bash
npm run dev
```

2. Navigate to:
   - Homepage → "Quick Access Tools" section
   - Click on "Find Care Near You" card
   - Or go directly to: `http://localhost:3000/nearby-care`

3. Click "Enable Location" and allow browser permission

## File Structure

```
/app
  /nearby-care
    page.tsx                    # Main page component
  /api
    /nearby-places
      route.ts                  # API route for Google Places
/hooks
  useGeolocation.ts            # Geolocation custom hook
/lib
  placesApi.ts                 # Places API utilities
```

## API Usage

### Google Places API
- **Endpoint:** `/api/nearby-places`
- **Method:** POST
- **Body:**
  ```json
  {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "type": "hospital",
    "radius": 5000
  }
  ```
- **Types:** `hospital`, `pharmacy`, `doctor`
- **Radius:** 5000 meters (5km)

### Response Format
```json
{
  "results": [
    {
      "place_id": "ChIJ...",
      "name": "General Hospital",
      "vicinity": "123 Main St",
      "rating": 4.5,
      "opening_hours": {
        "open_now": true
      },
      "geometry": {
        "location": {
          "lat": 37.7749,
          "lng": -122.4194
        }
      }
    }
  ]
}
```

## Features Breakdown

### 1. Geolocation
- Uses browser's `navigator.geolocation` API
- Fallback to manual city/ZIP search (UI ready, geocoding to be implemented)
- Error handling for:
  - Permission denied
  - Position unavailable
  - Timeout

### 2. Map Display
- Embedded Google Maps with search query
- Auto-centers on user location
- 14x zoom level for neighborhood view

### 3. Results Cards
Each result shows:
- ✅ Facility name
- 📍 Address
- ⭐ Rating (if available)
- 📏 Distance from user (calculated using Haversine formula)
- 🕐 Open/Closed status
- 🔗 "Open in Maps" button (Google Maps directions)

### 4. Filters
- Toggle between:
  - 🏥 Hospitals
  - 💊 Pharmacies
  - 🩺 Clinics

## UI/UX Details

### Design System
- **Colors:**
  - Teal/Cyan gradient for primary actions
  - Red for hospitals
  - Green for pharmacies
  - Blue for clinics

- **Components:**
  - Rounded cards (border-radius: 16-24px)
  - Soft shadows
  - Hover effects
  - Smooth animations (Framer Motion)

### Responsive Layout
- Mobile: Single column
- Tablet: 1 column (map on top, results below)
- Desktop: 2 columns (map left, results right)

## Privacy & Security

### What We Do:
✅ Request location permission with clear messaging
✅ Show privacy disclaimer: "Your location is never stored"
✅ Use HTTPS for all API calls
✅ API keys restricted by domain

### What We Don't Do:
❌ Store user location
❌ Track user movements
❌ Share data with third parties

## Troubleshooting

### Issue: "No places found"
- Check if API key is valid
- Ensure Places API is enabled
- Verify quota hasn't been exceeded (Google Cloud Console)

### Issue: Map not displaying
- Check if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Verify Maps Embed API is enabled
- Check browser console for errors

### Issue: Geolocation not working
- Ensure HTTPS (required for geolocation)
- Check browser permissions
- Try different browser
- Test on localhost (http://localhost is allowed)

## Future Enhancements

- [ ] Manual search with geocoding
- [ ] Save favorite locations
- [ ] Filter by rating/distance
- [ ] Show driving time
- [ ] Phone number and website links
- [ ] Reviews integration
- [ ] Directions with turn-by-turn navigation

## Cost Estimates (Google Maps Platform)

### Free Tier:
- $200 free credit per month
- Maps Embed API: $7 per 1,000 loads
- Places API: $17 per 1,000 requests

### Typical Usage:
- 1,000 users/month ≈ $24
- 10,000 users/month ≈ $240

Stays within free tier if < 1,000 unique users/month.

## Support

For issues or questions:
1. Check Google Cloud Console logs
2. Review browser console errors
3. Verify API key permissions
4. Contact VitalView AI support

---

**Built with ❤️ for VitalView AI**
