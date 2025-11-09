import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
} from '@mui/material'
import Layout from '../components/Layout'
import TripBasicInfo from '../components/TripWizard/TripBasicInfo'
import TripFlightStep from '../components/TripWizard/TripFlightStep'
import TripHotelStep from '../components/TripWizard/TripHotelStep'
import TripTransportationStep from '../components/TripWizard/TripTransportationStep'
import TripAttractionsStep from '../components/TripWizard/TripAttractionsStep'
import TripReviewStep from '../components/TripWizard/TripReviewStep'
import type { Flight } from '../types/Flight'
import type { Hotel } from '../types/Hotel'
import type { Transportation } from '../types/Transportation'
import type { Attraction } from '../types/Attraction'
import { TripAPI } from '../services/api'

const steps = [
  'Trip Details',
  'Flights',
  'Hotels',
  'Transportation',
  'Attractions',
  'Review'
]

interface TripData {
  name: string
  departureLocation: string
  arrivalLocation: string
  startDate: Date | null
  endDate: Date | null
  flights: Flight[]
  hotels: Hotel[]
  transportation: Transportation[]
  attractions: Attraction[]
}

export default function CreateTripWizard() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [tripData, setTripData] = useState<TripData>({
    name: '',
    departureLocation: '',
    arrivalLocation: '',
    startDate: null,
    endDate: null,
    flights: [],
    hotels: [],
    transportation: [],
    attractions: []
  })

  const handleNext = () => {
    setError(null)
    
    // Validation for each step
    if (activeStep === 0) {
      if (!tripData.name || !tripData.startDate || !tripData.endDate) {
        setError('Please fill in all required fields')
        return
      }
      if (tripData.startDate > tripData.endDate) {
        setError('End date must be after start date')
        return
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setError(null)
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Transform hotel data to match backend schema
      const hotelsForBackend = tripData.hotels.map(hotel => ({
        id: hotel.id,
        type: 'hotel',
        name: hotel.name,
        location: hotel.location,
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        pricePerNight: hotel.pricePerNight || 0,
        roomType: hotel.roomType || 'Standard',
        rating: hotel.rating || 3,
        bookingReference: hotel.bookingReference || '',
        notes: hotel.notes || '',
        placeId: hotel.placeId,
        formattedAddress: hotel.formattedAddress
      }))

      const newTrip = {
        name: tripData.name,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        status: 'planning',
        flights: tripData.flights,
        hotels: hotelsForBackend,
        transportation: tripData.transportation,
        attractions: tripData.attractions,
      }

      const savedTrip = await TripAPI.createTrip(newTrip)
      navigate(`/trip/${savedTrip.id}`)
    } catch (err) {
      console.error('Error creating trip:', err)
      setError('Failed to create trip. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <TripBasicInfo tripData={tripData} setTripData={setTripData} />
      case 1:
        return <TripFlightStep tripData={tripData} setTripData={setTripData} />
      case 2:
        return <TripHotelStep tripData={tripData} setTripData={setTripData} />
      case 3:
        return <TripTransportationStep tripData={tripData} setTripData={setTripData} />
      case 4:
        return <TripAttractionsStep tripData={tripData} setTripData={setTripData} />
      case 5:
        return <TripReviewStep tripData={tripData} />
      default:
        return 'Unknown step'
    }
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Create Your Trip
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Plan your perfect journey step by step
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid #e2e8f0' }}>
          <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ minHeight: 400, py: 3 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 5,
          pt: 3,
          borderTop: '1px solid #e2e8f0'
        }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            size="large"
          >
            Back
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  minWidth: 140,
                  background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
                  },
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create Trip'}
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={handleNext}
                sx={{ minWidth: 100 }}
              >
                {activeStep === steps.length - 2 ? 'Review' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
    </Layout>
  )
}
