import { useState, useCallback } from 'react'
import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import { TripAPI } from '../services/api'
import type { Flight, Airport } from '../types/Flight'
import { searchAirportsWithGooglePlaces } from '../services/airportSearch'

interface FlightSearchProps {
  onSelectFlight: (flight: Flight) => void
}

export default function FlightSearch({ onSelectFlight }: FlightSearchProps) {
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null)
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null)
  const [departureDate, setDepartureDate] = useState<Date | null>(new Date())
  const [airports, setAirports] = useState<Airport[]>([])
  const [searchResults, setSearchResults] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchAirports = useCallback(async (query: string) => {
    if (query.length < 2) {
      setAirports([])
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const results = await searchAirportsWithGooglePlaces(query)
      setAirports(results)
    } catch (error) {
      console.error('Error searching airports:', error)
      setError(error instanceof Error ? error.message : 'Failed to search airports. Please try again.')
      setAirports([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = async () => {
    if (!departureAirport || !arrivalAirport || !departureDate) return
    
    setSearching(true)
    setError(null)
    try {
      // Check if airports are too close (less than 50km) - only if Google Maps is loaded
      if (typeof google !== 'undefined' && google.maps?.geometry?.spherical) {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(departureAirport.location.lat, departureAirport.location.lng),
          new google.maps.LatLng(arrivalAirport.location.lat, arrivalAirport.location.lng)
        )
        
        if (distance < 50000) { // 50km in meters
          setError('These airports are too close together. Please select airports further apart.')
          setSearching(false)
          return
        }
      }

      const results = await TripAPI.searchFlights(
        departureAirport.code,
        arrivalAirport.code,
        departureDate
      )
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching flights:', error)
      setError('Failed to search for flights. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 4
        }}
      >
        <Box>
          <Autocomplete
            options={airports}
            getOptionLabel={(option) => `${option.code} - ${option.city}, ${option.country}`}
            onChange={(_, value) => setDepartureAirport(value)}
            onInputChange={(_, value) => searchAirports(value)}
            loading={loading}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography>
                    {option.code} - {option.city}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.name} • {option.country}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="From"
                placeholder="Search airports..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>
        <Box>
          <Autocomplete
            options={airports}
            getOptionLabel={(option) => `${option.code} - ${option.city}, ${option.country}`}
            onChange={(_, value) => setArrivalAirport(value)}
            onInputChange={(_, value) => searchAirports(value)}
            loading={loading}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography>
                    {option.code} - {option.city}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.name} • {option.country}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="To"
                placeholder="Search airports..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>
        <Box>
          <DateTimePicker
            label="Departure Date"
            value={departureDate}
            onChange={(newValue) => setDepartureDate(newValue)}
            sx={{ width: '100%' }}
          />
        </Box>
      </Box>
      
      <Button
        variant="contained"
        onClick={handleSearch}
        disabled={!departureAirport || !arrivalAirport || !departureDate || searching}
        sx={{ mb: 4 }}
      >
        {searching ? <CircularProgress size={24} /> : 'Search Flights'}
      </Button>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {searchResults.map((flight) => (
          <Card key={flight.id}>
            <CardContent>
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '4fr 4fr 2fr 2fr' },
                  gap: 2,
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="h6">{flight.airline}</Typography>
                  <Typography color="textSecondary">
                    Flight {flight.flightNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography>
                    {flight.departureAirport.city} ({flight.departureAirport.code}) →{' '}
                    {flight.arrivalAirport.city} ({flight.arrivalAirport.code})
                  </Typography>
                  <Typography color="textSecondary">
                    {new Date(flight.departureDateTime).toLocaleString()} →{' '}
                    {new Date(flight.arrivalDateTime).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6">${flight.price}</Typography>
                  {flight.layovers > 0 && (
                    <Typography color="textSecondary">
                      {flight.layovers} {flight.layovers === 1 ? 'layover' : 'layovers'}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onSelectFlight(flight)}
                    fullWidth
                  >
                    Select
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  )
}