import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface LocationSuggestion {
  placeId: string
  name: string
  formattedAddress: string
  types: string[]
}

export interface LocationDetails {
  placeId: string
  name: string
  formattedAddress: string
  location: {
    lat: number
    lng: number
  }
}

export interface DistanceResult {
  distance: string
  duration: string
  distanceValue: number
  durationValue: number
  origin: string
  destination: string
  mode: string
}

export interface RideEstimate {
  mode: string
  distance: string
  duration: string
  distanceValue: number
  durationValue: number
}

export interface RideEstimateResult {
  pickup: {
    placeId: string
    name: string
    formattedAddress: string
  }
  dropoff: {
    placeId: string
    name: string
    formattedAddress: string
  }
  estimates: RideEstimate[]
}

class RideApiService {
  /**
   * Search for locations using Google Places Autocomplete
   */
  async searchLocations(input: string): Promise<LocationSuggestion[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/rides/location-autocomplete`, {
        params: { input }
      })
      return response.data.suggestions || []
    } catch (error: any) {
      console.error('Error searching locations:', error)
      throw new Error(error.response?.data?.error || 'Failed to search locations')
    }
  }

  /**
   * Get location details by place ID
   */
  async getLocationDetails(placeId: string): Promise<LocationDetails> {
    try {
      const response = await axios.get(`${API_BASE_URL}/rides/location-details`, {
        params: { place_id: placeId }
      })
      return response.data.location
    } catch (error: any) {
      console.error('Error fetching location details:', error)
      throw new Error(error.response?.data?.error || 'Failed to fetch location details')
    }
  }

  /**
   * Calculate distance between pickup and dropoff locations
   */
  async calculateDistance(from: string, to: string, mode: string = 'driving'): Promise<DistanceResult> {
    try {
      const response = await axios.get(`${API_BASE_URL}/rides/distance`, {
        params: { from, to, mode }
      })
      return response.data
    } catch (error: any) {
      console.error('Error calculating distance:', error)
      throw new Error(error.response?.data?.error || 'Failed to calculate distance')
    }
  }

  /**
   * Get ride estimates with multiple transportation modes
   */
  async getRideEstimate(
    pickup: { placeId: string; name: string; formattedAddress: string },
    dropoff: { placeId: string; name: string; formattedAddress: string },
    modes: string[] = ['driving']
  ): Promise<RideEstimateResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/rides/estimate`, {
        pickup,
        dropoff,
        modes
      })
      return response.data
    } catch (error: any) {
      console.error('Error getting ride estimate:', error)
      throw new Error(error.response?.data?.error || 'Failed to get ride estimate')
    }
  }
}

export const rideApi = new RideApiService()
