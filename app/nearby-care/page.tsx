'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Star, Clock, Phone, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { fetchNearbyPlaces, getDirectionsUrl, Place } from '@/lib/placesApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function NearbyCare() {
  const { latitude, longitude, error, loading, getLocation } = useGeolocation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedType, setSelectedType] = useState<'hospital' | 'pharmacy' | 'doctor'>('hospital');
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [manualSearch, setManualSearch] = useState('');

  useEffect(() => {
    if (latitude && longitude) {
      fetchPlaces();
    }
  }, [latitude, longitude, selectedType]);

  const fetchPlaces = async () => {
    if (!latitude || !longitude) return;
    
    setLoadingPlaces(true);
    setPlacesError(null);

    try {
      const results = await fetchNearbyPlaces(latitude, longitude, selectedType);
      setPlaces(results);
    } catch (err) {
      setPlacesError('Unable to fetch nearby locations. Please try again.');
      console.error(err);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return '🏥';
      case 'pharmacy':
        return '💊';
      case 'clinic':
        return '🩺';
      default:
        return '🏥';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'from-red-500 to-rose-600';
      case 'pharmacy':
        return 'from-green-500 to-emerald-600';
      case 'clinic':
        return 'from-blue-500 to-indigo-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              V
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              VitalView AI
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/nearby-care" className="text-teal-600 font-semibold">
              Find Care
            </Link>
            <Link href="/bmi" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
              BMI
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white pt-32 pb-20 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-pulse">💓</div>
          <div className="absolute top-20 right-20 animate-bounce">📍</div>
          <div className="absolute bottom-20 left-1/4 animate-pulse delay-100">🏥</div>
          <div className="absolute bottom-32 right-1/3 animate-bounce delay-200">💊</div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Hospitals & Pharmacies Near You
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100 mb-8">
              We use your location to help you find the closest medical help quickly and safely.
            </p>
            
            {/* Privacy Disclaimer */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">We respect your privacy — your location is never stored.</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Location Permission Card */}
        {!latitude && !longitude && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="max-w-2xl mx-auto p-8 text-center bg-white dark:bg-slate-800 shadow-2xl">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-4xl mb-4">
                  📍
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Enable Location Access
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Click below to let us detect your current location and find nearby medical facilities.
                </p>
              </div>

              <Button
                onClick={getLocation}
                disabled={loading}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-6 text-lg rounded-full shadow-lg transition-all hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5 mr-2" />
                    Enable Location
                  </>
                )}
              </Button>

              {error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-400 text-sm mb-3">{error}</p>
                  
                  {/* Manual Search Fallback */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      You can enter your city or ZIP code manually:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter City or ZIP Code"
                        value={manualSearch}
                        onChange={(e) => setManualSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          // TODO: Implement geocoding for manual search
                          alert('Manual search coming soon!');
                        }}
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Main Content - Map and Results */}
        {latitude && longitude && (
          <div className="space-y-8">
            {/* Type Selector */}
            <div className="flex justify-center gap-4 flex-wrap">
              {[
                { type: 'hospital' as const, label: 'Hospitals', icon: '🏥' },
                { type: 'pharmacy' as const, label: 'Pharmacies', icon: '💊' },
                { type: 'doctor' as const, label: 'Clinics', icon: '🩺' },
              ].map(({ type, label, icon }) => (
                <Button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-4 rounded-xl text-lg font-semibold transition-all ${
                    selectedType === type
                      ? 'bg-gradient-to-r ' + getTypeColor(type) + ' text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 hover:scale-105 border-2 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="text-2xl mr-2">{icon}</span>
                  <span className={selectedType === type ? 'text-white' : 'text-gray-800 dark:text-gray-100'}>
                    {label}
                  </span>
                </Button>
              ))}
            </div>

            {/* Map and Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Map Section */}
              <Card className="p-6 bg-white dark:bg-slate-800 shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-teal-500" />
                  Map View
                </h3>
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-xl overflow-hidden relative">
                  {/* Embedded Google Map */}
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${selectedType}&center=${latitude},${longitude}&zoom=14`}
                    className="w-full h-full"
                  />
                </div>
              </Card>

              {/* Results List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(selectedType)}</span>
                  Nearby {selectedType === 'doctor' ? 'Clinics' : selectedType === 'hospital' ? 'Hospitals' : 'Pharmacies'}
                </h3>

                {loadingPlaces ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6 animate-pulse bg-white dark:bg-slate-800">
                        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                      </Card>
                    ))}
                  </div>
                ) : placesError ? (
                  <Card className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-red-700 dark:text-red-400">{placesError}</p>
                  </Card>
                ) : places.length === 0 ? (
                  <Card className="p-8 text-center bg-white dark:bg-slate-800">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-600 dark:text-gray-400">
                      No {selectedType === 'doctor' ? 'clinics' : selectedType + 's'} found near you.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {places.map((place, index) => (
                      <motion.div
                        key={place.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-6 bg-white dark:bg-slate-800 hover:shadow-xl transition-all hover:scale-102 border-l-4 border-transparent hover:border-teal-500">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                                {place.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {place.address}
                              </p>
                            </div>
                            <span className="text-2xl">{getTypeIcon(place.type)}</span>
                          </div>

                          <div className="flex items-center gap-4 text-sm mb-4">
                            {place.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{place.rating.toFixed(1)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Navigation className="w-4 h-4" />
                              <span>{place.distance.toFixed(1)} km away</span>
                            </div>
                            {place.isOpen !== null && (
                              <div className={`flex items-center gap-1 ${place.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{place.isOpen ? 'Open Now' : 'Closed'}</span>
                              </div>
                            )}
                          </div>

                          <a
                            href={getDirectionsUrl(place.latitude, place.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all hover:scale-105 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open in Maps
                          </a>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
