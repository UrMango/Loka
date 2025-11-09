import type { Flight } from './Flight'
import type { Hotel } from './Hotel'
import type { Transportation } from './Transportation'
import type { Attraction } from './Attraction'
import type { Location } from './Location'

export interface DaySchedule {
  date: Date
  items: (Flight | Hotel | Transportation | Attraction)[]
}

export interface Trip {
  id: string
  name: string
  description?: string
  destinations: Location[]  // Primary destinations for the trip
  startDate: Date
  endDate: Date
  status: 'planning' | 'booked' | 'in-progress' | 'completed' | 'cancelled'
  schedule: DaySchedule[]
  budget?: number
  notes?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  
  // Required methods
  getTotalCost(): number
  getFlights(): Flight[]
  getHotels(): Hotel[]
  getTransportation(): Transportation[]
  getAttractions(): Attraction[]
}