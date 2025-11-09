import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Autocomplete,
  CircularProgress,
  Alert,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import type { Flight, Airport } from '../types/Flight'

interface ManualFlightFormProps {
  onAddFlight: (flight: Flight) => void
  onCancel: () => void
}

export default function ManualFlightForm({ onAddFlight, onCancel }: ManualFlightFormProps) {
  const [searchMode, setSearchMode] = useState<'flight-number' | 'route'>('flight-number')
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(false)
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null)
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null)
  const [returnDepartureAirport, setReturnDepartureAirport] = useState<Airport | null>(null)
  const [returnArrivalAirport, setReturnArrivalAirport] = useState<Airport | null>(null)
  const [flightDetailsLoading, setFlightDetailsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way')
  const [routeSearchResults, setRouteSearchResults] = useState<any[]>([])
  const [originAirport, setOriginAirport] = useState<Airport | null>(null)
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null)
  const [searchDate, setSearchDate] = useState<Date>(new Date())
  const [returnFlightDetails, setReturnFlightDetails] = useState<any>(null)
  const [flightData, setFlightData] = useState({
    airline: '',
    flightNumber: '',
    departureDateTime: new Date(),
    arrivalDateTime: new Date(),
    price: '',
    layovers: '0',
    duration: 0, // in minutes
    // Baggage fields
    carryOnTrolley: false,
    checkedBaggage: false,
    // Booking details
    bookingNumber: '',
    bookingCompany: '',
    // Terminal info (no gates)
    departureTerminal: '',
    arrivalTerminal: '',
    // Local time fields
    departureTimeLocal: '',
    departureTimezone: '',
    arrivalTimeLocal: '',
    arrivalTimezone: '',
    // Return flight fields
    returnFlightNumber: '',
    returnDepartureDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    returnArrivalDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    returnPrice: '',
    returnDuration: 0,
    returnCarryOnTrolley: false,
    returnCheckedBaggage: false,
    returnBookingNumber: '',
    returnDepartureTerminal: '',
    returnArrivalTerminal: '',
    returnDepartureTimeLocal: '',
    returnDepartureTimezone: '',
    returnArrivalTimeLocal: '',
    returnArrivalTimezone: ''
  })

  const searchAirports = async (query: string) => {
    if (query.length < 2) return
    setLoading(true)
    try {
      // Call backend airport search API
      const response = await fetch(`http://localhost:3001/api/flights/airports/search?query=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.airports && data.airports.length > 0) {
        setAirports(data.airports)
      } else {
        // Fallback to common airports if API returns empty
        const commonAirports = [
          { code: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'IL', location: { lat: 32.01, lng: 34.87 } },
          { code: 'JFK', name: 'John F Kennedy Intl', city: 'New York', country: 'US', location: { lat: 40.64, lng: -73.78 } },
          { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'GB', location: { lat: 51.47, lng: -0.46 } },
          { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'AE', location: { lat: 25.25, lng: 55.36 } },
          { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'FR', location: { lat: 49.01, lng: 2.55 } },
          { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'US', location: { lat: 33.94, lng: -118.41 } },
        ].filter(a => 
          a.code.toLowerCase().includes(query.toLowerCase()) ||
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.city.toLowerCase().includes(query.toLowerCase())
        )
        setAirports(commonAirports)
      }
    } catch (error) {
      console.error('Error searching airports:', error)
      // Fallback to common airports on error
      const commonAirports = [
        { code: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'IL', location: { lat: 32.01, lng: 34.87 } },
        { code: 'JFK', name: 'John F Kennedy Intl', city: 'New York', country: 'US', location: { lat: 40.64, lng: -73.78 } },
        { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'GB', location: { lat: 51.47, lng: -0.46 } },
        { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'AE', location: { lat: 25.25, lng: 55.36 } },
        { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'FR', location: { lat: 49.01, lng: 2.55 } },
        { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'US', location: { lat: 33.94, lng: -118.41 } },
      ].filter(a => 
        a.code.toLowerCase().includes(query.toLowerCase()) ||
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.city.toLowerCase().includes(query.toLowerCase())
      )
      setAirports(commonAirports)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchFlights = async () => {
    if (!flightData.flightNumber) {
      setError('Please enter a flight number')
      return
    }

    setFlightDetailsLoading(true)
    setError(null)

    try {
      // Single date search
      const dateStr = flightData.departureDateTime.toISOString().split('T')[0]
      const response = await fetch(
        `http://localhost:3001/api/flights/search/${flightData.flightNumber}?date=${dateStr}`
      )
      
      if (!response.ok) {
        throw new Error('Flight not found')
      }
      
      const details = await response.json()
      
      if (details) {
        // Calculate duration in minutes
        const depTime = new Date(details.departureDateTime)
        const arrTime = new Date(details.arrivalDateTime)
        const durationMinutes = Math.floor((arrTime.getTime() - depTime.getTime()) / (1000 * 60))

        // Auto-fill form with flight details
        setFlightData({
          ...flightData,
          airline: details.airline,
          departureDateTime: depTime,
          arrivalDateTime: arrTime,
          duration: durationMinutes,
          departureTimeLocal: details.departureTimeLocal || '',
          departureTimezone: details.departureTimezone || '',
          arrivalTimeLocal: details.arrivalTimeLocal || '',
          arrivalTimezone: details.arrivalTimezone || '',
          departureTerminal: details.terminal?.departure || '',
          arrivalTerminal: details.terminal?.arrival || ''
        })

        // Find and set airports
        const depAirport = { 
          code: details.departureAirportCode, 
          city: details.departureCity,
          name: details.departureCity,
          country: details.departureCountry || '',
          location: { lat: 0, lng: 0 }
        }
        const arrAirport = { 
          code: details.arrivalAirportCode, 
          city: details.arrivalCity,
          name: details.arrivalCity,
          country: details.arrivalCountry || '',
          location: { lat: 0, lng: 0 }
        }
        setDepartureAirport(depAirport)
        setArrivalAirport(arrAirport)
      }
    } catch (err) {
      console.error('Error fetching flight details:', err)
      setError('Failed to fetch flight details. Please try again.')
    } finally {
      setFlightDetailsLoading(false)
    }
  }

  const handleSearchReturnFlight = async () => {
    if (!flightData.returnFlightNumber) {
      setError('Please enter a return flight number')
      return
    }

    setFlightDetailsLoading(true)
    setError(null)

    try {
      const dateStr = flightData.returnDepartureDateTime.toISOString().split('T')[0]
      const response = await fetch(
        `http://localhost:3001/api/flights/search/${flightData.returnFlightNumber}?date=${dateStr}`
      )
      
      if (!response.ok) {
        throw new Error('Return flight not found')
      }
      
      const details = await response.json()
      
      if (details) {
        // Calculate duration in minutes
        const depTime = new Date(details.departureDateTime)
        const arrTime = new Date(details.arrivalDateTime)
        const durationMinutes = Math.floor((arrTime.getTime() - depTime.getTime()) / (1000 * 60))

        // Update flight data with return flight details
        setFlightData({
          ...flightData,
          returnDepartureDateTime: depTime,
          returnArrivalDateTime: arrTime,
          returnDuration: durationMinutes,
          returnDepartureTimeLocal: details.departureTimeLocal || '',
          returnDepartureTimezone: details.departureTimezone || '',
          returnArrivalTimeLocal: details.arrivalTimeLocal || '',
          returnArrivalTimezone: details.arrivalTimezone || '',
          returnDepartureTerminal: details.terminal?.departure || '',
          returnArrivalTerminal: details.terminal?.arrival || ''
        })

        setReturnFlightDetails(details)
        
        // Set return flight airports
        const depAirport = { 
          code: details.departureAirportCode, 
          city: details.departureCity,
          name: details.departureCity,
          country: details.departureCountry || '',
          location: { lat: 0, lng: 0 }
        }
        const arrAirport = { 
          code: details.arrivalAirportCode, 
          city: details.arrivalCity,
          name: details.arrivalCity,
          country: details.arrivalCountry || '',
          location: { lat: 0, lng: 0 }
        }
        setReturnDepartureAirport(depAirport)
        setReturnArrivalAirport(arrAirport)
      }
    } catch (err) {
      console.error('Error fetching return flight details:', err)
      setError('Failed to fetch return flight details. Please try again.')
    } finally {
      setFlightDetailsLoading(false)
    }
  }

  const handleSearchByRoute = async () => {
    if (!originAirport || !destinationAirport) {
      setError('Please select origin and destination airports')
      return
    }

    setFlightDetailsLoading(true)
    setError(null)
    setRouteSearchResults([])

    try {
      const dateStr = searchDate.toISOString().split('T')[0]
      const response = await fetch(
        `http://localhost:3001/api/flights/search-route?from=${originAirport.code}&to=${destinationAirport.code}&date=${dateStr}`
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          throw new Error('⚠️ API rate limit exceeded. Please wait a few minutes and try again, or use the flight number search instead.')
        }
        throw new Error(errorData.message || 'Failed to search flights')
      }
      
      const data = await response.json()
      
      if (data.flights && data.flights.length > 0) {
        setRouteSearchResults(data.flights)
      } else {
        setError('No flights found for this route and date. Try the flight number search instead.')
      }
    } catch (err: any) {
      console.error('Error searching flights by route:', err)
      setError(err.message || 'Failed to search flights. Please try again.')
    } finally {
      setFlightDetailsLoading(false)
    }
  }

  const handleSelectFlightFromResults = async (flight: any) => {
    // Extract date from the flight ID or use search date
    const dateStr = searchDate.toISOString().split('T')[0]
    
    // Fetch full flight details using flight number search to get complete information
    setFlightDetailsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `http://localhost:3001/api/flights/search/${flight.flightNumber.replace(/\s+/g, '')}?date=${dateStr}`
      )
      
      if (!response.ok) {
        throw new Error('Could not fetch full flight details')
      }
      
      const details = await response.json()
      
      // Calculate duration in minutes
      const depTime = new Date(details.departureDateTime)
      const arrTime = new Date(details.arrivalDateTime)
      const durationMinutes = Math.floor((arrTime.getTime() - depTime.getTime()) / (1000 * 60))

      // Auto-fill form with complete flight details
      setFlightData({
        ...flightData,
        airline: details.airline,
        flightNumber: flight.flightNumber,
        departureDateTime: depTime,
        arrivalDateTime: arrTime,
        duration: durationMinutes,
        departureTimeLocal: details.departureTimeLocal || '',
        departureTimezone: details.departureTimezone || '',
        arrivalTimeLocal: details.arrivalTimeLocal || '',
        arrivalTimezone: details.arrivalTimezone || '',
        departureTerminal: details.terminal?.departure || '',
        arrivalTerminal: details.terminal?.arrival || ''
      })

      // Set airports from full details
      const depAirport = { 
        code: details.departureAirportCode, 
        city: details.departureCity,
        name: details.departureCity,
        country: details.departureCountry || '',
        location: { lat: 0, lng: 0 }
      }
      const arrAirport = { 
        code: details.arrivalAirportCode, 
        city: details.arrivalCity,
        name: details.arrivalCity,
        country: details.arrivalCountry || '',
        location: { lat: 0, lng: 0 }
      }
      setDepartureAirport(depAirport)
      setArrivalAirport(arrAirport)

      // Clear search results
      setRouteSearchResults([])
      
    } catch (err) {
      console.error('Error fetching full flight details:', err)
      // Fallback to partial data from route search
      const arrTime = new Date(flight.arrival.scheduled)
      
      setFlightData({
        ...flightData,
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        arrivalDateTime: arrTime,
        duration: flight.durationMinutes || 0,
        arrivalTimeLocal: flight.arrival.scheduled || '',
        arrivalTerminal: flight.arrival.terminal || ''
      })

      // Set airports from route search
      const depAirport = { 
        code: flight.departure.iata, 
        city: flight.departure.airport,
        name: flight.departure.airport,
        country: '',
        location: { lat: 0, lng: 0 }
      }
      const arrAirport = { 
        code: flight.arrival.iata, 
        city: flight.arrival.airport,
        name: flight.arrival.airport,
        country: '',
        location: { lat: 0, lng: 0 }
      }
      setDepartureAirport(depAirport)
      setArrivalAirport(arrAirport)
      
      setRouteSearchResults([])
      setError('Loaded partial flight info. Please verify departure time and terminal.')
    } finally {
      setFlightDetailsLoading(false)
    }
  }

  const handleSubmit = async () => {
    console.log('=== FORM SUBMITTED ===')
    console.log('Flight data:', flightData)
    console.log('Departure airport:', departureAirport)
    console.log('Arrival airport:', arrivalAirport)
    
    if (!departureAirport || !arrivalAirport) {
      console.log('Missing airport data:', { departureAirport, arrivalAirport })
      alert('Please ensure both departure and arrival airports are selected')
      return
    }

    // Create outbound flight object with all details
    const outboundFlight: Flight = {
      id: Date.now().toString(),
      type: 'flight',
      airline: flightData.airline,
      flightNumber: flightData.flightNumber,
      departureAirport: departureAirport,
      arrivalAirport: arrivalAirport,
      departureDateTime: flightData.departureDateTime,
      arrivalDateTime: flightData.arrivalDateTime,
      price: Number(flightData.price) || 0,
      layovers: Number(flightData.layovers) || 0,
      duration: flightData.duration,
      // Baggage information
      carryOnTrolley: flightData.carryOnTrolley,
      checkedBaggage: flightData.checkedBaggage,
      // Booking details
      bookingNumber: flightData.bookingNumber || undefined,
      bookingCompany: flightData.bookingCompany || undefined,
      // Terminal info
      departureTerminal: flightData.departureTerminal || undefined,
      arrivalTerminal: flightData.arrivalTerminal || undefined,
      // Time zone info
      ...(flightData.departureTimeLocal && { departureTimeLocal: flightData.departureTimeLocal }),
      ...(flightData.departureTimezone && { departureTimezone: flightData.departureTimezone }),
      ...(flightData.arrivalTimeLocal && { arrivalTimeLocal: flightData.arrivalTimeLocal }),
      ...(flightData.arrivalTimezone && { arrivalTimezone: flightData.arrivalTimezone }),
    } as any

    console.log('Adding outbound flight:', outboundFlight)
    onAddFlight(outboundFlight)

    // If round trip, also add return flight
    if (tripType === 'round-trip' && returnFlightDetails && returnDepartureAirport && returnArrivalAirport) {
      const returnFlight: Flight = {
        id: (Date.now() + 1).toString(), // Ensure unique ID
        type: 'flight',
        airline: returnFlightDetails.airline,
        flightNumber: flightData.returnFlightNumber,
        departureAirport: returnDepartureAirport,
        arrivalAirport: returnArrivalAirport,
        departureDateTime: new Date(returnFlightDetails.departureDateTime),
        arrivalDateTime: new Date(returnFlightDetails.arrivalDateTime),
        price: Number(flightData.returnPrice) || 0,
        layovers: 0,
        duration: flightData.returnDuration,
        // Return flight baggage
        carryOnTrolley: flightData.returnCarryOnTrolley,
        checkedBaggage: flightData.returnCheckedBaggage,
        // Return flight booking (same booking number usually)
        bookingNumber: flightData.returnBookingNumber || flightData.bookingNumber || undefined,
        bookingCompany: flightData.bookingCompany || undefined,
        // Return flight terminal info
        departureTerminal: flightData.returnDepartureTerminal || returnFlightDetails.terminal?.departure || undefined,
        arrivalTerminal: flightData.returnArrivalTerminal || returnFlightDetails.terminal?.arrival || undefined
      } as any

      console.log('Adding return flight:', returnFlight)
      onAddFlight(returnFlight)
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> Select "Round Trip" to add both outbound and return flights at once!
        </Typography>
      </Alert>

      <Stack spacing={2}>
        {/* Search Mode Toggle */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Search Method
          </Typography>
          <ToggleButtonGroup
            value={searchMode}
            exclusive
            onChange={(_, value) => {
              if (value) {
                setSearchMode(value)
                setError(null)
                setRouteSearchResults([])
              }
            }}
            fullWidth
          >
            <ToggleButton value="flight-number">Search by Flight Number</ToggleButton>
            <ToggleButton value="route">Search by Route</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Route Search Section */}
        {searchMode === 'route' && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" gutterBottom>
              Find Flights by Route
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Autocomplete
                  fullWidth
                  options={airports}
                  getOptionLabel={(option) => `${option.code} - ${option.city}`}
                  onChange={(_, value) => setOriginAirport(value)}
                  onInputChange={(_, value) => searchAirports(value)}
                  value={originAirport}
                  loading={loading}
                  disabled={flightDetailsLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Origin Airport"
                      required
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
                <Autocomplete
                  fullWidth
                  options={airports}
                  getOptionLabel={(option) => `${option.code} - ${option.city}`}
                  onChange={(_, value) => setDestinationAirport(value)}
                  onInputChange={(_, value) => searchAirports(value)}
                  value={destinationAirport}
                  loading={loading}
                  disabled={flightDetailsLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Destination Airport"
                      required
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
              </Stack>

              <DatePicker
                label="Flight Date"
                value={searchDate}
                onChange={(date) => date && setSearchDate(date)}
                disabled={flightDetailsLoading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />

              <Button
                variant="contained"
                onClick={handleSearchByRoute}
                disabled={flightDetailsLoading || !originAirport || !destinationAirport}
                endIcon={flightDetailsLoading ? <CircularProgress size={20} /> : null}
              >
                Search Flights
              </Button>
            </Stack>

            {/* Flight Results List */}
            {routeSearchResults.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Found {routeSearchResults.length} flights
                </Typography>
                <Stack spacing={1}>
                  {routeSearchResults.map((flight, index) => (
                    <Paper
                      key={flight.id || index}
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => handleSelectFlightFromResults(flight)}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2">
                            {flight.airline} {flight.flightNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {flight.departure.iata} → {flight.arrival.iata}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Departs: {new Date(flight.departure.scheduled).toLocaleString()} 
                            {flight.departure.terminal && ` (Terminal ${flight.departure.terminal})`}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Arrives: {new Date(flight.arrival.scheduled).toLocaleString()}
                            {flight.arrival.terminal && ` (Terminal ${flight.arrival.terminal})`}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          {flight.durationMinutes > 0 && (
                            <Typography variant="body2" fontWeight="bold">
                              {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                            </Typography>
                          )}
                          {flight.stops === 0 && (
                            <Typography variant="caption" color="success.main">
                              Direct
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        {/* Trip Type Toggle */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Trip Type
          </Typography>
          <ToggleButtonGroup
            value={tripType}
            exclusive
            onChange={(_, value) => value && setTripType(value)}
            fullWidth
          >
            <ToggleButton value="one-way">One Way</ToggleButton>
            <ToggleButton value="round-trip">Round Trip</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Outbound Flight Section */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          {tripType === 'round-trip' ? 'Outbound Flight' : 'Flight Information'}
        </Typography>
        <Divider />

        {/* Flight Number Search (only show when in flight-number mode) */}
        {searchMode === 'flight-number' && (
          <>
            <TextField
              fullWidth
              required
              label="Flight Number"
              value={flightData.flightNumber}
              onChange={(e) => setFlightData({ ...flightData, flightNumber: e.target.value.toUpperCase() })}
          disabled={flightDetailsLoading}
          placeholder="e.g., LY973, AA100, BA178"
          helperText="Enter the flight number (airline code + number)"
        />

        <DatePicker
          label="Flight Date"
          value={flightData.departureDateTime}
          onChange={(date) => date && setFlightData({ ...flightData, departureDateTime: date })}
          disabled={flightDetailsLoading}
        />

        {/* Search Button */}
        <Button
          variant="outlined"
          onClick={handleSearchFlights}
          disabled={flightDetailsLoading || !flightData.flightNumber}
          endIcon={flightDetailsLoading ? <CircularProgress size={20} /> : null}
        >
          Search {tripType === 'round-trip' ? 'Outbound ' : ''}Flight
        </Button>

        {/* Return Flight Fields for Round Trip */}
        {tripType === 'round-trip' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">
              Return Flight
            </Typography>
            
            <TextField
              fullWidth
              required
              label="Return Flight Number"
              value={flightData.returnFlightNumber}
              onChange={(e) => setFlightData({ ...flightData, returnFlightNumber: e.target.value.toUpperCase() })}
              disabled={flightDetailsLoading}
              placeholder="e.g., LY974"
              helperText="Enter the return flight number"
            />

            <DatePicker
              label="Return Flight Date"
              value={flightData.returnDepartureDateTime}
              onChange={(date) => date && setFlightData({ ...flightData, returnDepartureDateTime: date })}
              disabled={flightDetailsLoading}
            />

            <TextField
              fullWidth
              label="Return Flight Price"
              type="number"
              value={flightData.returnPrice}
              onChange={(e) => setFlightData({ ...flightData, returnPrice: e.target.value })}
              disabled={flightDetailsLoading}
              placeholder="Optional"
            />

            <Button
              variant="outlined"
              onClick={handleSearchReturnFlight}
              disabled={flightDetailsLoading || !flightData.returnFlightNumber}
              endIcon={flightDetailsLoading ? <CircularProgress size={20} /> : null}
            >
              Search Return Flight
            </Button>

            {/* Return Flight Details Display */}
            {returnFlightDetails && (
              <>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    ✓ Return Flight Found
                  </Typography>
                  <Typography variant="body2">
                    <strong>{returnFlightDetails.airline} {flightData.returnFlightNumber}</strong>
                  </Typography>
                  <Typography variant="body2">
                    {returnFlightDetails.departureAirportCode} ({returnFlightDetails.departureCity}) → {returnFlightDetails.arrivalAirportCode} ({returnFlightDetails.arrivalCity})
                  </Typography>
                  <Typography variant="body2">
                    Departure: {returnFlightDetails.departureTimeLocal || new Date(returnFlightDetails.departureDateTime).toLocaleString()} (local time)
                  </Typography>
                  <Typography variant="body2">
                    Arrival: {returnFlightDetails.arrivalTimeLocal || new Date(returnFlightDetails.arrivalDateTime).toLocaleString()} (local time)
                  </Typography>
                  {returnFlightDetails.aircraft && (
                    <Typography variant="body2">
                      Aircraft: {returnFlightDetails.aircraft}
                    </Typography>
                  )}
                  {flightData.returnDuration > 0 && (
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Duration: {Math.floor(flightData.returnDuration / 60)}h {flightData.returnDuration % 60}m
                    </Typography>
                  )}
                </Paper>

                {/* Return Flight Additional Details */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Return Flight Details
                  </Typography>
                  
                  <TextField
                    fullWidth
                    type="number"
                    label="Return Flight Price"
                    value={flightData.returnPrice}
                    onChange={(e) => setFlightData({ ...flightData, returnPrice: e.target.value })}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: '$'
                    }}
                  />

                  <FormGroup row sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={flightData.returnCarryOnTrolley}
                          onChange={(e) => setFlightData({ ...flightData, returnCarryOnTrolley: e.target.checked })}
                        />
                      }
                      label="Carry-on Trolley"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={flightData.returnCheckedBaggage}
                          onChange={(e) => setFlightData({ ...flightData, returnCheckedBaggage: e.target.checked })}
                        />
                      }
                      label="Checked Baggage"
                    />
                  </FormGroup>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Departure Terminal"
                      value={flightData.returnDepartureTerminal}
                      onChange={(e) => setFlightData({ ...flightData, returnDepartureTerminal: e.target.value })}
                      placeholder={returnFlightDetails.terminal?.departure || 'e.g., T1, Terminal 3'}
                    />
                    <TextField
                      fullWidth
                      label="Arrival Terminal"
                      value={flightData.returnArrivalTerminal}
                      onChange={(e) => setFlightData({ ...flightData, returnArrivalTerminal: e.target.value })}
                      placeholder={returnFlightDetails.terminal?.arrival || 'e.g., T2, Terminal 1'}
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="Return Flight Booking Number (if different)"
                    value={flightData.returnBookingNumber}
                    onChange={(e) => setFlightData({ ...flightData, returnBookingNumber: e.target.value })}
                    sx={{ mt: 2 }}
                    placeholder="Leave empty to use same as outbound"
                  />
                </Box>
              </>
            )}
          </>
        )}
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Manual Flight Details Form */}
        <Typography variant="h6">Outbound Flight Details</Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            required
            label="Airline"
            value={flightData.airline}
            onChange={(e) => setFlightData({ ...flightData, airline: e.target.value })}
            disabled={flightDetailsLoading}
          />
          <TextField
            fullWidth
            required
            label="Flight Number"
            value={flightData.flightNumber}
            onChange={(e) => setFlightData({ ...flightData, flightNumber: e.target.value.toUpperCase() })}
            disabled={flightDetailsLoading}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Autocomplete
            fullWidth
            options={airports}
            getOptionLabel={(option) => `${option.code} - ${option.city}`}
            onChange={(_, value) => setDepartureAirport(value)}
            onInputChange={(_, value) => searchAirports(value)}
            value={departureAirport}
            loading={loading}
            disabled={flightDetailsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="From"
                required
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
          <Autocomplete
            fullWidth
            options={airports}
            getOptionLabel={(option) => `${option.code} - ${option.city}`}
            onChange={(_, value) => setArrivalAirport(value)}
            onInputChange={(_, value) => searchAirports(value)}
            value={arrivalAirport}
            loading={loading}
            disabled={flightDetailsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="To"
                required
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
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box sx={{ width: '100%' }}>
            {flightData.departureTimeLocal ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Departure
                </Typography>
                <Typography variant="h6" color="primary">
                  🛫 {flightData.departureTimeLocal.split('+')[0].split('T').join(' ')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {departureAirport?.city || 'Departure Airport'} Local Time
                </Typography>
              </Paper>
            ) : (
              <TextField
                fullWidth
                label="Departure Date & Time"
                placeholder="Search flight to auto-fill"
                disabled
                helperText="Will be filled automatically when you search for a flight"
              />
            )}
          </Box>
          <Box sx={{ width: '100%' }}>
            {flightData.arrivalTimeLocal ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Arrival
                </Typography>
                <Typography variant="h6" color="primary">
                  ✈️ {flightData.arrivalTimeLocal.split('+')[0].split('T').join(' ')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {arrivalAirport?.city || 'Arrival Airport'} Local Time
                </Typography>
              </Paper>
            ) : (
              <TextField
                fullWidth
                label="Arrival Date & Time"
                placeholder="Search flight to auto-fill"
                disabled
                helperText="Will be filled automatically when you search for a flight"
              />
            )}
          </Box>
        </Stack>

        {/* Flight Duration Display */}
        {flightData.duration > 0 && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.light' }}>
            <Typography variant="subtitle2" color="info.dark">
              Flight Duration: {Math.floor(flightData.duration / 60)}h {flightData.duration % 60}m
            </Typography>
          </Paper>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            type="number"
            label="Price (Flight Cost)"
            value={flightData.price}
            onChange={(e) => setFlightData({ ...flightData, price: e.target.value })}
            disabled={flightDetailsLoading}
            InputProps={{
              startAdornment: '$'
            }}
          />
          <TextField
            fullWidth
            type="number"
            label="Number of Layovers"
            value={flightData.layovers}
            onChange={(e) => setFlightData({ ...flightData, layovers: e.target.value })}
            disabled={flightDetailsLoading}
            inputProps={{ min: 0, max: 5 }}
          />
        </Stack>

        {/* Baggage Information */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Baggage
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={flightData.carryOnTrolley}
                  onChange={(e) => setFlightData({ ...flightData, carryOnTrolley: e.target.checked })}
                  disabled={flightDetailsLoading}
                />
              }
              label="Carry-on Trolley"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={flightData.checkedBaggage}
                  onChange={(e) => setFlightData({ ...flightData, checkedBaggage: e.target.checked })}
                  disabled={flightDetailsLoading}
                />
              }
              label="Checked Baggage"
            />
          </FormGroup>
        </Box>

        {/* Terminal and Gate Information */}
        {/* Terminal Information */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Departure Terminal"
            value={flightData.departureTerminal}
            onChange={(e) => setFlightData({ ...flightData, departureTerminal: e.target.value })}
            disabled={flightDetailsLoading}
            placeholder="e.g., T1, Terminal 3"
          />
          <TextField
            fullWidth
            label="Arrival Terminal"
            value={flightData.arrivalTerminal}
            onChange={(e) => setFlightData({ ...flightData, arrivalTerminal: e.target.value })}
            disabled={flightDetailsLoading}
            placeholder="e.g., T2, Terminal 1"
          />
        </Stack>

        {/* Booking Information */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Booking Details (Optional)
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Booking Number (PNR)"
              value={flightData.bookingNumber}
              onChange={(e) => setFlightData({ ...flightData, bookingNumber: e.target.value })}
              disabled={flightDetailsLoading}
              placeholder="e.g., ABC123"
            />
            <TextField
              fullWidth
              label="Booking Company/Agency"
              value={flightData.bookingCompany}
              onChange={(e) => setFlightData({ ...flightData, bookingCompany: e.target.value })}
              disabled={flightDetailsLoading}
              placeholder="e.g., Expedia, Booking.com"
            />
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} disabled={flightDetailsLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={flightDetailsLoading || !departureAirport || !arrivalAirport || !flightData.airline || !flightData.flightNumber}
          endIcon={flightDetailsLoading ? <CircularProgress size={20} /> : null}
        >
          Add Flight
        </Button>
      </Box>
    </Box>
  )
}