import { ENV } from "../_core/env";

/**
 * Google Places Venue Integration
 * Finds venues near the geographic midpoint of group members
 */

export interface Venue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  priceLevel: number; // 1-4
  rating: number; // 0-5
  types: string[];
  openingHours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

export interface VenueSearchOptions {
  type: "restaurant" | "cafe" | "bar";
  maxResults?: number;
  minRating?: number;
  priceLevel?: number; // 1-4
}

/**
 * Calculate geographic midpoint of multiple locations
 */
export function calculateMidpoint(
  locations: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } {
  if (locations.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
  const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

  return { lat: avgLat, lng: avgLng };
}

/**
 * Calculate fairness radius (distance from midpoint to farthest member + 20% buffer)
 */
export function calculateFairnessRadius(
  locations: Array<{ lat: number; lng: number }>,
  midpoint: { lat: number; lng: number }
): number {
  if (locations.length === 0) {
    return 5; // Default 5 km
  }

  const distances = locations.map((loc) => calculateDistance(loc.lat, loc.lng, midpoint.lat, midpoint.lng));
  const maxDistance = Math.max(...distances);

  // Add 20% buffer to ensure fairness
  return maxDistance * 1.2;
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Search for venues near a location using Google Places API
 */
export async function searchVenues(
  lat: number,
  lng: number,
  radius: number,
  options: VenueSearchOptions
): Promise<Venue[]> {
  if (!ENV.googlePlacesKey) {
    throw new Error("Google Places API key not configured");
  }

  const typeMap: Record<string, string> = {
    restaurant: "restaurant",
    cafe: "cafe",
    bar: "bar",
  };

  const type = typeMap[options.type] || options.type;
  const maxResults = options.maxResults || 10;

  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: String(Math.round(radius * 1000)), // Convert km to meters
    type,
    key: ENV.googlePlacesKey,
  });

  if (options.minRating) {
    params.append("minrating", String(options.minRating));
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    const venues: Venue[] = (data.results || [])
      .slice(0, maxResults)
      .map((place: any) => ({
        id: place.place_id,
        name: place.name,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        address: place.vicinity,
        priceLevel: place.price_level || 2,
        rating: place.rating || 0,
        types: place.types || [],
        openingHours: place.opening_hours,
      }));

    return venues;
  } catch (error) {
    console.error("Venue search error:", error);
    throw error;
  }
}

/**
 * Search for multiple venue types and combine results
 */
export async function searchMultipleVenueTypes(
  lat: number,
  lng: number,
  radius: number,
  types: Array<"restaurant" | "cafe" | "bar"> = ["restaurant", "cafe", "bar"],
  maxPerType: number = 5
): Promise<Venue[]> {
  const allVenues: Venue[] = [];
  const seenIds = new Set<string>();

  for (const type of types) {
    try {
      const venues = await searchVenues(lat, lng, radius, {
        type,
        maxResults: maxPerType,
      });

      for (const venue of venues) {
        if (!seenIds.has(venue.id)) {
          allVenues.push(venue);
          seenIds.add(venue.id);
        }
      }
    } catch (error) {
      console.error(`Failed to search for ${type} venues:`, error);
    }
  }

  // Sort by rating (descending)
  return allVenues.sort((a, b) => b.rating - a.rating);
}

/**
 * Score a venue based on fairness and preferences
 */
export interface VenueScore {
  venue: Venue;
  fairnessScore: number; // 0-100
  ratingScore: number; // 0-100
  priceScore: number; // 0-100 (higher is better for budget-conscious)
  overallScore: number; // 0-100
}

export function scoreVenue(
  venue: Venue,
  midpoint: { lat: number; lng: number },
  maxBudget: number = 50, // in currency units
  preferredPriceLevel: number = 2
): VenueScore {
  // Fairness score: venues closer to midpoint are better
  const distanceToMidpoint = calculateDistance(venue.lat, venue.lng, midpoint.lat, midpoint.lng);
  const fairnessScore = Math.max(0, 100 - distanceToMidpoint * 10); // Decreases by 10 points per km

  // Rating score: 0-100 based on Google rating (0-5)
  const ratingScore = (venue.rating / 5) * 100;

  // Price score: penalize if price level doesn't match preference
  const priceDifference = Math.abs(venue.priceLevel - preferredPriceLevel);
  const priceScore = Math.max(0, 100 - priceDifference * 20);

  // Overall score: weighted combination
  // Fairness: 50%, Rating: 30%, Price: 20%
  const overallScore = fairnessScore * 0.5 + ratingScore * 0.3 + priceScore * 0.2;

  return {
    venue,
    fairnessScore,
    ratingScore,
    priceScore,
    overallScore: Math.min(100, Math.max(0, overallScore)),
  };
}

/**
 * Get venue details from Google Places API
 */
export async function getVenueDetails(placeId: string): Promise<any> {
  if (!ENV.googlePlacesKey) {
    throw new Error("Google Places API key not configured");
  }

  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,rating,formatted_address,opening_hours,photos,url,website,formatted_phone_number",
    key: ENV.googlePlacesKey,
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return data.result;
  } catch (error) {
    console.error("Venue details error:", error);
    throw error;
  }
}
