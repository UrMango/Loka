import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
} from '@mui/material'
import FlightIcon from '@mui/icons-material/Flight'
import HotelIcon from '@mui/icons-material/Hotel'
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi'
import AttractionsIcon from '@mui/icons-material/Attractions'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

interface TripReviewStepProps {
  tripData: any
}

export default function TripReviewStep({ tripData }: TripReviewStepProps) {
  const calculateTotalCost = () => {
    let total = 0
    
    // Flights
    tripData.flights.forEach((flight: any) => {
      total += flight.price || 0
    })
    
    // Hotels
    tripData.hotels.forEach((hotel: any) => {
      total += hotel.totalCost || 0
    })
    
    // Transportation
    tripData.transportation.forEach((transport: any) => {
      total += transport.cost || 0
    })
    
    // Attractions
    tripData.attractions.forEach((attraction: any) => {
      total += attraction.cost || 0
    })
    
    return total
  }

  const getDaysList = () => {
    if (!tripData.startDate || !tripData.endDate) return []
    
    const start = new Date(tripData.startDate)
    const end = new Date(tripData.endDate)
    const days = []
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }
    
    return days
  }

  const getItemsForDay = (date: Date) => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const items: any[] = []

    // Check flights
    tripData.flights.forEach((flight: any) => {
      const flightDate = new Date(flight.departureDateTime)
      if (flightDate >= dayStart && flightDate <= dayEnd) {
        items.push({ type: 'flight', data: flight, time: flightDate })
      }
    })

    // Check attractions
    tripData.attractions.forEach((attraction: any) => {
      const attractionDate = new Date(attraction.visitDate)
      if (attractionDate >= dayStart && attractionDate <= dayEnd) {
        items.push({ type: 'attraction', data: attraction, time: attractionDate })
      }
    })

    // Check transportation
    tripData.transportation.forEach((transport: any) => {
      const transportDate = new Date(transport.departureTime)
      if (transportDate >= dayStart && transportDate <= dayEnd) {
        items.push({ type: 'transportation', data: transport, time: transportDate })
      }
    })

    // Sort by time
    items.sort((a, b) => a.time.getTime() - b.time.getTime())

    return items
  }

  const days = getDaysList()
  const totalCost = calculateTotalCost()

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Trip
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review all the details of your trip before saving.
      </Typography>

      {/* Trip Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {tripData.name || 'Untitled Trip'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {tripData.startDate ? new Date(tripData.startDate).toLocaleDateString() : 'No start date'} - {tripData.endDate ? new Date(tripData.endDate).toLocaleDateString() : 'No end date'}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {tripData.departureLocation} → {tripData.arrivalLocation}
          </Typography>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6">
          Total Estimated Cost: ${totalCost.toFixed(2)}
        </Typography>
        <Box sx={{ mt: 1 }}>
          {tripData.flights.length > 0 && (
            <Typography variant="body2">
              Flights: ${tripData.flights.reduce((sum: number, f: any) => sum + (f.price || 0), 0).toFixed(2)}
            </Typography>
          )}
          {tripData.hotels.length > 0 && (
            <Typography variant="body2">
              Hotels: ${tripData.hotels.reduce((sum: number, h: any) => sum + (h.totalCost || 0), 0).toFixed(2)}
            </Typography>
          )}
          {tripData.transportation.length > 0 && (
            <Typography variant="body2">
              Transportation: ${tripData.transportation.reduce((sum: number, t: any) => sum + (t.cost || 0), 0).toFixed(2)}
            </Typography>
          )}
          {tripData.attractions.length > 0 && (
            <Typography variant="body2">
              Attractions: ${tripData.attractions.reduce((sum: number, a: any) => sum + (a.cost || 0), 0).toFixed(2)}
            </Typography>
          )}
        </Box>
      </Alert>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <FlightIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{tripData.flights.length}</Typography>
              <Typography variant="body2" color="text.secondary">Flights</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HotelIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{tripData.hotels.length}</Typography>
              <Typography variant="body2" color="text.secondary">Hotels</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalTaxiIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{tripData.transportation.length}</Typography>
              <Typography variant="body2" color="text.secondary">Transportation</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttractionsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{tripData.attractions.length}</Typography>
              <Typography variant="body2" color="text.secondary">Attractions</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Day-by-Day Itinerary */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Day-by-Day Itinerary
      </Typography>
      {days.map((day, index) => {
        const dayItems = getItemsForDay(day)
        
        return (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Day {index + 1} - {day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {dayItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No scheduled activities for this day
                </Typography>
              ) : (
                <Box>
                  {dayItems.map((item, itemIndex) => (
                    <Box key={itemIndex} sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box sx={{ minWidth: 80 }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        {item.type === 'flight' && (
                          <Box>
                            <Chip icon={<FlightIcon />} label="Flight" size="small" sx={{ mb: 0.5 }} />
                            <Typography variant="body1">
                              {item.data.airline} {item.data.flightNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.data.departureAirport?.code} → {item.data.arrivalAirport?.code} • ${item.data.price}
                            </Typography>
                          </Box>
                        )}
                        {item.type === 'transportation' && (
                          <Box>
                            <Chip icon={<LocalTaxiIcon />} label="Transportation" size="small" sx={{ mb: 0.5 }} />
                            <Typography variant="body1">
                              {item.data.type === 'taxi' ? 'Taxi / Ride' : 'Car Rental'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.data.from ? `${item.data.from} → ${item.data.to}` : item.data.provider} • ${item.data.cost}
                            </Typography>
                          </Box>
                        )}
                        {item.type === 'attraction' && (
                          <Box>
                            <Chip icon={<AttractionsIcon />} label={item.data.type} size="small" sx={{ mb: 0.5 }} />
                            <Typography variant="body1">
                              {item.data.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.data.location} {item.data.cost > 0 ? `• $${item.data.cost}` : ''}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Show hotel for the night */}
              {tripData.hotels.length > 0 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <HotelIcon color="action" />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Staying at: {tripData.hotels[0].name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tripData.hotels[0].location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        )
      })}

      {days.length === 0 && (
        <Alert severity="warning">
          Please set start and end dates to see the day-by-day itinerary.
        </Alert>
      )}
    </Box>
  )
}
