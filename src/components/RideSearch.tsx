import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import RouteIcon from '@mui/icons-material/Route'
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi'
import TripOriginIcon from '@mui/icons-material/TripOrigin'
import PlaceIcon from '@mui/icons-material/Place'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { rideApi, type LocationSuggestion, type RideEstimateResult } from '../services/rideApi'
import type { Transportation } from '../types/Transportation'

interface RideSearchProps {
  onAddRide: (ride: Transportation) => void
  tripStartDate?: Date
}

export default function RideSearch({ onAddRide, tripStartDate }: RideSearchProps) {
  const [pickupQuery, setPickupQuery] = useState('')
  const [dropoffQuery, setDropoffQuery] = useState('')
  const [pickupSuggestions, setPickupSuggestions] = useState<LocationSuggestion[]>([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<LocationSuggestion[]>([])
  const [selectedPickup, setSelectedPickup] = useState<LocationSuggestion | null>(null)
  const [selectedDropoff, setSelectedDropoff] = useState<LocationSuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchingPickup, setSearchingPickup] = useState(false)
  const [searchingDropoff, setSearchingDropoff] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rideEstimate, setRideEstimate] = useState<RideEstimateResult | null>(null)
  const [cost, setCost] = useState<string>('')
  const [rideDateTime, setRideDateTime] = useState<string>('')

  // Search pickup locations
  useEffect(() => {
    if (pickupQuery.length < 2) {
      setPickupSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setSearchingPickup(true)
      try {
        const suggestions = await rideApi.searchLocations(pickupQuery)
        setPickupSuggestions(suggestions)
      } catch (err: any) {
        console.error('Error searching pickup locations:', err)
      } finally {
        setSearchingPickup(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [pickupQuery])

  // Search dropoff locations
  useEffect(() => {
    if (dropoffQuery.length < 2) {
      setDropoffSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setSearchingDropoff(true)
      try {
        const suggestions = await rideApi.searchLocations(dropoffQuery)
        setDropoffSuggestions(suggestions)
      } catch (err: any) {
        console.error('Error searching dropoff locations:', err)
      } finally {
        setSearchingDropoff(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [dropoffQuery])

  // Calculate distance when both locations are selected
  useEffect(() => {
    if (selectedPickup && selectedDropoff) {
      calculateRideEstimate()
    } else {
      setRideEstimate(null)
    }
  }, [selectedPickup, selectedDropoff])

  const calculateRideEstimate = async () => {
    if (!selectedPickup || !selectedDropoff) return

    setLoading(true)
    setError(null)

    try {
      const estimate = await rideApi.getRideEstimate(
        {
          placeId: selectedPickup.placeId,
          name: selectedPickup.name,
          formattedAddress: selectedPickup.formattedAddress
        },
        {
          placeId: selectedDropoff.placeId,
          name: selectedDropoff.name,
          formattedAddress: selectedDropoff.formattedAddress
        },
        ['driving', 'transit']
      )
      setRideEstimate(estimate)
    } catch (err: any) {
      setError(err.message || 'Failed to calculate ride estimate')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRide = () => {
    if (!selectedPickup || !selectedDropoff || !rideEstimate) return

    const pickupDateTime = rideDateTime 
      ? new Date(rideDateTime)
      : tripStartDate || new Date()

    // Use the driving estimate
    const drivingEstimate = rideEstimate.estimates.find(e => e.mode === 'driving') || rideEstimate.estimates[0]

    const ride: Transportation = {
      id: `ride-${Date.now()}`,
      type: 'transportation',
      mode: 'taxi',
      pickupLocation: {
        id: `loc-${Date.now()}-1`,
        type: 'location',
        name: selectedPickup.name,
        address: selectedPickup.formattedAddress,
        city: '',
        country: '',
        coordinates: {
          lat: 0, // Will be fetched from details
          lng: 0
        },
        placeId: selectedPickup.placeId
      },
      dropoffLocation: {
        id: `loc-${Date.now()}-2`,
        type: 'location',
        name: selectedDropoff.name,
        address: selectedDropoff.formattedAddress,
        city: '',
        country: '',
        coordinates: {
          lat: 0,
          lng: 0
        },
        placeId: selectedDropoff.placeId
      },
      pickupDateTime,
      dropoffDateTime: new Date(pickupDateTime.getTime() + (drivingEstimate.durationValue * 1000)),
      cost: cost ? parseFloat(cost) : 0,
      distance: drivingEstimate.distance,
      duration: drivingEstimate.duration
    }

    onAddRide(ride)

    // Reset form
    setSelectedPickup(null)
    setSelectedDropoff(null)
    setPickupQuery('')
    setDropoffQuery('')
    setRideEstimate(null)
    setCost('')
    setRideDateTime('')
  }

  return (
    <Box>
      <Stack spacing={2}>
        {/* Pickup and Dropoff Locations */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
            <Autocomplete
              freeSolo
              options={pickupSuggestions}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option
                return option.name || option.formattedAddress || ''
              }}
              filterOptions={(x) => x}
              value={selectedPickup}
              onChange={(_, newValue) => {
                if (typeof newValue !== 'string') {
                  setSelectedPickup(newValue)
                }
              }}
              onInputChange={(_, newInputValue) => {
                setPickupQuery(newInputValue)
              }}
              loading={searchingPickup}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pick-up Location"
                  placeholder="Search for a location..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <TripOriginIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {searchingPickup && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.formattedAddress}
                    </Typography>
                  </Box>
                </li>
              )}
            />
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
            <Autocomplete
              freeSolo
              options={dropoffSuggestions}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option
                return option.name || option.formattedAddress || ''
              }}
              filterOptions={(x) => x}
              value={selectedDropoff}
              onChange={(_, newValue) => {
                if (typeof newValue !== 'string') {
                  setSelectedDropoff(newValue)
                }
              }}
              onInputChange={(_, newInputValue) => {
                setDropoffQuery(newInputValue)
              }}
              loading={searchingDropoff}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Drop-off Location"
                  placeholder="Search for a location..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PlaceIcon color="error" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {searchingDropoff && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.formattedAddress}
                    </Typography>
                  </Box>
                </li>
              )}
            />
          </Box>
        </Box>

        {/* Date/Time and Cost */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Pick-up Date & Time"
              value={rideDateTime}
              onChange={(e) => setRideDateTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ScheduleIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
            <TextField
              fullWidth
              type="number"
              label="Estimated Cost (optional)"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Box>
      </Stack>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      )}

      {/* Ride Estimate */}
      {rideEstimate && !loading && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ride Estimate
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>From:</strong> {rideEstimate.pickup.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>To:</strong> {rideEstimate.dropoff.name}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              {rideEstimate.estimates.map((estimate) => (
                <Card key={estimate.mode} variant="outlined" sx={{ flex: '1 1 200px' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {estimate.mode === 'driving' ? (
                        <LocalTaxiIcon color="primary" sx={{ fontSize: 28 }} />
                      ) : estimate.mode === 'transit' ? (
                        <DirectionsTransitIcon color="secondary" sx={{ fontSize: 28 }} />
                      ) : (
                        <DirectionsBusIcon color="action" sx={{ fontSize: 28 }} />
                      )}
                      <Typography variant="subtitle2" textTransform="capitalize" fontWeight="bold">
                        {estimate.mode === 'driving' ? 'Taxi / Car' : estimate.mode === 'transit' ? 'Public Transit' : estimate.mode}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <RouteIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {estimate.distance}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {estimate.duration}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleAddRide}
              disabled={!selectedPickup || !selectedDropoff}
            >
              Add Ride to Trip
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
