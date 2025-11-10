import express from 'express'
import googleApi from '../services/googleApi.js'

const router = express.Router()

// Calculate distance between two locations
router.get('/distance', async (req, res) => {
  try {
    const { from, to, mode = 'driving' } = req.query

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to parameters are required' })
    }

    // Support both place_id format and coordinates
    const origin = from.startsWith('place_id:') ? from : from
    const destination = to.startsWith('place_id:') ? to : to

    const distanceData = await googleApi.getDistanceMatrix(origin, destination, mode)

    if (distanceData.rows?.[0]?.elements?.[0]?.status !== 'OK') {
      const status = distanceData.rows?.[0]?.elements?.[0]?.status || 'UNKNOWN_ERROR'
      return res.status(400).json({ 
        error: 'Could not calculate distance',
        status
      })
    }

    const element = distanceData.rows[0].elements[0]

    res.json({
      distance: element.distance.text,
      duration: element.duration.text,
      distanceValue: element.distance.value, // in meters
      durationValue: element.duration.value, // in seconds
      origin: distanceData.origin_addresses[0],
      destination: distanceData.destination_addresses[0],
      mode
    })
  } catch (error) {
    console.error('Ride distance calculation error:', error.message)
    res.status(500).json({ 
      error: 'Failed to calculate ride distance',
      message: error.message 
    })
  }
})

// Calculate route with Google Distance Matrix API (for Generate Ride feature)
router.post('/calculate-route', async (req, res) => {
  try {
    const { origin, destination } = req.body

    if (!origin || !destination) {
      return res.status(400).json({ error: 'origin and destination are required' })
    }

    const distanceData = await googleApi.getDistanceMatrix(origin, destination, 'driving')

    if (distanceData.rows?.[0]?.elements?.[0]?.status !== 'OK') {
      const status = distanceData.rows?.[0]?.elements?.[0]?.status || 'UNKNOWN_ERROR'
      return res.status(400).json({ 
        error: 'Could not calculate route',
        status,
        details: 'Please ensure both locations are valid addresses or place names'
      })
    }

    const element = distanceData.rows[0].elements[0]

    res.json({
      distance: element.distance.text,
      duration: element.duration.text,
      distanceValue: element.distance.value, // in meters
      durationValue: element.duration.value, // in seconds
      originAddress: distanceData.origin_addresses[0],
      destinationAddress: distanceData.destination_addresses[0]
    })
  } catch (error) {
    console.error('Route calculation error:', error.message)
    res.status(500).json({ 
      error: 'Failed to calculate route',
      message: error.message 
    })
  }
})

// Get location suggestions for ride pickup/dropoff
router.get('/location-autocomplete', async (req, res) => {
  try {
    const { input } = req.query

    if (!input || input.trim().length < 2) {
      return res.status(400).json({ error: 'Input parameter is required and must be at least 2 characters' })
    }

    const predictions = await googleApi.autocomplete(input.trim(), 'establishment')

    const locationSuggestions = predictions.map(prediction => ({
      placeId: prediction.place_id,
      name: prediction.structured_formatting.main_text,
      formattedAddress: prediction.description,
      types: prediction.types
    }))

    res.json({ suggestions: locationSuggestions })
  } catch (error) {
    console.error('Location autocomplete error:', error.message)
    res.status(500).json({ 
      error: 'Failed to fetch location suggestions',
      message: error.message 
    })
  }
})

// Get detailed location info for ride planning
router.get('/location-details', async (req, res) => {
  try {
    const { place_id } = req.query

    if (!place_id) {
      return res.status(400).json({ error: 'place_id parameter is required' })
    }

    const details = await googleApi.getPlaceDetails(place_id, [
      'place_id', 'name', 'formatted_address', 'geometry'
    ])

    const locationDetails = {
      placeId: details.place_id,
      name: details.name,
      formattedAddress: details.formatted_address,
      location: details.geometry?.location || null
    }

    res.json({ location: locationDetails })
  } catch (error) {
    console.error('Location details error:', error.message)
    res.status(500).json({ 
      error: 'Failed to fetch location details',
      message: error.message 
    })
  }
})

// Calculate ride estimate with multiple options
router.post('/estimate', async (req, res) => {
  try {
    const { pickup, dropoff, modes = ['driving'] } = req.body

    if (!pickup || !dropoff) {
      return res.status(400).json({ error: 'pickup and dropoff locations are required' })
    }

    // Validate pickup and dropoff have required fields
    if (!pickup.placeId || !dropoff.placeId) {
      return res.status(400).json({ error: 'pickup and dropoff must include placeId' })
    }

    const origin = `place_id:${pickup.placeId}`
    const destination = `place_id:${dropoff.placeId}`

    const estimates = []

    for (const mode of modes) {
      try {
        const distanceData = await googleApi.getDistanceMatrix(origin, destination, mode)
        
        if (distanceData.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const element = distanceData.rows[0].elements[0]
          estimates.push({
            mode,
            distance: element.distance.text,
            duration: element.duration.text,
            distanceValue: element.distance.value,
            durationValue: element.duration.value
          })
        }
      } catch (modeError) {
        console.warn(`Failed to get estimate for mode ${mode}:`, modeError.message)
      }
    }

    if (estimates.length === 0) {
      return res.status(400).json({ error: 'Could not calculate distance for any mode' })
    }

    res.json({
      pickup: {
        placeId: pickup.placeId,
        name: pickup.name,
        formattedAddress: pickup.formattedAddress
      },
      dropoff: {
        placeId: dropoff.placeId,
        name: dropoff.name,
        formattedAddress: dropoff.formattedAddress
      },
      estimates
    })
  } catch (error) {
    console.error('Ride estimate error:', error.message)
    res.status(500).json({ 
      error: 'Failed to calculate ride estimate',
      message: error.message 
    })
  }
})

export default router