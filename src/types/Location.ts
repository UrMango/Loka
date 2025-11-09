export interface Location {
  id: string
  type: 'location'
  name: string
  address: string
  city: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
  placeId?: string  // For Google Places API reference
}