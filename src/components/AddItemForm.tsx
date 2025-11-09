import { useState } from 'react'
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Stack
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import type { SelectChangeEvent } from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import FlightSearch from './FlightSearch'
import ManualFlightForm from './ManualFlightForm'
import { HotelSearch, type HotelDetails } from './HotelSearch'
import { HotelDetailsCard } from './HotelDetailsCard'
import { tripApi } from '../services/api'
import type { Flight } from '../types/Flight'
import type { Hotel } from '../types/Hotel'
import type { Transportation } from '../types/Transportation'
import type { Attraction } from '../types/Attraction'

type ItemType = 'flight' | 'hotel' | 'transportation' | 'attraction'
type TripItem = Flight | Hotel | Transportation | Attraction

interface AddItemFormProps {
  onSubmit: (item: TripItem) => void
  onCancel: () => void
}

interface HotelFormData {
  name: string
  address: string
  rating: string
  checkIn: Date | null
  checkOut: Date | null
  pricePerNight: string
  roomType: string
}

interface TransportationFormData {
  mode: 'taxi' | 'rental' | 'shuttle'
  provider: string
  pickupLocation: string
  pickupDateTime: Date | null
  dropoffLocation: string
  dropoffDateTime: Date | null
  cost: string
}

interface AttractionFormData {
  name: string
  location: string
  startDateTime: Date | null
  duration: string
  cost: string
  description: string
}

const emptyHotelForm: HotelFormData = {
  name: '',
  address: '',
  rating: '3',
  checkIn: null,
  checkOut: null,
  pricePerNight: '',
  roomType: ''
}

const emptyTransportationForm: TransportationFormData = {
  mode: 'taxi',
  provider: '',
  pickupLocation: '',
  pickupDateTime: null,
  dropoffLocation: '',
  dropoffDateTime: null,
  cost: ''
}

const emptyAttractionForm: AttractionFormData = {
  name: '',
  location: '',
  startDateTime: null,
  duration: '',
  cost: '',
  description: ''
}

