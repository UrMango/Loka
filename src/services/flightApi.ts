import type { Flight } from '../types/Flight'
import type { Airport } from '../types/Flight'

interface FlightFetchParams {
  flightNumber: string
  date: string // YYYY-MM-DD format
}

interface FlightSegment {
  from: string
  to: string
  duration: number
}

interface FlightDetails {
  airline: string
  from: string
  to: string
  departure: string
  arrival: string
  duration_minutes: number
  status: string
  segments?: FlightSegment[]
  gate?: {
    departure?: string
    arrival?: string
  }
  terminal?: {
    departure?: string
    arrival?: string
  }
}

const BACKEND_URL = 'http://localhost:3001/api'

export const FlightAPI = {
  async fetchFlightDetails({ flightNumber, date }: FlightFetchParams): Promise<FlightDetails> {
    try {
      // Call backend endpoint for flight search
      const response = await fetch(`${BACKEND_URL}/flights/search/${flightNumber}?date=${date}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Flight not found')
        }
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const flightData: any = await response.json()
      
      // Transform backend response to FlightDetails format
      return {
        airline: flightData.airline,
        from: `${flightData.departureCity} (${flightData.departureAirportCode})`,
        to: `${flightData.arrivalCity} (${flightData.arrivalAirportCode})`,
        departure: flightData.departureDateTime,
        arrival: flightData.arrivalDateTime,
        duration_minutes: calculateDuration(
          new Date(flightData.departureDateTime),
          new Date(flightData.arrivalDateTime)
        ),
        status: 'scheduled'
      }
    } catch (error) {
      console.error('Failed to fetch flight details:', error)
      throw error
    }
  },

  async convertToFlight(details: FlightDetails): Promise<Flight> {
    const departureAirport: Airport = {
      code: details.from.match(/\(([^)]+)\)/)?.[1] ?? '',
      name: details.from.split(' (')[0],
      city: details.from.split(' (')[0].split(' ')[0],
      country: '', // Would need a separate API or lookup table for this
      location: { lat: 0, lng: 0 } // Would need geocoding service for this
    }

    const arrivalAirport: Airport = {
      code: details.to.match(/\(([^)]+)\)/)?.[1] ?? '',
      name: details.to.split(' (')[0],
      city: details.to.split(' (')[0].split(' ')[0],
      country: '', // Would need a separate API or lookup table for this
      location: { lat: 0, lng: 0 } // Would need geocoding service for this
    }

    return {
      id: crypto.randomUUID(),
      type: 'flight',
      airline: details.airline,
      flightNumber: '', // Would need to be provided separately
      departureAirport,
      arrivalAirport,
      departureDateTime: new Date(details.departure),
      arrivalDateTime: new Date(details.arrival),
      price: 0, // Would need to be provided separately
      layovers: details.segments ? details.segments.length - 1 : 0,
      bookingConfirmation: undefined
    }
  }
}

function calculateDuration(departure: Date, arrival: Date): number {
  return Math.round((arrival.getTime() - departure.getTime()) / (1000 * 60))
}