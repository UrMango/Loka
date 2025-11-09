import { useState } from 'react'
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  IconButton,
  Card,
  CardContent,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import DeleteIcon from '@mui/icons-material/Delete'
import FlightSearch from '../FlightSearch'
import ManualFlightForm from '../ManualFlightForm'
import type { Flight } from '../../types/Flight'

interface TripFlightStepProps {
  tripData: any
  setTripData: (data: any) => void
}

export default function TripFlightStep({ tripData, setTripData }: TripFlightStepProps) {
  const [flightMode, setFlightMode] = useState<'search' | 'manual' | null>(null)

  const handleAddFlight = (flight: Flight) => {
    console.log('TripFlightStep - Adding flight:', flight)
    console.log('Current flights:', tripData.flights)
    const newFlights = [...tripData.flights, flight]
    console.log('New flights array:', newFlights)
    setTripData({
      ...tripData,
      flights: newFlights
    })
    setFlightMode(null)
  }

  const handleRemoveFlight = (index: number) => {
    const newFlights = tripData.flights.filter((_: any, i: number) => i !== index)
    setTripData({ ...tripData, flights: newFlights })
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add Flights
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        You can search for flights or enter a flight number to automatically fetch details. 
        For round trips, add both your outbound and return flights separately.
      </Typography>

      {!flightMode && (
        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Choose how you'd like to add a flight:
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={flightMode}
            onChange={(_, value) => setFlightMode(value)}
            sx={{ mt: 2 }}
          >
            <ToggleButton value="manual">
              <SearchIcon sx={{ mr: 1 }} />
              Search & Add Flight
            </ToggleButton>
            <ToggleButton value="search">
              <ConfirmationNumberIcon sx={{ mr: 1 }} />
              Quick Flight Search (Legacy)
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {flightMode === 'search' && (
        <Box sx={{ my: 3 }}>
          <FlightSearch
            onSelectFlight={handleAddFlight}
          />
        </Box>
      )}

      {flightMode === 'manual' && (
        <Box sx={{ my: 3 }}>
          <ManualFlightForm
            onAddFlight={handleAddFlight}
            onCancel={() => setFlightMode(null)}
          />
        </Box>
      )}

      {tripData.flights.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Added Flights ({tripData.flights.length})
          </Typography>
          <List>
            {tripData.flights.map((flight: Flight, index: number) => (
              <ListItem
                key={index}
                sx={{ px: 0 }}
              >
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">
                          {flight.airline} {flight.flightNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {flight.departureAirport.code} → {flight.arrivalAirport.code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(flight.departureDateTime).toLocaleDateString()} | ${flight.price}
                        </Typography>
                      </Box>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFlight(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {!flightMode && tripData.flights.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            No flights added yet. You can skip this step or add flights later.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
