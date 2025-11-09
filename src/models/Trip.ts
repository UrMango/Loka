import type { Trip as TripInterface } from '../types/Trip'
import type { Flight } from '../types/Flight'
import type { Hotel } from '../types/Hotel'
import type { Transportation } from '../types/Transportation'
import type { Attraction } from '../types/Attraction'
import type { Location } from '../types/Location'
import type { DaySchedule } from '../types/Trip'

export class Trip implements TripInterface {
  id: string
  name: string
  description?: string
  destinations: Location[]
  startDate: Date
  endDate: Date
  status: 'planning' | 'booked' | 'in-progress' | 'completed' | 'cancelled'
  schedule: DaySchedule[]
  budget?: number
  notes?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date

  constructor(data: Omit<TripInterface, 'getTotalCost' | 'getFlights' | 'getHotels' | 'getTransportation' | 'getAttractions'>) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.destinations = data.destinations
    this.startDate = new Date(data.startDate)
    this.endDate = new Date(data.endDate)
    this.status = data.status
    this.schedule = data.schedule.map(day => ({
      ...day,
      date: new Date(day.date)
    }))
    this.budget = data.budget
    this.notes = data.notes
    this.tags = data.tags
    this.createdAt = new Date(data.createdAt)
    this.updatedAt = new Date(data.updatedAt)
  }

  getTotalCost(): number {
    return this.schedule.reduce((total, day) => {
      return total + day.items.reduce((dayTotal, item) => {
        switch (item.type) {
          case 'flight':
            return dayTotal + item.price
          case 'hotel':
            return dayTotal + item.pricePerNight
          case 'transportation':
            return dayTotal + item.cost
          case 'attraction':
            return dayTotal + item.cost
          default:
            return dayTotal
        }
      }, 0)
    }, 0)
  }

  getFlights(): Flight[] {
    return this.schedule
      .flatMap(day => day.items)
      .filter((item): item is Flight => item.type === 'flight')
  }

  getHotels(): Hotel[] {
    return this.schedule
      .flatMap(day => day.items)
      .filter((item): item is Hotel => item.type === 'hotel')
  }

  getTransportation(): Transportation[] {
    return this.schedule
      .flatMap(day => day.items)
      .filter((item): item is Transportation => item.type === 'transportation')
  }

  getAttractions(): Attraction[] {
    return this.schedule
      .flatMap(day => day.items)
      .filter((item): item is Attraction => item.type === 'attraction')
  }

  addItem(item: Flight | Hotel | Transportation | Attraction, date: Date): void {
    let daySchedule = this.schedule.find(day => 
      day.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    )

    if (!daySchedule) {
      daySchedule = { date, items: [] }
      this.schedule.push(daySchedule)
      // Sort schedule by date
      this.schedule.sort((a, b) => a.date.getTime() - b.date.getTime())
    }

    daySchedule.items.push(item)
    // Sort items by time
    daySchedule.items.sort((a, b) => {
      const aTime = 'departureDateTime' in a ? a.departureDateTime : 
                   'checkIn' in a ? a.checkIn :
                   'pickupDateTime' in a ? a.pickupDateTime :
                   'startDateTime' in a ? a.startDateTime : new Date(0)
      const bTime = 'departureDateTime' in b ? b.departureDateTime :
                   'checkIn' in b ? b.checkIn :
                   'pickupDateTime' in b ? b.pickupDateTime :
                   'startDateTime' in b ? b.startDateTime : new Date(0)
      return aTime.getTime() - bTime.getTime()
    })

    this.updatedAt = new Date()
  }

  removeItem(itemId: string): void {
    this.schedule = this.schedule.map(day => ({
      ...day,
      items: day.items.filter(item => item.id !== itemId)
    }))
    this.updatedAt = new Date()
  }

  getDaySchedule(date: Date): DaySchedule | undefined {
    return this.schedule.find(day => 
      day.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    )
  }

  addDestination(location: Location): void {
    if (!this.destinations.some(dest => dest.id === location.id)) {
      this.destinations.push(location)
      this.updatedAt = new Date()
    }
  }

  removeDestination(locationId: string): void {
    this.destinations = this.destinations.filter(dest => dest.id !== locationId)
    this.updatedAt = new Date()
  }

  setStatus(status: TripInterface['status']): void {
    this.status = status
    this.updatedAt = new Date()
  }

  toJSON(): Omit<TripInterface, 'getTotalCost' | 'getFlights' | 'getHotels' | 'getTransportation' | 'getAttractions'> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      destinations: this.destinations,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      schedule: this.schedule,
      budget: this.budget,
      notes: this.notes,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}