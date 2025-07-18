"use client"

import { useCallback, useState } from "react"

interface LocationData {
  city: string
  country: string
  latitude: number
  longitude: number
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get user's coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        })
      })

      const { latitude, longitude } = position.coords

      // Try multiple geocoding services for better reliability
      let locationData: LocationData | null = null

      // Try OpenStreetMap Nominatim (free, no API key required)
      try {
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
          {
            headers: {
              "User-Agent": "EcoPackAI/1.0",
            },
          },
        )

        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json()

          if (nominatimData && nominatimData.address) {
            const address = nominatimData.address
            locationData = {
              city: address.city || address.town || address.village || address.suburb || "Unknown City",
              country: address.country || "Unknown Country",
              latitude,
              longitude,
            }
          }
        }
      } catch (nominatimError) {
        console.warn("Nominatim geocoding failed:", nominatimError)
      }

      // Fallback to BigDataCloud (free tier available)
      if (!locationData) {
        try {
          const bigDataResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          )

          if (bigDataResponse.ok) {
            const bigDataData = await bigDataResponse.json()

            locationData = {
              city: bigDataData.city || bigDataData.locality || bigDataData.principalSubdivision || "Unknown City",
              country: bigDataData.countryName || "Unknown Country",
              latitude,
              longitude,
            }
          }
        } catch (bigDataError) {
          console.warn("BigDataCloud geocoding failed:", bigDataError)
        }
      }

      // Final fallback with approximate location based on coordinates
      if (!locationData) {
        // Simple coordinate-based location approximation
        const approximateLocation = getApproximateLocation(latitude, longitude)
        locationData = {
          city: approximateLocation.city,
          country: approximateLocation.country,
          latitude,
          longitude,
        }
      }

      setLocation(locationData)
    } catch (err: any) {
      console.error("Location error:", err)

      // Provide fallback based on error type
      if (err.code === 1) {
        setError("Location access denied. Please enable location permissions.")
      } else if (err.code === 2) {
        setError("Location unavailable. Please check your connection.")
      } else if (err.code === 3) {
        setError("Location request timed out. Please try again.")
      } else {
        setError("Unable to get location. Using default settings.")
      }

      // Set a default location for demo purposes
      setLocation({
        city: "Demo City",
        country: "Demo Country",
        latitude: 0,
        longitude: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return { location, loading, error, requestLocation }
}

// Simple coordinate-based location approximation
function getApproximateLocation(lat: number, lon: number): { city: string; country: string } {
  // Major city coordinates for approximation
  const majorCities = [
    { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
    { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
    { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
    { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
    { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
    { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
    { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
    { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
    { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6176 },
    { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437 },
    { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
    { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832 },
    { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
    { name: "Buenos Aires", country: "Argentina", lat: -34.6118, lon: -58.396 },
    { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
    { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
    { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  ]

  // Find closest city
  let closestCity = majorCities[0]
  let minDistance = getDistance(lat, lon, closestCity.lat, closestCity.lon)

  for (const city of majorCities) {
    const distance = getDistance(lat, lon, city.lat, city.lon)
    if (distance < minDistance) {
      minDistance = distance
      closestCity = city
    }
  }

  return {
    city: closestCity.name,
    country: closestCity.country,
  }
}

// Calculate distance between two coordinates (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}
