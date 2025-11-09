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
  Chip,
  Rating,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AttractionsIcon from '@mui/icons-material/Attractions'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttractionSearch from '../AttractionSearch'
import type { Attraction } from '../../types/Attraction'

interface TripAttractionsStepProps {
  tripData: any
  setTripData: (data: any) => void
}

export default function TripAttractionsStep({ tripData, setTripData }: TripAttractionsStepProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddAttraction = (attraction: Attraction) => {
    setTripData({
      ...tripData,
      attractions: [...(tripData.attractions || []), attraction]
    })
    setShowAddForm(false)
  }

  const handleRemoveAttraction = (index: number) => {
    const newAttractions = (tripData.attractions || []).filter((_: any, i: number) => i !== index)
    setTripData({ ...tripData, attractions: newAttractions })
  }

  const getCategoryIcon = () => {
    // Return icon based on category - using AttractionsIcon as default
    return <AttractionsIcon fontSize="small" />
  }

  const getCategoryColor = (category: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (category) {
      case 'restaurant':
        return 'error'
      case 'shopping':
        return 'secondary'
      case 'sight':
        return 'primary'
      case 'entertainment':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add Attractions & Activities
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Add places to visit, restaurants, museums, and activities for your trip.
      </Typography>

      {!showAddForm && (
        <Button
          variant="outlined"
          onClick={() => setShowAddForm(true)}
          sx={{ mb: 3 }}
        >
          Add Attraction
        </Button>
      )}

      {showAddForm && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <AttractionSearch 
              onAddAttraction={handleAddAttraction}
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

      {(tripData.attractions?.length > 0) && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Added Attractions ({tripData.attractions.length})
          </Typography>
          <List>
            {tripData.attractions.map((attraction: Attraction, index: number) => (
              <ListItem
                key={attraction.id || index}
                sx={{ px: 0 }}
              >
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getCategoryIcon()}
                          <Typography variant="h6">
                            {attraction.name || 'Unnamed Attraction'}
                          </Typography>
                          <Chip 
                            label={attraction.category} 
                            size="small" 
                            color={getCategoryColor(attraction.category)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>

                        {attraction.rating && (
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Rating value={attraction.rating} precision={0.1} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                              {attraction.rating}
                            </Typography>
                          </Box>
                        )}
                        
                        {(attraction.formattedAddress || attraction.location?.address) && (
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <LocationOnIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {attraction.formattedAddress || attraction.location?.address}
                            </Typography>
                          </Box>
                        )}
                        
                        {attraction.startDateTime && (
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(attraction.startDateTime).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              {attraction.duration && attraction.duration > 0 && (
                                <> - {new Date(new Date(attraction.startDateTime).getTime() + attraction.duration * 60000).toLocaleString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })} ({attraction.duration} min)</>
                              )}
                            </Typography>
                          </Box>
                        )}

                        {attraction.openingHours && (
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                            {attraction.openingHours.openNow ? '🟢 Open Now' : '🔴 Closed'}
                          </Typography>
                        )}

                        {attraction.cost > 0 && (
                          <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                            Cost: ${attraction.cost.toFixed(2)}
                          </Typography>
                        )}

                        {attraction.website && (
                          <Typography 
                            variant="body2" 
                            component="a" 
                            href={attraction.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ 
                              mt: 1, 
                              display: 'block',
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            Visit Website →
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveAttraction(index)}
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

      {(!tripData.attractions || tripData.attractions.length === 0) && !showAddForm && (
        <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            No attractions added yet. You can skip this step or add attractions later.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
