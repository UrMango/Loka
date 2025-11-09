import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface PlaceSuggestion {
  placeId: string;
  name: string;
  formattedAddress: string;
  types: string[];
}

export interface PlaceDetails {
  name: string;
  address: string;
  rating: number | null;
  userRatingsTotal?: number;
  lat: number;
  lng: number;
  types: string[];
  photos?: Array<{
    photoReference: string;
    width: number;
    height: number;
    attributions: string[];
  }>;
  priceLevel?: number | null;
  openingHours?: {
    openNow: boolean;
    weekdayText: string[];
  } | null;
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
    relativeTimeDescription: string;
  }>;
  website?: string | null;
  phoneNumber?: string | null;
}

export interface DistanceInfo {
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
}

class PlacesApiService {
  /**
   * Search for places using Google Places Autocomplete API
   * @param input - Search query (e.g., "Burj Khalifa", "restaurants in Dubai")
   * @param types - Optional types filter (default: tourist attractions, restaurants, parks, museums)
   */
  async searchPlaces(input: string, types?: string): Promise<PlaceSuggestion[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/autocomplete`, {
        params: { input, types },
      });

      return response.data.suggestions;
    } catch (error: any) {
      console.error('Error searching places:', error);
      throw new Error(error.response?.data?.error || 'Failed to search places');
    }
  }

  /**
   * Get detailed information about a place
   * @param placeId - Google Place ID from autocomplete results
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/details`, {
        params: { place_id: placeId },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching place details:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch place details');
    }
  }

  /**
   * Calculate distance and travel time between two locations
   * @param origin - Origin location (address or "lat,lng")
   * @param destination - Destination location (address or "lat,lng")
   */
  async calculateDistance(origin: string, destination: string): Promise<DistanceInfo> {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/distance`, {
        params: { origin, destination },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error calculating distance:', error);
      throw new Error(error.response?.data?.error || 'Failed to calculate distance');
    }
  }

  /**
   * Get photo URL from photo reference
   * @param photoReference - Photo reference from Google Places
   * @param maxWidth - Maximum width of the photo (default: 400)
   */
  async getPhotoUrl(photoReference: string, maxWidth: number = 400): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels/photo`, {
        params: { photo_reference: photoReference, maxwidth: maxWidth },
      });

      return response.data.photoUrl;
    } catch (error: any) {
      console.error('Error getting photo URL:', error);
      throw new Error(error.response?.data?.error || 'Failed to get photo URL');
    }
  }
}

export const placesApi = new PlacesApiService();