const AddItemForm = ({ onSubmit, onCancel }: AddItemFormProps) => {
  const [itemType, setItemType] = useState<ItemType>('flight')
  const [flightMode, setFlightMode] = useState<'search' | 'manual' | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<HotelDetails | null>(null)
  const [hotelData, setHotelData] = useState<HotelFormData>(emptyHotelForm)
  const [transportationData, setTransportationData] = useState<TransportationFormData>(emptyTransportationForm)
  const [attractionData, setAttractionData] = useState<AttractionFormData>(emptyAttractionForm)

  const handleTypeChange = (event: SelectChangeEvent<ItemType>) => {
    setItemType(event.target.value as ItemType)
    setFlightMode(null) // Reset flight mode when changing item type
  }

  const handleFlightSelected = (flight: Flight) => {
    console.log('AddItemForm - handleFlightSelected called with:', flight)
    console.log('Calling onSubmit with flight...')
    onSubmit(flight)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let item: TripItem

    switch (itemType) {
      case 'flight':
        // Flights are handled by FlightSearch/ManualFlightForm components
        return

      case 'hotel':
        if (!validateHotelForm()) return
        item = {
          id: crypto.randomUUID(),
          type: 'hotel',
          name: hotelData.name,
          location: { 
            address: hotelData.address,
            coordinates: selectedHotel ? { lat: selectedHotel.lat, lng: selectedHotel.lng } : undefined
          } as any,
          checkIn: hotelData.checkIn!,
          checkOut: hotelData.checkOut!,
          pricePerNight: Number(hotelData.pricePerNight),
          rating: selectedHotel?.rating || Number(hotelData.rating)
        } as Hotel
        break

      case 'transportation':
        if (!validateTransportationForm()) return
        item = {
          id: crypto.randomUUID(),
          type: 'transportation',
          mode: transportationData.mode as any,
          provider: transportationData.provider,
          pickupLocation: { address: transportationData.pickupLocation } as any,
          pickupDateTime: transportationData.pickupDateTime!,
          dropoffLocation: { address: transportationData.dropoffLocation } as any,
          dropoffDateTime: transportationData.dropoffDateTime!,
          cost: Number(transportationData.cost)
        } as Transportation
        break

      case 'attraction':
        if (!validateAttractionForm()) return
        item = {
          id: crypto.randomUUID(),
          type: 'attraction',
          name: attractionData.name,
          location: { address: attractionData.location } as any,
          category: 'other' as any,
          startDateTime: attractionData.startDateTime!,
          duration: Number(attractionData.duration),
          cost: Number(attractionData.cost),
          description: attractionData.description,
          bookingRequired: false
        } as Attraction
        break

      default:
        return
    }

    onSubmit(item)
  }

  const validateHotelForm = () => {
    return hotelData.name &&
           hotelData.address &&
           hotelData.rating &&
           hotelData.checkIn &&
           hotelData.checkOut &&
           hotelData.pricePerNight &&
           hotelData.roomType
  }

  const validateTransportationForm = () => {
    return transportationData.mode &&
           transportationData.provider &&
           transportationData.pickupLocation &&
           transportationData.pickupDateTime &&
           transportationData.dropoffLocation &&
           transportationData.dropoffDateTime &&
           transportationData.cost
  }

  const validateAttractionForm = () => {
    return attractionData.name &&
           attractionData.location &&
           attractionData.startDateTime &&
           attractionData.duration &&
           attractionData.cost
  }

  const renderFlightForm = () => {
    if (!flightMode) {
      return (
        <Box sx={{ py: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Flight
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Choose how you'd like to add your flight:
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => setFlightMode('search')}
              sx={{ py: 3 }}
            >
              <Stack alignItems="center" spacing={1}>
                <SearchIcon fontSize="large" />
                <Typography variant="body1">Search Flights</Typography>
                <Typography variant="caption" color="text.secondary">
                  Search by date and airports
                </Typography>
              </Stack>
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => setFlightMode('manual')}
              sx={{ py: 3 }}
            >
              <Stack alignItems="center" spacing={1}>
                <ConfirmationNumberIcon fontSize="large" />
                <Typography variant="body1">Enter Flight Number</Typography>
                <Typography variant="caption" color="text.secondary">
                  Auto-fetch from Aviationstack
                </Typography>
              </Stack>
            </Button>
          </Stack>
        </Box>
      )
    }

    if (flightMode === 'search') {
      return (
        <Box>
          <FlightSearch onSelectFlight={handleFlightSelected} />
        </Box>
      )
    }

    if (flightMode === 'manual') {
      return (
        <Box>
          <ManualFlightForm
            onAddFlight={handleFlightSelected}
            onCancel={() => setFlightMode(null)}
            tripApi={tripApi}
          />
        </Box>
      )
    }

    return null
  }

  const renderHotelForm = () => (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        Search and add accommodation
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Search for hotels and add accommodation details for your trip.
      </Typography>

      <HotelSearch
        onHotelSelect={(hotel) => {
          setSelectedHotel(hotel)
          // Pre-fill the form data with hotel details
          setHotelData({
            ...hotelData,
            name: hotel.name,
            address: hotel.address,
            rating: hotel.rating?.toString() || '3'
          })
        }}
        label="Search for hotels"
        placeholder="e.g., Burj Al Arab, Atlantis Dubai..."
      />

      {selectedHotel && (
        <>
          <HotelDetailsCard hotel={selectedHotel} showDistance={false} />
          
          <Stack direction="row" spacing={2}>
            <DateTimePicker
              label="Check-in Date & Time"
              value={hotelData.checkIn}
              onChange={(date) => setHotelData({ ...hotelData, checkIn: date })}
            />
            <DateTimePicker
              label="Check-out Date & Time"
              value={hotelData.checkOut}
              onChange={(date) => setHotelData({ ...hotelData, checkOut: date })}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              required
              type="number"
              label="Price per Night"
              value={hotelData.pricePerNight}
              onChange={(e) => setHotelData({ ...hotelData, pricePerNight: e.target.value })}
            />
            <TextField
              fullWidth
              required
              label="Room Type"
              value={hotelData.roomType}
              onChange={(e) => setHotelData({ ...hotelData, roomType: e.target.value })}
            />
          </Stack>
        </>
      )}
    </Stack>
  )

  const renderTransportationForm = () => (
    <Stack spacing={2}>
      <FormControl fullWidth required>
        <InputLabel>Mode</InputLabel>
        <Select
          value={transportationData.mode}
          label="Mode"
          onChange={(e) => setTransportationData({ 
            ...transportationData, 
            mode: e.target.value as 'taxi' | 'rental' | 'shuttle' 
          })}
        >
          <MenuItem value="taxi">Taxi</MenuItem>
          <MenuItem value="rental">Car Rental</MenuItem>
          <MenuItem value="shuttle">Shuttle</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        required
        label="Provider"
        value={transportationData.provider}
        onChange={(e) => setTransportationData({ ...transportationData, provider: e.target.value })}
      />

      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          required
          label="Pickup Location"
          value={transportationData.pickupLocation}
          onChange={(e) => setTransportationData({ ...transportationData, pickupLocation: e.target.value })}
        />
        <TextField
          fullWidth
          required
          label="Dropoff Location"
          value={transportationData.dropoffLocation}
          onChange={(e) => setTransportationData({ ...transportationData, dropoffLocation: e.target.value })}
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        <DateTimePicker
          label="Pickup Date & Time"
          value={transportationData.pickupDateTime}
          onChange={(date) => setTransportationData({ ...transportationData, pickupDateTime: date })}
        />
        <DateTimePicker
          label="Dropoff Date & Time"
          value={transportationData.dropoffDateTime}
          onChange={(date) => setTransportationData({ ...transportationData, dropoffDateTime: date })}
        />
      </Stack>

      <TextField
        fullWidth
        required
        type="number"
        label="Cost"
        value={transportationData.cost}
        onChange={(e) => setTransportationData({ ...transportationData, cost: e.target.value })}
      />
    </Stack>
  )

  const renderAttractionForm = () => (
    <Stack spacing={2}>
      <TextField
        fullWidth
        required
        label="Attraction Name"
        value={attractionData.name}
        onChange={(e) => setAttractionData({ ...attractionData, name: e.target.value })}
      />

      <TextField
        fullWidth
        required
        label="Location"
        value={attractionData.location}
        onChange={(e) => setAttractionData({ ...attractionData, location: e.target.value })}
      />

      <Stack direction="row" spacing={2}>
        <DateTimePicker
          label="Start Date & Time"
          value={attractionData.startDateTime}
          onChange={(date) => setAttractionData({ ...attractionData, startDateTime: date })}
        />
        <TextField
          fullWidth
          required
          type="number"
          label="Duration (minutes)"
          value={attractionData.duration}
          onChange={(e) => setAttractionData({ ...attractionData, duration: e.target.value })}
        />
      </Stack>

      <TextField
        fullWidth
        required
        type="number"
        label="Cost"
        value={attractionData.cost}
        onChange={(e) => setAttractionData({ ...attractionData, cost: e.target.value })}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Description"
        value={attractionData.description}
        onChange={(e) => setAttractionData({ ...attractionData, description: e.target.value })}
      />
    </Stack>
  )

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          Add Item to Trip
        </Typography>
        
        <FormControl fullWidth>
          <InputLabel>Item Type</InputLabel>
          <Select value={itemType} label="Item Type" onChange={handleTypeChange}>
            <MenuItem value="flight">Flight</MenuItem>
            <MenuItem value="hotel">Hotel</MenuItem>
            <MenuItem value="transportation">Transportation</MenuItem>
            <MenuItem value="attraction">Attraction</MenuItem>
          </Select>
        </FormControl>

        {itemType === 'flight' && renderFlightForm()}
        {itemType === 'hotel' && renderHotelForm()}
        {itemType === 'transportation' && renderTransportationForm()}
        {itemType === 'attraction' && renderAttractionForm()}

        {/* Only show buttons for non-flight items or when flight mode not selected */}
        {(itemType !== 'flight' || !flightMode) && (
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            {itemType !== 'flight' && (
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
              >
                Add Item
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

export default AddItemForm