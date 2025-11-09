import type { Location } from './Location'

export interface Attraction {
  id: string
  type: 'attraction'
  name: string
  location: Location
  category: 'sight' | 'activity' | 'restaurant' | 'shopping' | 'entertainment' | 'other'
  startDateTime: Date
  duration: number // in minutes
  cost: number
  description?: string
  rating?: number
  bookingRequired: boolean
  bookingReference?: string
  website?: string
  notes?: string
  images?: string[]
  // Operating hours for the attraction
  operatingHours?: {
    open: string    // 24-hour format HH:mm
    close: string   // 24-hour format HH:mm
    dayOfWeek: number // 0-6, where 0 is Sunday
  }[]
  
  // Google Places data
  placeId?: string
  formattedAddress?: string
  openingHours?: {
    openNow: boolean
    weekdayText: string[]
  }
}

export interface AttractionSearchResult {
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

export interface AttractionDetails extends AttractionSearchResult {
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