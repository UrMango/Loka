export interface Airport {
  code: string
  name: string
  city: string
  country: string
  location: {
    lat: number
    lng: number
  }
}

export interface Flight {
  id: string
  type: 'flight'
  airline: string
  flightNumber: string
  departureAirport: Airport
  arrivalAirport: Airport
  departureDateTime: Date
  arrivalDateTime: Date
  price: number
  layovers: number
  bookingConfirmation?: string
  // Baggage information
  carryOnTrolley?: boolean
  checkedBaggage?: boolean
  // Booking details
  bookingNumber?: string
  bookingCompany?: string
  // Terminal and gate information
  departureTerminal?: string
  departureGate?: string
  arrivalTerminal?: string
  arrivalGate?: string
  // Local time information
  departureTimeLocal?: string
  departureTimezone?: string
  arrivalTimeLocal?: string
  arrivalTimezone?: string
}