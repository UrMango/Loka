import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Stack,
  IconButton,
  Chip,
  Alert,
} from '@mui/material'
import { format } from 'date-fns'
import AddIcon from '@mui/icons-material/Add'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import HotelIcon from '@mui/icons-material/Hotel'
import AttractionsIcon from '@mui/icons-material/Attractions'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Layout from '../components/Layout'
import type { Trip } from '../types/Trip'
import { TripAPI } from '../services/api'

const TripList = () => {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await TripAPI.getTrips()
        setTrips(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch trips. Please try again later.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return

    try {
      await TripAPI.deleteTrip(id)
      setTrips(trips.filter(trip => trip.id !== id))
    } catch (err) {
      console.error('Failed to delete trip:', err)
      alert('Failed to delete trip. Please try again.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                My Trips
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {trips.length === 0 
                  ? 'No trips yet' 
                  : `${trips.length} ${trips.length === 1 ? 'trip' : 'trips'} planned`}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/trip/new')}
              sx={{
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
                },
              }}
            >
              Create New Trip
            </Button>
          </Stack>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {trips.length === 0 && !error && (
          <Card
            sx={{
              p: 8,
              textAlign: 'center',
              bgcolor: '#f8fafc',
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <FlightTakeoffIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              No Trips Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Start planning your first adventure
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/trip/new')}
              sx={{
                px: 4,
                py: 1.5,
              }}
            >
              Create Your First Trip
            </Button>
          </Card>
        )}

        {/* Trip Cards */}
        {trips.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {trips.map((trip) => (
              <Card
                key={trip.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                  },
                }}
                onClick={() => navigate(`/trip/${trip.id}`)}
              >
                <CardContent sx={{ flex: 1, p: 3 }}>
                  {/* Trip Title & Destination */}
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {trip.name}
                  </Typography>
                  
                  {trip.destinations && trip.destinations.length > 0 && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {trip.destinations.map(d => d.name || d.address).join(', ')}
                    </Typography>
                  )}

                  {/* Dates */}
                  {trip.startDate && trip.endDate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {format(new Date(trip.startDate), 'MMM dd, yyyy')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                    </Typography>
                  )}

                  {/* Trip Summary */}
                  <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {trip.getFlights && trip.getFlights().length > 0 && (
                      <Chip
                        icon={<FlightTakeoffIcon />}
                        label={`${trip.getFlights().length} Flight${trip.getFlights().length > 1 ? 's' : ''}`}
                        size="small"
                        sx={{ bgcolor: '#dbeafe', color: '#1e40af' }}
                      />
                    )}
                    {trip.getHotels && trip.getHotels().length > 0 && (
                      <Chip
                        icon={<HotelIcon />}
                        label={`${trip.getHotels().length} Hotel${trip.getHotels().length > 1 ? 's' : ''}`}
                        size="small"
                        sx={{ bgcolor: '#fce7f3', color: '#9f1239' }}
                      />
                    )}
                    {trip.getTransportation && trip.getTransportation().length > 0 && (
                      <Chip
                        icon={<DirectionsCarIcon />}
                        label={`${trip.getTransportation().length} Ride${trip.getTransportation().length > 1 ? 's' : ''}`}
                        size="small"
                        sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }}
                      />
                    )}
                    {trip.getAttractions && trip.getAttractions().length > 0 && (
                      <Chip
                        icon={<AttractionsIcon />}
                        label={`${trip.getAttractions().length} Activity${trip.getAttractions().length > 1 ? 'ies' : 'y'}`}
                        size="small"
                        sx={{ bgcolor: '#d1fae5', color: '#065f46' }}
                      />
                    )}
                  </Stack>

                  {/* Description */}
                  {trip.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2,
                      }}
                    >
                      {trip.description}
                    </Typography>
                  )}
                </CardContent>

                {/* Actions */}
                <Box
                  sx={{
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/trip/${trip.id}`)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'primary.50' },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(trip.id!)}
                    sx={{
                      color: 'error.main',
                      '&:hover': { bgcolor: 'error.50' },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Layout>
  )
}

export default TripList
