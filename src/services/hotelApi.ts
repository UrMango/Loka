import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface HotelSuggestion {
  placeId: string;
  name: string;
  formattedAddress: string;
  types: string[];
}

export interface HotelDetails {
  placeId?: string;
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
  priceLevel?: number | null; // 0-4 scale (Free to Very Expensive)
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
    relativeTimeDescription: string;
  }>;
  website?: string | null;
  phoneNumber?: string | null;
  // Distance info (added when calculateDistance is called)
  distance?: {
    text: string;
    value: number;
  };
  duration?: {
    text: string;
    value: number;
  };
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

export interface CreateHotelData {
  name: string;
  address: string;
  city?: string;
  country?: string;
  lat: number;
  lng: number;
  checkIn: Date;
  checkOut: Date;
  pricePerNight?: number;
  rating?: number;
  bookingConfirmation?: string;
}

class HotelApiService {
  /**
   * Search for hotels using Google Places Autocomplete API
   */
  async searchHotels(input: string): Promise<HotelSuggestion[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels/autocomplete`, {
        params: { input },
      });

      return response.data.suggestions || [];
    } catch (error: any) {
      console.error('Error searching hotels:', error);
      throw new Error(error.response?.data?.error || 'Failed to search hotels');
    }
  }

  /**
   * Get detailed information about a hotel using its place_id
   */
  async getHotelDetails(placeId: string): Promise<HotelDetails> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels/details`, {
        params: { place_id: placeId },
      });

      const hotel = response.data.hotel;
      
      // Map backend response to frontend HotelDetails interface
      return {
        placeId: hotel.placeId,
        name: hotel.name,
        address: hotel.formattedAddress,
        rating: hotel.rating,
        userRatingsTotal: hotel.userRatingsTotal,
        lat: hotel.lat,
        lng: hotel.lng,
        types: hotel.types || [],
        priceLevel: hotel.priceLevel,
        phoneNumber: hotel.formattedPhoneNumber,
        website: hotel.website,
        photos: hotel.photos,
        reviews: hotel.reviews,
      };
    } catch (error: any) {
      console.error('Error fetching hotel details:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch hotel details');
    }
  }

  /**
   * Calculate distance and travel time between two locations
   * @param origin - Origin location (e.g., "Dubai International Airport" or "25.2532,55.3657")
   * @param destination - Destination location (e.g., "25.1972,55.2744")
   */
  async calculateDistance(origin: string, destination: string): Promise<DistanceInfo> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels/distance`, {
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

  /**
   * Add a hotel to a trip
   */
  async addHotelToTrip(tripId: string, hotelData: CreateHotelData): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/trips/${tripId}/hotels`, hotelData);
      return response.data;
    } catch (error: any) {
      console.error('Error adding hotel to trip:', error);
      throw new Error(error.response?.data?.error || 'Failed to add hotel');
    }
  }
}

export const hotelApi = new HotelApiService();
