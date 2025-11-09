// In-memory storage for development when MongoDB is unavailable
let trips = []
let counter = 1

export const memoryStore = {
  trips: {
    find: () => {
      return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
    
    findById: (id) => {
      return trips.find(trip => trip.id === id || trip._id === id)
    },
    
    create: (tripData) => {
      const newTrip = {
        ...tripData,
        // Ensure required collection arrays always exist
        flights: Array.isArray(tripData?.flights) ? tripData.flights : [],
        hotels: Array.isArray(tripData?.hotels) ? tripData.hotels : [],
        rides: Array.isArray(tripData?.rides) ? tripData.rides : [],
        attractions: Array.isArray(tripData?.attractions) ? tripData.attractions : [],
        id: `trip-${counter++}`,
        _id: `trip-${counter}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      trips.push(newTrip)
      console.log('✓ Trip saved to memory store:', newTrip.id, '-', newTrip.name)
      return newTrip
    },
    
    update: (id, updates) => {
      const index = trips.findIndex(trip => trip.id === id || trip._id === id)
      if (index === -1) return null
      
      trips[index] = {
        ...trips[index],
        ...updates,
        // Never allow arrays to become undefined
        flights: Array.isArray(updates?.flights) ? updates.flights : trips[index].flights,
        hotels: Array.isArray(updates?.hotels) ? updates.hotels : trips[index].hotels,
        rides: Array.isArray(updates?.rides) ? updates.rides : trips[index].rides,
        attractions: Array.isArray(updates?.attractions) ? updates.attractions : trips[index].attractions,
        updatedAt: new Date()
      }
      console.log('✓ Trip updated in memory store:', trips[index].id)
      return trips[index]
    },
    
    delete: (id) => {
      const index = trips.findIndex(trip => trip.id === id || trip._id === id)
      if (index === -1) return false
      
      trips.splice(index, 1)
      console.log('✓ Trip deleted from memory store:', id)
      return true
    },
    
    clear: () => {
      trips = []
      counter = 1
    }
  }
}
