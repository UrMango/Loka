import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTrip, GOOGLE_MAPS_API_KEY } from '../services/api'
import type { Trip } from '../types/domain'
import { groupTripByDay } from '../types/domain'
import { AddFlightForm, AddHotelForm, AddRideForm, AddAttractionForm } from '../components/AddItemForms'
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline, DirectionsService, DirectionsRenderer } from '@react-google-maps/api'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Divider,
  Collapse,
  CardActionArea
} from '@mui/material'
import {
  ArrowBack,
  Add,
  Flight as FlightIcon,
  Hotel as HotelIcon,
  DirectionsCar,
  AttractionsOutlined,
  CalendarMonth,
  Close,
  AccessTime,
  ViewList,
  Timeline as TimelineIcon,
  Map as MapIcon,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'

type FilterCategory = 'all' | 'flights' | 'hotels' | 'rides' | 'attractions'
type ViewMode = 'list' | 'timeline' | 'map'

// Small embedded map component for ride routes
function RideMapEmbed({ ride }: { ride: any }) {
  const [directions, setDirections] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const mapContainerStyle = {
    width: '100%',
    height: '250px',
    borderRadius: '8px'
  }

  const directionsCallback = (result: any, status: any) => {
    if (status === 'OK' && result) {
      setDirections(result)
      setError(null)
    } else {
      setError(`Unable to calculate route: ${status}`)
    }
  }

  const onLoad = () => {
    setIsLoaded(true)
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Google Maps API key is not configured.
      </Alert>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} onLoad={onLoad}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: 0, lng: 0 }}
          zoom={13}
        >
          {isLoaded && !directions && ride.pickup && ride.dropoff && (
            <DirectionsService
              options={{
                origin: ride.pickup,
                destination: ride.dropoff,
                travelMode: window.google?.maps?.TravelMode?.DRIVING || 'DRIVING' as any,
              }}
              callback={directionsCallback}
            />
          )}
          {directions && (
            <DirectionsRenderer
              options={{
                directions: directions,
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      
      {directions && (
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Chip 
            size="small" 
            label={`Distance: ${directions.routes[0]?.legs[0]?.distance?.text}`}
            variant="outlined"
          />
          <Chip 
            size="small" 
            label={`Duration: ${directions.routes[0]?.legs[0]?.duration?.text}`}
            variant="outlined"
          />
        </Stack>
      )}
    </Box>
  )
}

// Map component to display trip locations
function TripMapView({ trip }: { trip: Trip }) {
  const [selectedMarker, setSelectedMarker] = useState<any>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 })
  const [mapZoom, setMapZoom] = useState(4)

  useEffect(() => {
    // Calculate center based on hotels and attractions
    const locations: { lat: number; lng: number }[] = []
    
    // For now, we'll use a default center
    // In a real implementation, you'd geocode hotel addresses
    if (trip.hotels.length > 0 || trip.attractions.length > 0) {
      // Default to a world view, or you could geocode the destinations
      setMapCenter({ lat: 20, lng: 0 })
      setMapZoom(2)
    }
  }, [trip])

  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  }

  // Collect all markers
  const markers: Array<{ id: string; position: { lat: number; lng: number }; type: string; data: any }> = []
  
  // Note: Hotels and attractions need geocoding to show on map
  // This is a placeholder implementation

  return (
    <Card>
      <CardContent>
        {!GOOGLE_MAPS_API_KEY ? (
          <Alert severity="warning">
            Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.
          </Alert>
        ) : (
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={mapZoom}
            >
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  onClick={() => setSelectedMarker(marker)}
                />
              ))}
              
              {selectedMarker && (
                <InfoWindow
                  position={selectedMarker.position}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {selectedMarker.data.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedMarker.type}
                    </Typography>
                  </Box>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        )}
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Map Integration Status
          </Typography>
          <Typography variant="caption" display="block">
            ✅ Google Maps API configured ({GOOGLE_MAPS_API_KEY ? 'Key found' : 'Key missing'})
          </Typography>
          <Typography variant="caption" display="block">
            ⚠️ Hotel and attraction locations need geocoding to display on the map
          </Typography>
          <Typography variant="caption" display="block">
            📍 To show locations, addresses need to be converted to latitude/longitude coordinates
          </Typography>
        </Alert>
        
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>Your Trip Data:</Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • {trip.hotels.length} hotels
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • {trip.attractions.length} attractions
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • {trip.flights.length} flights
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • {trip.rides.length} rides
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function TripDetails() {
  const { id } = useParams<{ id: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [expandedItem, setExpandedItem] = useState<{ type: string; index: number } | null>(null)

  useEffect(() => {
    if (id) getTrip(id).then(setTrip).catch(e => setError(e.message))
  }, [id])

  if (error) return <Alert severity="error">{error}</Alert>
  if (!trip) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>

  const buckets = groupTripByDay(trip)
  const totalCost = [
    ...trip.flights.map(f => f.cost || 0),
    ...trip.hotels.map(h => h.cost || 0),
    ...trip.rides.map(r => r.cost || 0),
    ...trip.attractions.map(a => a.cost || 0),
  ].reduce((a, b) => a + b, 0)

  // Filter helper function
  const shouldShowCategory = (category: string) => {
    return filter === 'all' || filter === category
  }

  // Filter days to show filtered items for each category
  // Keep all days in the range, even if empty
  const filteredBuckets = buckets.map(day => ({
    ...day,
    flights: shouldShowCategory('flights') ? day.flights : [],
    hotels: shouldShowCategory('hotels') ? day.hotels : [],
    rides: shouldShowCategory('rides') ? day.rides : [],
    attractions: shouldShowCategory('attractions') ? day.attractions : []
  }))

  return (
    <Box>
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(21, 101, 192, 1) 100%)'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ 
              color: 'white', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Back to Trips
          </Button>
        </Stack>
        
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {trip.name}
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
          <Chip 
            icon={<CalendarMonth sx={{ color: 'white !important' }} />} 
            label={`${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
          {trip.destinations?.length > 0 && (
            <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}>
              📍 {trip.destinations.join(', ')}
            </Typography>
          )}
        </Stack>

        {/* Trip Summary Stats */}
        <Stack direction="row" spacing={4} mt={3} flexWrap="wrap">
          {trip.flights?.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <FlightIcon />
              <Typography variant="h6" fontWeight={600}>
                {trip.flights.length} {trip.flights.length === 1 ? 'Flight' : 'Flights'}
              </Typography>
            </Stack>
          )}
          {trip.hotels?.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <HotelIcon />
              <Typography variant="h6" fontWeight={600}>
                {trip.hotels.length} {trip.hotels.length === 1 ? 'Hotel' : 'Hotels'}
              </Typography>
            </Stack>
          )}
          {trip.rides?.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <DirectionsCar />
              <Typography variant="h6" fontWeight={600}>
                {trip.rides.length} {trip.rides.length === 1 ? 'Ride' : 'Rides'}
              </Typography>
            </Stack>
          )}
          {trip.attractions?.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <AttractionsOutlined />
              <Typography variant="h6" fontWeight={600}>
                {trip.attractions.length} {trip.attractions.length === 1 ? 'Attraction' : 'Attractions'}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Action Bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <AddItemModalLauncher trip={trip} onUpdated={setTrip} />
        
        <Stack direction="row" spacing={2} alignItems="center">
          {/* View Mode Toggle */}
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row">
              <Button
                size="small"
                startIcon={<ViewList />}
                onClick={() => setViewMode('list')}
                sx={{
                  borderRadius: 0,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: viewMode === 'list' ? 'primary.dark' : 'action.hover'
                  }
                }}
              >
                List
              </Button>
              <Button
                size="small"
                startIcon={<TimelineIcon />}
                onClick={() => setViewMode('timeline')}
                sx={{
                  borderRadius: 0,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  bgcolor: viewMode === 'timeline' ? 'primary.main' : 'transparent',
                  color: viewMode === 'timeline' ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: viewMode === 'timeline' ? 'primary.dark' : 'action.hover'
                  }
                }}
              >
                Timeline
              </Button>
              <Button
                size="small"
                startIcon={<MapIcon />}
                onClick={() => setViewMode('map')}
                sx={{
                  borderRadius: 0,
                  bgcolor: viewMode === 'map' ? 'primary.main' : 'transparent',
                  color: viewMode === 'map' ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: viewMode === 'map' ? 'primary.dark' : 'action.hover'
                  }
                }}
              >
                Map
              </Button>
            </Stack>
          </Paper>

          {totalCost > 0 && (
            <Paper 
              elevation={0}
              sx={{ 
                px: 3, 
                py: 1.5, 
                bgcolor: 'success.lighter',
                border: '2px solid',
                borderColor: 'success.main',
                borderRadius: 2
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Total Budget
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    ${totalCost.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Stack>

      {/* Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={filter}
          onChange={(_, newValue) => setFilter(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 64 }
          }}
        >
          <Tab 
            value="all" 
            label="All" 
            icon={<CalendarMonth />}
            iconPosition="start"
          />
          <Tab 
            value="flights" 
            label={`Flights (${trip.flights.length})`}
            icon={<FlightIcon />}
            iconPosition="start"
          />
          <Tab 
            value="hotels" 
            label={`Hotels (${trip.hotels.length})`}
            icon={<HotelIcon />}
            iconPosition="start"
          />
          <Tab 
            value="rides" 
            label={`Rides (${trip.rides.length})`}
            icon={<DirectionsCar />}
            iconPosition="start"
          />
          <Tab 
            value="attractions" 
            label={`Attractions (${trip.attractions.length})`}
            icon={<AttractionsOutlined />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <Stack spacing={2}>
          {/* Show message if filtering and no items of that type exist */}
          {filter !== 'all' && 
          trip.flights.length === 0 && filter === 'flights' && (
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                <FlightIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No flights found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No flights have been added to this trip yet.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
        {filter !== 'all' && 
          trip.hotels.length === 0 && filter === 'hotels' && (
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                <HotelIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hotels found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No hotels have been added to this trip yet.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
        {filter !== 'all' && 
          trip.rides.length === 0 && filter === 'rides' && (
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                <DirectionsCar sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No rides found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No rides have been added to this trip yet.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
        {filter !== 'all' && 
          trip.attractions.length === 0 && filter === 'attractions' && (
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                <AttractionsOutlined sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No attractions found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No attractions have been added to this trip yet.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
        
        {filteredBuckets.map((day, index) => {
          const dayNumber = index + 1;
          const [year, month, dayOfMonth] = day.date.split('-');
          const formattedDate = `${dayOfMonth}-${month}-${year}`;
          
          return (
            <Card key={day.date}>
              <CardContent sx={{ bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">
                  DAY {dayNumber} - {formattedDate}
                </Typography>
              </CardContent>
            <CardContent>
              <Stack spacing={2}>
                {day.flights.length > 0 && (
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <FlightIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Flights
                      </Typography>
                    </Stack>
                    {day.flights.map((f, i) => {
                      const isExpanded = expandedItem?.type === 'flight' && expandedItem?.index === i;
                      return (
                        <Paper key={i} variant="outlined" sx={{ mb: 1, overflow: 'hidden' }}>
                          <CardActionArea
                            onClick={() => setExpandedItem(isExpanded ? null : { type: 'flight', index: i })}
                            sx={{ p: 1.5 }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="body2">
                                  <strong>{f.flightNumber}</strong> {f.departureAirportCode}→{f.arrivalAirportCode}
                                </Typography>
                                <Stack direction="row" spacing={2} mt={0.5}>
                                  <Chip icon={<AccessTime />} size="small" label={`${f.departureDateTime.slice(11, 16)} - ${f.arrivalDateTime.slice(11, 16)}`} />
                                  {f.cost && <Chip size="small" label={`$${f.cost}`} color="success" />}
                                </Stack>
                              </Box>
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </Stack>
                          </CardActionArea>
                          <Collapse in={isExpanded}>
                            <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
                              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                <strong>Flight Details</strong>
                              </Typography>
                              {f.terminal?.departure && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Departure Terminal: {f.terminal.departure}
                                </Typography>
                              )}
                              {f.gate?.departure && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Departure Gate: {f.gate.departure}
                                </Typography>
                              )}
                              {f.terminal?.arrival && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Arrival Terminal: {f.terminal.arrival}
                                </Typography>
                              )}
                              {f.gate?.arrival && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Arrival Gate: {f.gate.arrival}
                                </Typography>
                              )}
                              {f.durationMinutes && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Duration: {Math.floor(f.durationMinutes / 60)}h {f.durationMinutes % 60}m
                                </Typography>
                              )}
                              {f.aircraftType && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Aircraft: {f.aircraftType}
                                </Typography>
                              )}
                              {(f.bookingNumber || f.bookingAgency || f.carryOn !== undefined || f.checkedBag !== undefined) && (
                                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                  <strong>Booking Info</strong>
                                </Typography>
                              )}
                              {f.bookingNumber && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Booking Number: {f.bookingNumber}
                                </Typography>
                              )}
                              {f.bookingAgency && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Agency: {f.bookingAgency}
                                </Typography>
                              )}
                              {f.carryOn !== undefined && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Carry-on: {f.carryOn ? 'Included' : 'Not included'}
                                </Typography>
                              )}
                              {f.checkedBag !== undefined && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Checked Bag: {f.checkedBag ? 'Included' : 'Not included'}
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
                {day.hotels.length > 0 && (
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <HotelIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Hotels
                      </Typography>
                    </Stack>
                    {day.hotels.map((h, i) => {
                      const isExpanded = expandedItem?.type === 'hotel' && expandedItem?.index === i;
                      return (
                        <Paper key={i} variant="outlined" sx={{ mb: 1, overflow: 'hidden' }}>
                          <CardActionArea
                            onClick={() => setExpandedItem(isExpanded ? null : { type: 'hotel', index: i })}
                            sx={{ p: 1.5 }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="body2">
                                  <strong>{h.name}</strong>
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Check-in: {h.checkIn}
                                </Typography>
                                {h.cost && <Chip size="small" label={`$${h.cost}`} color="success" sx={{ mt: 0.5 }} />}
                              </Box>
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </Stack>
                          </CardActionArea>
                          <Collapse in={isExpanded}>
                            <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
                              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                <strong>Hotel Details</strong>
                              </Typography>
                              {h.address && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Address: {h.address}
                                </Typography>
                              )}
                              {h.checkOut && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Check-out: {h.checkOut}
                                </Typography>
                              )}
                              {h.nights && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Nights: {h.nights}
                                </Typography>
                              )}
                              {h.rating && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Rating: {h.rating} ⭐
                                </Typography>
                              )}
                              {h.distanceFromAirport && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Distance from airport: {h.distanceFromAirport}
                                </Typography>
                              )}
                              {h.travelTimeFromAirport && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Travel time from airport: {h.travelTimeFromAirport}
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
                {day.rides.length > 0 && (
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <DirectionsCar fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Transportation
                      </Typography>
                    </Stack>
                    {day.rides.map((r: any, i) => {
                      const isExpanded = expandedItem?.type === 'ride' && expandedItem?.index === i;
                      return (
                        <Paper key={i} variant="outlined" sx={{ mb: 1, overflow: 'hidden' }}>
                          <CardActionArea
                            onClick={() => setExpandedItem(isExpanded ? null : { type: 'ride', index: i })}
                            sx={{ p: 1.5 }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box flex={1}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={0.5} flexWrap="wrap">
                                  <Chip 
                                    label={r.type === 'rental' ? '🚗 Car Rental' : '🚕 Taxi/Ride'} 
                                    size="small" 
                                    color={r.type === 'rental' ? 'primary' : 'secondary'}
                                  />
                                  {r.time && <Chip icon={<AccessTime />} size="small" label={r.time} />}
                                  {r.cost && <Chip size="small" label={`$${r.cost}`} color="success" />}
                                </Stack>
                                <Typography variant="body2" fontWeight="medium">
                                  {r.pickup} → {r.dropoff}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {r.distance && `${r.distance} • `}{r.duration || ''}
                                </Typography>
                              </Box>
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </Stack>
                          </CardActionArea>
                          <Collapse in={isExpanded}>
                            <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
                              {r.type === 'rental' && (
                                <>
                                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                    <strong>Rental Details</strong>
                                  </Typography>
                                  {r.rentalCompany && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Company: {r.rentalCompany}
                                    </Typography>
                                  )}
                                  {r.voucherNumber && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Voucher: {r.voucherNumber}
                                    </Typography>
                                  )}
                                  {r.pickupDate && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Pickup Date: {r.pickupDate}
                                    </Typography>
                                  )}
                                  {r.pickupTime && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Pickup Time: {r.pickupTime}
                                    </Typography>
                                  )}
                                  {r.returnDate && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Return Date: {r.returnDate}
                                    </Typography>
                                  )}
                                  {r.returnTime && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Return Time: {r.returnTime}
                                    </Typography>
                                  )}
                                  {r.returnLocation && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Return Location: {r.returnLocation}
                                    </Typography>
                                  )}
                                </>
                              )}
                              {r.type === 'taxi' && r.notes && (
                                <>
                                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                    <strong>Additional Info</strong>
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Notes: {r.notes}
                                  </Typography>
                                </>
                              )}
                              {r.mode && (
                                <Typography variant="caption" color="text.secondary" display="block" mt={r.type === 'rental' || r.notes ? 1 : 0}>
                                  Mode: {r.mode}
                                </Typography>
                              )}
                              <RideMapEmbed ride={r} />
                            </Box>
                          </Collapse>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
                {day.attractions.length > 0 && (
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <AttractionsOutlined fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Attractions
                      </Typography>
                    </Stack>
                    {day.attractions.map((a, i) => {
                      const isExpanded = expandedItem?.type === 'attraction' && expandedItem?.index === i;
                      return (
                        <Paper key={i} variant="outlined" sx={{ mb: 1, overflow: 'hidden' }}>
                          <CardActionArea
                            onClick={() => setExpandedItem(isExpanded ? null : { type: 'attraction', index: i })}
                            sx={{ p: 1.5 }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="body2">
                                  <strong>{a.name}</strong>
                                </Typography>
                                <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                                  {a.scheduledTime && (
                                    <Chip icon={<AccessTime />} size="small" label={a.scheduledTime} />
                                  )}
                                  {a.cost && <Chip size="small" label={`$${a.cost}`} color="success" />}
                                </Stack>
                              </Box>
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </Stack>
                          </CardActionArea>
                          <Collapse in={isExpanded}>
                            <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
                              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                <strong>Attraction Details</strong>
                              </Typography>
                              {a.address && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Address: {a.address}
                                </Typography>
                              )}
                              {a.rating && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Rating: {a.rating} ⭐
                                </Typography>
                              )}
                              {a.website && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Website: <a href={a.website} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{a.website}</a>
                                </Typography>
                              )}
                              {a.scheduledDate && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Scheduled: {a.scheduledDate} {a.scheduledTime && `at ${a.scheduledTime}`}
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
                {day.flights.length === 0 &&
                  day.hotels.length === 0 &&
                  day.rides.length === 0 &&
                  day.attractions.length === 0 && (
                    <Box sx={{ py: 2, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary" fontStyle="italic">
                        No activity
                      </Typography>
                    </Box>
                  )}
              </Stack>
            </CardContent>
          </Card>
          );
        })}
        </Stack>
      )}

      {/* TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <Box>
          {filteredBuckets.map((day, dayIndex) => {
            const dayNumber = dayIndex + 1;
            const [year, month, dayOfMonth] = day.date.split('-');
            const formattedDate = `${dayOfMonth}-${month}-${year}`;
            const allItems = [
              ...day.flights.map((f, i) => ({ type: 'flight', data: f, time: f.departureDateTime.slice(11, 16), originalIndex: i })),
              ...day.hotels.map((h, i) => ({ type: 'hotel', data: h, time: 'Check-in', originalIndex: i })),
              ...day.rides.map((r, i) => ({ type: 'ride', data: r, time: r.time || r.pickupTime || '', originalIndex: i })),
              ...day.attractions.map((a, i) => ({ type: 'attraction', data: a, time: a.scheduledTime || '', originalIndex: i }))
            ];

            if (allItems.length === 0 && filter === 'all') {
              return (
                <Card key={day.date} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      DAY {dayNumber} - {formattedDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ textAlign: 'center', py: 2 }}>
                      No activity
                    </Typography>
                  </CardContent>
                </Card>
              );
            }

            if (allItems.length === 0) return null;

            return (
              <Card key={day.date} sx={{ mb: 2 }}>
                <CardContent sx={{ bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={600}>
                    DAY {dayNumber} - {formattedDate}
                  </Typography>
                </CardContent>
                <CardContent>
                  <Box sx={{ position: 'relative', pl: 4 }}>
                    {/* Vertical Line */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 15,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        bgcolor: 'divider'
                      }}
                    />
                    
                    <Stack spacing={3}>
                      {allItems.map((item, idx) => {
                        const isExpanded = expandedItem?.type === item.type && expandedItem?.index === item.originalIndex;
                        return (
                          <Box key={idx} sx={{ position: 'relative' }}>
                            {/* Timeline Dot */}
                            <Box
                              sx={{
                                position: 'absolute',
                                left: -27,
                                top: 4,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: item.type === 'flight' ? 'primary.main' : 
                                         item.type === 'hotel' ? 'secondary.main' :
                                         item.type === 'ride' ? 'info.main' : 'success.main',
                                border: '3px solid white',
                                boxShadow: 1
                              }}
                            />
                            
                            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                              <CardActionArea
                                onClick={() => setExpandedItem(isExpanded ? null : { type: item.type, index: item.originalIndex })}
                                sx={{ p: 2 }}
                              >
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                      {item.type === 'flight' && <FlightIcon fontSize="small" color="primary" />}
                                      {item.type === 'hotel' && <HotelIcon fontSize="small" color="secondary" />}
                                      {item.type === 'ride' && <DirectionsCar fontSize="small" color="info" />}
                                      {item.type === 'attraction' && <AttractionsOutlined fontSize="small" color="success" />}
                                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        {item.type.toUpperCase()}
                                      </Typography>
                                    </Stack>
                                    
                                    {item.type === 'flight' && (
                                      <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                          {(item.data as any).flightNumber} {(item.data as any).departureAirportCode}→{(item.data as any).arrivalAirportCode}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {(item.data as any).departureDateTime.slice(11, 16)} - {(item.data as any).arrivalDateTime.slice(11, 16)}
                                        </Typography>
                                      </Box>
                                    )}
                                    
                                    {item.type === 'hotel' && (
                                      <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                          {(item.data as any).name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Check-in: {(item.data as any).checkIn}
                                        </Typography>
                                      </Box>
                                    )}
                                    
                                    {item.type === 'ride' && (
                                      <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                          {(item.data as any).pickup} → {(item.data as any).dropoff}
                                        </Typography>
                                        {(item.data as any).distance && (
                                          <Typography variant="body2" color="text.secondary">
                                            {(item.data as any).distance} • {(item.data as any).duration}
                                          </Typography>
                                        )}
                                      </Box>
                                    )}
                                    
                                    {item.type === 'attraction' && (
                                      <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                          {(item.data as any).name}
                                        </Typography>
                                        {(item.data as any).scheduledTime && (
                                          <Typography variant="body2" color="text.secondary">
                                            {(item.data as any).scheduledTime}
                                          </Typography>
                                        )}
                                      </Box>
                                    )}
                                    
                                    {item.data.cost && (
                                      <Chip size="small" label={`$${item.data.cost}`} color="success" sx={{ mt: 1 }} />
                                    )}
                                  </Box>
                                  
                                  <Stack spacing={1} alignItems="flex-end">
                                    {item.time && (
                                      <Chip size="small" label={item.time} variant="outlined" />
                                    )}
                                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                  </Stack>
                                </Stack>
                              </CardActionArea>
                              
                              <Collapse in={isExpanded}>
                                <Box sx={{ px: 2, pb: 2, pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
                                  {item.type === 'flight' && (
                                    <>
                                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                        <strong>Flight Details</strong>
                                      </Typography>
                                      {(item.data as any).terminal?.departure && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Departure Terminal: {(item.data as any).terminal.departure}
                                        </Typography>
                                      )}
                                      {(item.data as any).gate?.departure && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Departure Gate: {(item.data as any).gate.departure}
                                        </Typography>
                                      )}
                                      {(item.data as any).terminal?.arrival && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Arrival Terminal: {(item.data as any).terminal.arrival}
                                        </Typography>
                                      )}
                                      {(item.data as any).gate?.arrival && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Arrival Gate: {(item.data as any).gate.arrival}
                                        </Typography>
                                      )}
                                      {(item.data as any).durationMinutes && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Duration: {Math.floor((item.data as any).durationMinutes / 60)}h {(item.data as any).durationMinutes % 60}m
                                        </Typography>
                                      )}
                                      {(item.data as any).aircraftType && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Aircraft: {(item.data as any).aircraftType}
                                        </Typography>
                                      )}
                                      {((item.data as any).bookingNumber || (item.data as any).bookingAgency) && (
                                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                          <strong>Booking Info</strong>
                                        </Typography>
                                      )}
                                      {(item.data as any).bookingNumber && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Booking Number: {(item.data as any).bookingNumber}
                                        </Typography>
                                      )}
                                      {(item.data as any).bookingAgency && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Agency: {(item.data as any).bookingAgency}
                                        </Typography>
                                      )}
                                      {(item.data as any).carryOn !== undefined && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Carry-on: {(item.data as any).carryOn ? 'Included' : 'Not included'}
                                        </Typography>
                                      )}
                                      {(item.data as any).checkedBag !== undefined && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Checked Bag: {(item.data as any).checkedBag ? 'Included' : 'Not included'}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  
                                  {item.type === 'hotel' && (
                                    <>
                                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                        <strong>Hotel Details</strong>
                                      </Typography>
                                      {(item.data as any).address && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Address: {(item.data as any).address}
                                        </Typography>
                                      )}
                                      {(item.data as any).checkOut && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Check-out: {(item.data as any).checkOut}
                                        </Typography>
                                      )}
                                      {(item.data as any).nights && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Nights: {(item.data as any).nights}
                                        </Typography>
                                      )}
                                      {(item.data as any).rating && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Rating: {(item.data as any).rating} ⭐
                                        </Typography>
                                      )}
                                      {(item.data as any).distanceFromAirport && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Distance from airport: {(item.data as any).distanceFromAirport}
                                        </Typography>
                                      )}
                                      {(item.data as any).travelTimeFromAirport && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Travel time from airport: {(item.data as any).travelTimeFromAirport}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  
                                  {item.type === 'ride' && (
                                    <>
                                      {(item.data as any).type === 'rental' && (
                                        <>
                                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                            <strong>Rental Details</strong>
                                          </Typography>
                                          {(item.data as any).rentalCompany && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              Company: {(item.data as any).rentalCompany}
                                            </Typography>
                                          )}
                                          {(item.data as any).voucherNumber && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              Voucher: {(item.data as any).voucherNumber}
                                            </Typography>
                                          )}
                                          {(item.data as any).pickupDate && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              Pickup Date: {(item.data as any).pickupDate}
                                            </Typography>
                                          )}
                                          {(item.data as any).returnDate && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              Return Date: {(item.data as any).returnDate}
                                            </Typography>
                                          )}
                                        </>
                                      )}
                                      {(item.data as any).type === 'taxi' && (item.data as any).notes && (
                                        <>
                                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                            <strong>Additional Info</strong>
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary" display="block">
                                            Notes: {(item.data as any).notes}
                                          </Typography>
                                        </>
                                      )}
                                      <RideMapEmbed ride={item.data} />
                                    </>
                                  )}
                                  
                                  {item.type === 'attraction' && (
                                    <>
                                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                        <strong>Attraction Details</strong>
                                      </Typography>
                                      {(item.data as any).address && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Address: {(item.data as any).address}
                                        </Typography>
                                      )}
                                      {(item.data as any).rating && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Rating: {(item.data as any).rating} ⭐
                                        </Typography>
                                      )}
                                      {(item.data as any).website && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Website: <a href={(item.data as any).website} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{(item.data as any).website}</a>
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                </Box>
                              </Collapse>
                            </Paper>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* MAP VIEW */}
      {viewMode === 'map' && (
        <TripMapView trip={trip} />
      )}
    </Box>
  )
}

function AddItemModalLauncher({ trip, onUpdated }: { trip: Trip; onUpdated: (t: Trip) => void }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState(0)

  const handleClose = () => setOpen(false)

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        size="large"
      >
        Add Item
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add Item to {trip.name}</Typography>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tab icon={<FlightIcon />} label="Flight" />
          <Tab icon={<HotelIcon />} label="Hotel" />
          <Tab icon={<DirectionsCar />} label="Ride" />
          <Tab icon={<AttractionsOutlined />} label="Attraction" />
        </Tabs>
        <DialogContent sx={{ pt: 3 }}>
          {tab === 0 && (
            <AddFlightForm tripId={trip.id} onUpdated={onUpdated} onDone={handleClose} />
          )}
          {tab === 1 && (
            <AddHotelForm tripId={trip.id} onUpdated={onUpdated} onDone={handleClose} />
          )}
          {tab === 2 && (
            <AddRideForm tripId={trip.id} onUpdated={onUpdated} onDone={handleClose} />
          )}
          {tab === 3 && (
            <AddAttractionForm tripId={trip.id} onUpdated={onUpdated} onDone={handleClose} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
