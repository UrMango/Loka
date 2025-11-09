import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  IconButton,
  Card,
  CardContent,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import RouteIcon from '@mui/icons-material/Route'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import RideSearch from '../RideSearch'
import type { Transportation } from '../../types/Transportation'

interface TripTransportationStepProps {
  tripData: any
  setTripData: (data: any) => void
}

export default function TripTransportationStep({ tripData, setTripData }: TripTransportationStepProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddTransportation = (ride: Transportation) => {
    setTripData({
      ...tripData,
      rides: [...(tripData.rides || []), ride]
    })
    setShowAddForm(false)
  }

  const handleRemoveTransportation = (index: number) => {
    const newRides = (tripData.rides || []).filter((_: any, i: number) => i !== index)
    setTripData({ ...tripData, rides: newRides })
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add Transportation
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Add taxis or rides for your trip.
      </Typography>

      {!showAddForm && (
        <Button
          variant="outlined"
          onClick={() => setShowAddForm(true)}
          sx={{ mb: 3 }}
        >
          Add Ride
        </Button>
      )}

      {showAddForm && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <RideSearch 
              onAddRide={handleAddTransportation}
              tripStartDate={tripData.startDate}
            />
            <Button
              onClick={() => setShowAddForm(false)}
              sx={{ mt: 2 }}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {(tripData.rides?.length > 0) && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Added Rides ({tripData.rides.length})
          </Typography>
          <List>
            {tripData.rides.map((ride: Transportation, index: number) => (
              <ListItem
                key={ride.id || index}
                sx={{ px: 0 }}
              >
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <DirectionsCarIcon color="primary" />
                          <Typography variant="h6" textTransform="capitalize">
                            {ride.mode}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>From:</strong> {ride.pickupLocation.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>To:</strong> {ride.dropoffLocation.name}
                        </Typography>
                        
                        {ride.pickupDateTime && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Pickup:</strong> {new Date(ride.pickupDateTime).toLocaleString()}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                          {ride.distance && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <RouteIcon fontSize="small" color="action" />
                              <Typography variant="body2">{ride.distance}</Typography>
                            </Box>
                          )}
                          {ride.duration && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon fontSize="small" color="action" />
                              <Typography variant="body2">{ride.duration}</Typography>
                            </Box>
                          )}
                        </Box>

                        {ride.cost > 0 && (
                          <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                            Cost: ${ride.cost.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveTransportation(index)}
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

      {(!tripData.rides || tripData.rides.length === 0) && !showAddForm && (
        <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            No rides added yet. You can skip this step or add rides later.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
