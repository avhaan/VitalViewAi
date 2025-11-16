export interface Place {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: number;
  isOpen: boolean | null;
  type: 'hospital' | 'pharmacy' | 'clinic';
  latitude: number;
  longitude: number;
  placeId: string;
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  type: 'hospital' | 'pharmacy' | 'doctor'
): Promise<Place[]> {
  try {
    const response = await fetch('/api/nearby-places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
        type,
        radius: 5000, // 5km
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch nearby places');
    }

    const data = await response.json();
    
    // Process and sort by distance
    const places: Place[] = data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address || 'Address not available',
      rating: place.rating || 0,
      distance: calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      ),
      isOpen: place.opening_hours?.open_now ?? null,
      type: type === 'doctor' ? 'clinic' : type,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      placeId: place.place_id,
    }));

    return places.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
}

export function getDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}
