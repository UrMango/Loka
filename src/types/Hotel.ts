import type { Location } from './Location'

export interface Hotel {
  id: string
  type: 'hotel'
  name: string
  location: Location
  checkIn: Date
  checkOut: Date
  pricePerNight: number
  roomType: string
  rating?: number
  amenities?: string[]
  bookingReference?: string
  notes?: string
  images?: string[]
  
  // Google Places data
  placeId?: string
  formattedAddress?: string
  distanceFromAirport?: {
    distance: string
    duration: string
  }
}

export interface HotelSearchResult {
  placeId: string
  name: string
  formattedAddress: string
  rating?: number
  priceLevel?: number
  types: string[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
}

export interface HotelDetails extends HotelSearchResult {
  formattedPhoneNumber?: string
  website?: string
  photos?: {
    photoReference: string
    width: number
    height: number
  }[]
  openingHours?: {
    openNow: boolean
    weekdayText: string[]
  }
  reviews?: {
    authorName: string
    rating: number
    text: string
    time: number
  }[]
}