import type { Flight, Airport } from '../types/Flight'

const API_BASE_URL = 'http://localhost:3001/api'

export interface TripAPI {
  searchAirports: (query: string) => Promise<Airport[]>
  searchFlights: (departureCode: string, arrivalCode: string, date: Date) => Promise<Flight[]>
  createManualFlight: (tripId: string, params: {
    airline: string
    flightNumber: string
    departureAirportCode: string
    departureCity: string
    departureCountry: string
    departureLat: number
    departureLng: number
    departureDateTime: Date
    departureTimeLocal?: string
    departureTimezone?: string
    arrivalAirportCode: string
    arrivalCity: string
    arrivalCountry: string
    arrivalLat: number
    arrivalLng: number
    arrivalDateTime: Date
    arrivalTimeLocal?: string
    arrivalTimezone?: string
    price: number
  }) => Promise<Flight>
  getTrips: () => Promise<any[]>
  getTrip: (id: string) => Promise<any>
  createTrip: (trip: any) => Promise<any>
  updateTrip: (id: string, updates: any) => Promise<any>
  deleteTrip: (id: string) => Promise<void>
}

// Mock airports data
const mockAirports: Airport[] = [
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    location: { lat: 40.6413, lng: -73.7781 }
  },
  {
    code: 'CDG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    location: { lat: 49.0097, lng: 2.5479 }
  },
  {
    code: 'DXB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    location: { lat: 25.2532, lng: 55.3657 }
  },
  {
    code: 'LAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    country: 'United States',
    location: { lat: 33.9416, lng: -118.4085 }
  },
  {
    code: 'LHR',
    name: 'London Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    location: { lat: 51.4700, lng: -0.4543 }
  }
]

// API implementation
export const tripApi: TripAPI = {
  searchAirports: async (query: string): Promise<Airport[]> => {
    // Filter mock airports based on search query
    const lowerQuery = query.toLowerCase()
    return mockAirports.filter(airport => 
      airport.code.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery)
    )
  },

  searchFlights: async (departureCode: string, arrivalCode: string, date: Date): Promise<Flight[]> => {
    // Mock flight search - returns sample flights
    const depAirport = mockAirports.find(a => a.code === departureCode)
    const arrAirport = mockAirports.find(a => a.code === arrivalCode)
    
    if (!depAirport || !arrAirport) {
      return []
    }

    // Generate some mock flights
    const baseDate = new Date(date)
    const mockFlights: Flight[] = []
    
    const airlines = ['Delta', 'United', 'American Airlines', 'Southwest']
    const prices = [299, 349, 399, 449, 499]
    
    for (let i = 0; i < 3; i++) {
      const departureTime = new Date(baseDate)
      departureTime.setHours(8 + i * 4, 0, 0, 0)
      
      const arrivalTime = new Date(departureTime)
      arrivalTime.setHours(arrivalTime.getHours() + 3 + Math.floor(Math.random() * 2))
      
      mockFlights.push({
        id: `mock-${Date.now()}-${i}`,
        type: 'flight',
        airline: airlines[Math.floor(Math.random() * airlines.length)],
        flightNumber: `${Math.floor(Math.random() * 9000 + 1000)}`,
        departureAirport: depAirport,
        arrivalAirport: arrAirport,
        departureDateTime: departureTime,
        arrivalDateTime: arrivalTime,
        price: prices[Math.floor(Math.random() * prices.length)],
        layovers: Math.floor(Math.random() * 2)
      })
    }
    
    return mockFlights
  },

  createManualFlight: async (tripId: string, params: {
    airline: string
    flightNumber: string
    departureAirportCode: string
    departureCity: string
    departureCountry: string
    departureLat: number
    departureLng: number
    departureDateTime: Date
    arrivalAirportCode: string
    arrivalCity: string
    arrivalCountry: string
    arrivalLat: number
    arrivalLng: number
    arrivalDateTime: Date
    price: number
  }): Promise<Flight> => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/flights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    
    if (!response.ok) {
      throw new Error('Failed to create flight')
    }
    
    return response.json()
  },

  getTrips: async () => {
    const response = await fetch(`${API_BASE_URL}/trips`)
    if (!response.ok) throw new Error('Failed to fetch trips')
    return response.json()
  },

  getTrip: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${id}`)
    if (!response.ok) throw new Error('Trip not found')
    return response.json()
  },

  createTrip: async (trip: any) => {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip)
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to create trip')
    }
    return response.json()
  },

  updateTrip: async (id: string, updates: any) => {
    const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('Failed to update trip')
    return response.json()
  },

  deleteTrip: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete trip')
  }
}

// Export as TripAPI for backward compatibility
export const TripAPI = tripApi
