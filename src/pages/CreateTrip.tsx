import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { TripAPI } from '../services/api'
import type { Flight } from '../types/Flight'
import FlightSearch from '../components/FlightSearch'
import ManualFlightForm from '../components/ManualFlightForm'

interface TripFormData {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  flights?: Flight[];
  selectedFlight?: Flight | null;
}

const CreateTrip = () => {
  const navigate = useNavigate()

  const [tripData, setTripData] = useState<TripFormData>({
    name: '',
    startDate: null,
    endDate: null,
    flights: [],
    selectedFlight: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  
  const handleSelectFlight = (flight: Flight) => {
    const flightWithNewId = {
      ...flight,
      id: crypto.randomUUID() // Generate a new unique ID for the flight
    }
    setTripData(prev => ({
      ...prev,
      flights: [...(prev.flights || []), flightWithNewId],
      selectedFlight: flightWithNewId
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tripData.name || !tripData.startDate || !tripData.endDate) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError(null)

    const newTrip = {
      id: crypto.randomUUID(),
      name: tripData.name,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      flights: tripData.flights || [],
      hotels: [],
      transportation: [],
      attractions: [],
      totalCost: tripData.flights?.reduce((total, flight) => total + flight.price, 0) || 0,
      days: [],
      locations: []
    }

    try {
      // Create trip using the API service
      const savedTrip = await TripAPI.createTrip(newTrip)
      navigate(`/trip/${savedTrip.id}`)
    } catch (error) {
      console.error('Error creating trip:', error)
      setError('Failed to create trip. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 1 && (!tripData.name || !tripData.startDate || !tripData.endDate)) {
      setError('Please fill in all required fields')
      return
    }
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const [flightMode, setFlightMode] = useState<'search' | 'manual' | null>(null)

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start planning your next adventure by giving your trip a name and selecting the dates.
            </Typography>
            <Box component="form">
              <TextField
                fullWidth
                required
                label="Trip Name"
                value={tripData.name}
                onChange={(e) => setTripData({ ...tripData, name: e.target.value })}
                sx={{ mb: 3 }}
              />
              <Box display="flex" gap={2} sx={{ mb: 3 }}>
                <DatePicker
                  label="Start Date"
                  value={tripData.startDate}
                  onChange={(date) => setTripData({ ...tripData, startDate: date })}
                />
                <DatePicker
                  label="End Date"
                  value={tripData.endDate}
                  onChange={(date) => setTripData({ ...tripData, endDate: date })}
                />
              </Box>
            </Box>
          </>
        )
      case 2:
        return (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Add flights to your trip
            </Typography>
            
            {!flightMode && (
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setFlightMode('search')}
                  sx={{ flex: 1 }}
                >
                  Search Flights
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setFlightMode('manual')}
                  sx={{ flex: 1 }}
                >
                  Add Flight Manually
                </Button>
              </Box>
            )}

            {flightMode === 'search' && (
              <>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    onClick={() => setFlightMode(null)}
                  >
                    Switch to Manual Entry
                  </Button>
                </Box>
                <FlightSearch onSelectFlight={handleSelectFlight} />
              </>
            )}

            {flightMode === 'manual' && (
              <>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    onClick={() => setFlightMode(null)}
                  >
                    Switch to Flight Search
                  </Button>
                </Box>
                <ManualFlightForm
                  onAddFlight={handleSelectFlight}
                  onCancel={() => setFlightMode(null)}
                />
              </>
            )}

            {tripData.flights && tripData.flights.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Selected Flights
                </Typography>
                {tripData.flights.map((flight) => (
                  <Paper key={flight.id} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1">
                          {flight.airline} - Flight {flight.flightNumber}
                        </Typography>
                        <Typography>
                          {flight.departureCity} ({flight.departureAirport}) →{' '}
                          {flight.arrivalCity} ({flight.arrivalAirport})
                        </Typography>
                        <Typography>
                          {new Date(flight.departureDateTime).toLocaleString()}
                        </Typography>
                        <Typography variant="subtitle2">
                          Price: ${flight.price}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setTripData(prev => ({
                          ...prev,
                          flights: prev.flights?.filter(f => f.id !== flight.id) || []
                        }))}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </>
        )
      case 3:
        return (
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Review Trip Details
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1">
                {tripData.name}
              </Typography>
              <Typography>
                {tripData.startDate?.toLocaleDateString()} - {tripData.endDate?.toLocaleDateString()}
              </Typography>
              <Typography>
                Flights: {tripData.flights?.length || 0}
              </Typography>
              <Typography>
                Total Cost: ${tripData.flights?.reduce((total, flight) => total + flight.price, 0) || 0}
              </Typography>
            </Paper>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Create Trip'}
            </Button>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Create New Trip
          </Typography>
          
          {renderStep()}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={step === 1 || isLoading}
            >
              Back
            </Button>
            {step < 3 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isLoading}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
      
      {error && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert
            severity="error"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </>
  )
}

export default CreateTrip