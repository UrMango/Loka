import type { Location } from './Location'

export interface Transportation {
  id: string
  type: 'transportation'
  mode: 'taxi' | 'rental-car' | 'shuttle' | 'public-transport' | 'walk'
  provider?: string
  pickupLocation: Location
  dropoffLocation: Location
  pickupDateTime: Date
  dropoffDateTime: Date
  cost: number
  bookingReference?: string
  notes?: string
  // For rental cars
  rentalCompany?: string
  carType?: string
  rentalDuration?: number // in days
  // For public transport
  route?: string
  lineNumber?: string
  
  // Google Distance Matrix data
  distance?: string
  duration?: string
}

export interface RideSearchResult {
  pickup: {
    placeId: string
    name: string
    formattedAddress: string
    location: {
      lat: number
      lng: number
    }
  }
  dropoff: {
    placeId: string
    name: string
    formattedAddress: string
    location: {
      lat: number
      lng: number
    }
  }
  distance: string
  duration: string
  cost?: number
}