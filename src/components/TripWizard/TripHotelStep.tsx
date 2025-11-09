import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  IconButton,
  Card,
  CardContent,
  InputAdornment,
  Alert,
  Divider,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { HotelSearch, type HotelDetails } from '../HotelSearch'
import { HotelDetailsCard } from '../HotelDetailsCard'

interface TripHotelStepProps {
  tripData: any
  setTripData: (data: any) => void
}

export default function TripHotelStep({ tripData, setTripData }: TripHotelStepProps) {
  const [selectedHotel, setSelectedHotel] = useState<HotelDetails | null>(null)
  const [pricePerNight, setPricePerNight] = useState('')
  const [notes, setNotes] = useState('')

  const calculateNights = () => {
    if (tripData.startDate && tripData.endDate) {
      const start = new Date(tripData.startDate)
      const end = new Date(tripData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }
    return 1
  }

  const handleHotelSelect = (hotel: HotelDetails) => {
    setSelectedHotel(hotel)
  }

  const handleAddHotel = () => {
    if (!selectedHotel || !pricePerNight) {
      return
    }

    const nights = calculateNights()
    const totalCost = parseFloat(pricePerNight) * nights

    const newHotel: any = {
      name: selectedHotel.name,
      address: selectedHotel.address,
      location: selectedHotel.address,
      lat: selectedHotel.lat,
      lng: selectedHotel.lng,
      rating: selectedHotel.rating,
      checkIn: tripData.startDate,
      checkOut: tripData.endDate,
      pricePerNight: parseFloat(pricePerNight),
      totalCost,
      notes,
      distance: selectedHotel.distance,
      duration: selectedHotel.duration,
    }

    setTripData({
      ...tripData,
      hotels: [...tripData.hotels, newHotel]
    })

    // Reset form
    setSelectedHotel(null)
    setPricePerNight('')
    setNotes('')
  }

  const handleRemoveHotel = (index: number) => {
    const newHotels = tripData.hotels.filter((_: any, i: number) => i !== index)
    setTripData({ ...tripData, hotels: newHotels })
  }

  const nights = calculateNights()

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add Hotels
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Search and add accommodation for this trip. Based on your trip dates, you'll need {nights} night{nights !== 1 ? 's' : ''}.
      </Typography>

      <Box sx={{ my: 3 }}>
        {/* Google Places Hotel Search */}
        <Box sx={{ mb: 3 }}>
          <HotelSearch
            onHotelSelect={handleHotelSelect}
            originLocation="Dubai International Airport"
            label="Search for Hotel"
            placeholder="e.g., Burj Al Arab, Atlantis The Palm..."
          />
        </Box>

        {/* Selected Hotel Details */}
        {selectedHotel && (
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Selected Hotel
              </Typography>
            </Divider>
            <HotelDetailsCard hotel={selectedHotel} showDistance={true} />
          </Box>
        )}

        {/* Price and Notes Form */}
        {selectedHotel && (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Price per Night"
              type="number"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="0.00"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            {pricePerNight && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Total for {nights} night{nights !== 1 ? 's' : ''}: ${(parseFloat(pricePerNight) * nights).toFixed(2)}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={2}
              placeholder="Any additional notes about this hotel"
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              onClick={handleAddHotel}
              disabled={!pricePerNight}
              fullWidth
            >
              Add Hotel to Trip
            </Button>
          </Box>
        )}
      </Box>

      {tripData.hotels.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Added Hotels ({tripData.hotels.length})
          </Typography>
          <List>
            {tripData.hotels.map((hotel: any, index: number) => (
              <ListItem
                key={index}
                sx={{ px: 0 }}
              >
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">
                          {hotel.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hotel.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${hotel.pricePerNight}/night × {nights} nights = ${hotel.totalCost.toFixed(2)}
                        </Typography>
                        {hotel.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {hotel.notes}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveHotel(index)}
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

      {tripData.hotels.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            No hotels added yet. You can skip this step or add hotels later.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
