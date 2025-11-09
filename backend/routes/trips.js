import express from 'express'
import { memoryStore } from '../config/memoryStore.js'

const router = express.Router()

// Helpers
function getTripOr404(req, res) {
  const trip = memoryStore.trips.findById(req.params.id)
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' })
    return null
  }
  // Ensure arrays exist
  trip.flights = Array.isArray(trip.flights) ? trip.flights : []
  trip.hotels = Array.isArray(trip.hotels) ? trip.hotels : []
  trip.rides = Array.isArray(trip.rides) ? trip.rides : []
  trip.attractions = Array.isArray(trip.attractions) ? trip.attractions : []
  return trip
}

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = memoryStore.trips.find()
    res.json(trips)
  } catch (error) {
    console.error('Error fetching trips:', error)
    res.status(500).json({ error: 'Failed to fetch trips' })
  }
})

// Get a single trip by ID
router.get('/:id', async (req, res) => {
  try {
    const trip = memoryStore.trips.findById(req.params.id)
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' })
    }
    
    res.json(trip)
  } catch (error) {
    console.error('Error fetching trip:', error)
    res.status(500).json({ error: 'Failed to fetch trip' })
  }
})

// Create a new trip
router.post('/', async (req, res) => {
  try {
    const tripData = req.body
    const createdTrip = memoryStore.trips.create(tripData)
    
    console.log('✓ Trip created:', createdTrip.id, '-', createdTrip.name)
    
    res.status(201).json(createdTrip)
  } catch (error) {
    console.error('Error creating trip:', error)
    res.status(500).json({ error: 'Failed to create trip', message: error.message })
  }
})

// Update a trip
router.put('/:id', async (req, res) => {
  try {
    const updated = memoryStore.trips.update(req.params.id, req.body)
    
    if (!updated) {
      return res.status(404).json({ error: 'Trip not found' })
    }
    
    console.log('✓ Trip updated:', updated.id)
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating trip:', error)
    res.status(500).json({ error: 'Failed to update trip', message: error.message })
  }
})

// Delete a trip
router.delete('/:id', async (req, res) => {
  try {
    const deleted = memoryStore.trips.delete(req.params.id)
    
    if (!deleted) {
      return res.status(404).json({ error: 'Trip not found' })
    }
    
    console.log('✓ Trip deleted:', req.params.id)
    
    res.json({ success: true, message: 'Trip deleted successfully' })
  } catch (error) {
    console.error('Error deleting trip:', error)
    res.status(500).json({ error: 'Failed to delete trip', message: error.message })
  }
})

export default router

/**
 * Trip Sub-resources API
 * --------------------------------------
 * POST /api/trips/:id/flights       -> add a flight segment
 * POST /api/trips/:id/hotels        -> add a hotel booking
 * POST /api/trips/:id/rides         -> add a ride leg
 * POST /api/trips/:id/attractions   -> add an attraction visit
 * DELETE /api/trips/:id/:type/:idx  -> remove by index (type in flights|hotels|rides|attractions)
 */

router.post('/:id/flights', (req, res) => {
  const trip = getTripOr404(req, res)
  if (!trip) return
  const flight = req.body || {}
  // minimal validation
  if (!flight.flightNumber || !flight.departureDateTime || !flight.arrivalDateTime) {
    return res.status(400).json({ error: 'flightNumber, departureDateTime and arrivalDateTime are required' })
  }
  trip.flights.push(flight)
  const updated = memoryStore.trips.update(trip.id, { flights: trip.flights })
  res.status(201).json(updated)
})

router.post('/:id/hotels', (req, res) => {
  const trip = getTripOr404(req, res)
  if (!trip) return
  const hotel = req.body || {}
  if (!hotel.name || !hotel.checkIn || !hotel.checkOut) {
    return res.status(400).json({ error: 'name, checkIn and checkOut are required' })
  }
  trip.hotels.push(hotel)
  const updated = memoryStore.trips.update(trip.id, { hotels: trip.hotels })
  res.status(201).json(updated)
})

router.post('/:id/rides', (req, res) => {
  const trip = getTripOr404(req, res)
  if (!trip) return
  const ride = req.body || {}
  if (!ride.pickup || !ride.dropoff) {
    return res.status(400).json({ error: 'pickup and dropoff are required' })
  }
  trip.rides.push(ride)
  const updated = memoryStore.trips.update(trip.id, { rides: trip.rides })
  res.status(201).json(updated)
})

router.post('/:id/attractions', (req, res) => {
  const trip = getTripOr404(req, res)
  if (!trip) return
  const attraction = req.body || {}
  if (!attraction.name || !attraction.scheduledDate) {
    return res.status(400).json({ error: 'name and scheduledDate are required' })
  }
  trip.attractions.push(attraction)
  const updated = memoryStore.trips.update(trip.id, { attractions: trip.attractions })
  res.status(201).json(updated)
})

router.delete('/:id/:type/:idx', (req, res) => {
  const trip = getTripOr404(req, res)
  if (!trip) return
  const { type, idx } = req.params
  const valid = ['flights','hotels','rides','attractions']
  if (!valid.includes(type)) return res.status(400).json({ error: 'Invalid type' })
  const i = parseInt(idx, 10)
  if (Number.isNaN(i) || i < 0 || i >= trip[type].length) return res.status(400).json({ error: 'Invalid index' })
  trip[type].splice(i, 1)
  const updated = memoryStore.trips.update(trip.id, { [type]: trip[type] })
  res.json(updated)
})
