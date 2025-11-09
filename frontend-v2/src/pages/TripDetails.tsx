import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTrip } from '../services/api'
import type { Trip } from '../types/domain'
import { groupTripByDay } from '../types/domain'
import { AddFlightForm, AddHotelForm, AddRideForm, AddAttractionForm } from '../components/AddItemForms'
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
  Divider
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
  AttachMoney
} from '@mui/icons-material'

type FilterCategory = 'all' | 'flights' | 'hotels' | 'rides' | 'attractions'

export default function TripDetails() {
  const { id } = useParams<{ id: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterCategory>('all')

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

  // Filter days to only show days with items in the selected category
  const filteredBuckets = buckets.map(day => ({
    ...day,
    flights: shouldShowCategory('flights') ? day.flights : [],
    hotels: shouldShowCategory('hotels') ? day.hotels : [],
    rides: shouldShowCategory('rides') ? day.rides : [],
    attractions: shouldShowCategory('attractions') ? day.attractions : []
  })).filter(day => 
    day.flights.length > 0 || 
    day.hotels.length > 0 || 
    day.rides.length > 0 || 
    day.attractions.length > 0
  )

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {trip.name}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip icon={<CalendarMonth />} label={`${trip.startDate} → ${trip.endDate}`} />
            {trip.destinations?.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {trip.destinations.join(', ')}
              </Typography>
            )}
          </Stack>
        </Box>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack />}
          variant="outlined"
        >
          Back
        </Button>
      </Stack>

      {/* Unified Add Item Button / Modal */}
      <Box mb={3}>
        <AddItemModalLauncher trip={trip} onUpdated={setTrip} />
      </Box>

      <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Total Cost</Typography>
            <Typography variant="h4" fontWeight="bold">
              ${totalCost.toFixed(2)}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

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

      <Stack spacing={2}>
        {filteredBuckets.length === 0 && (
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                {filter === 'flights' && <FlightIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />}
                {filter === 'hotels' && <HotelIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />}
                {filter === 'rides' && <DirectionsCar sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />}
                {filter === 'attractions' && <AttractionsOutlined sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />}
                {filter === 'all' && <CalendarMonth sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />}
                
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No {filter === 'all' ? 'items' : filter} found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filter === 'all' 
                    ? 'Start adding items to your trip using the button above.'
                    : `No ${filter} have been added to this trip yet.`
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
        
        {filteredBuckets.map((day) => (
          <Card key={day.date}>
            <CardContent sx={{ bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="bold">
                {day.date}
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
                    {day.flights.map((f, i) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{f.flightNumber}</strong> {f.departureAirportCode}→{f.arrivalAirportCode}
                        </Typography>
                        <Stack direction="row" spacing={2} mt={0.5}>
                          <Chip icon={<AccessTime />} size="small" label={`${f.departureDateTime.slice(11, 16)} - ${f.arrivalDateTime.slice(11, 16)}`} />
                          {f.cost && <Chip icon={<AttachMoney />} size="small" label={`$${f.cost}`} color="success" />}
                        </Stack>
                      </Paper>
                    ))}
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
                    {day.hotels.map((h, i) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{h.name}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Check-in: {h.checkIn}
                        </Typography>
                        {h.cost && <Chip icon={<AttachMoney />} size="small" label={`$${h.cost}`} color="success" sx={{ mt: 0.5 }} />}
                      </Paper>
                    ))}
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
                    {day.rides.map((r: any, i) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                          <Chip 
                            label={r.type === 'rental' ? '🚗 Car Rental' : '🚕 Taxi/Ride'} 
                            size="small" 
                            color={r.type === 'rental' ? 'primary' : 'secondary'}
                          />
                          {r.time && <Chip icon={<AccessTime />} size="small" label={r.time} />}
                        </Stack>
                        <Typography variant="body2" fontWeight="medium">
                          {r.pickup} → {r.dropoff}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {r.distance && `${r.distance} • `}{r.duration || ''}
                        </Typography>
                        
                        {r.type === 'rental' && (
                          <Box mt={1}>
                            {r.rentalCompany && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Company: <strong>{r.rentalCompany}</strong>
                              </Typography>
                            )}
                            {r.voucherNumber && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Voucher: {r.voucherNumber}
                              </Typography>
                            )}
                            {r.returnDate && r.returnTime && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Return: {r.returnDate} at {r.returnTime}
                              </Typography>
                            )}
                          </Box>
                        )}
                        
                        {r.type === 'taxi' && r.notes && (
                          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                            Notes: {r.notes}
                          </Typography>
                        )}
                        
                        {r.cost && <Chip icon={<AttachMoney />} size="small" label={`$${r.cost}`} color="success" sx={{ mt: 1 }} />}
                      </Paper>
                    ))}
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
                    {day.attractions.map((a, i) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{a.name}</strong>
                        </Typography>
                        {a.scheduledTime && (
                          <Chip icon={<AccessTime />} size="small" label={a.scheduledTime} sx={{ mt: 0.5 }} />
                        )}
                        {a.cost && <Chip icon={<AttachMoney />} size="small" label={`$${a.cost}`} color="success" sx={{ mt: 0.5, ml: 1 }} />}
                      </Paper>
                    ))}
                  </Box>
                )}
                {day.flights.length === 0 &&
                  day.hotels.length === 0 &&
                  day.rides.length === 0 &&
                  day.attractions.length === 0 && (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      No items for this day.
                    </Typography>
                  )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
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
