import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import hotelRoutes from './routes/hotels.js'
import rideRoutes from './routes/rides.js'
import placesRoutes from './routes/places.js'
import flightRoutes from './routes/flights.js'
import tripRoutes from './routes/trips.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/hotels', hotelRoutes)
app.use('/api/rides', rideRoutes)
app.use('/api/places', placesRoutes)
app.use('/api/flights', flightRoutes)
app.use('/api/trips', tripRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`)
  console.log('✓ Using in-memory storage for trips')
  console.log('✓ All API endpoints ready')
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...')
  process.exit(0)
})