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
  Chip,
  Rating,
  InputAdornment
} from '@mui/material'
import AttractionsIcon from '@mui/icons-material/Attractions'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import WebIcon from '@mui/icons-material/Web'
import { placesApi, type PlaceSuggestion, type PlaceDetails } from '../services/placesApi'
import type { Attraction } from '../types/Attraction'

interface AttractionSearchProps {
  onAddAttraction: (attraction: Attraction) => void
  tripStartDate?: Date
}

export default function AttractionSearch({ onAddAttraction, tripStartDate }: AttractionSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null)
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visitDateTime, setVisitDateTime] = useState<string>('')
  const [duration, setDuration] = useState<string>('60')
  const [cost, setCost] = useState<string>('')
  const [category, setCategory] = useState<'sight' | 'activity' | 'restaurant' | 'shopping' | 'entertainment' | 'other'>('sight')

  // Search attractions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await placesApi.searchPlaces(searchQuery)
        setSuggestions(results)
      } catch (err: any) {
        console.error('Error searching attractions:', err)
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch place details when a place is selected
  useEffect(() => {
    if (selectedPlace) {
      fetchPlaceDetails()
    } else {
      setPlaceDetails(null)
    }
  }, [selectedPlace])

  const fetchPlaceDetails = async () => {
    if (!selectedPlace) return

    setLoading(true)
    setError(null)

    try {
      const details = await placesApi.getPlaceDetails(selectedPlace.placeId)
      setPlaceDetails(details)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch place details')
    } finally {
      setLoading(false)
    }
  }

  const determineCategoryFromTypes = (types: string[] | undefined): 'sight' | 'activity' | 'restaurant' | 'shopping' | 'entertainment' | 'other' => {
    if (!types || !Array.isArray(types)) {
      return 'other'
    }
    if (types.includes('restaurant') || types.includes('cafe') || types.includes('food')) {
      return 'restaurant'
    }
    if (types.includes('shopping_mall') || types.includes('store')) {
      return 'shopping'
    }
    if (types.includes('amusement_park') || types.includes('night_club') || types.includes('casino')) {
      return 'entertainment'
    }
    if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('art_gallery')) {
      return 'sight'
    }
    if (types.includes('park') || types.includes('zoo') || types.includes('aquarium')) {
      return 'activity'
    }
    return 'other'
  }

  const handleAddAttraction = () => {
    if (!selectedPlace || !placeDetails) return

    console.log('Adding attraction with placeDetails:', placeDetails)
    console.log('Place name:', placeDetails.name)

    const visitDate = visitDateTime 
      ? new Date(visitDateTime)
      : tripStartDate || new Date()

    const autoCategory = determineCategoryFromTypes(placeDetails.types)

    const attractionAddress = placeDetails.address || selectedPlace.formattedAddress || ''
    
    const attraction: Attraction = {
      id: `attraction-${Date.now()}`,
      type: 'attraction',
      name: placeDetails.name || selectedPlace.name || 'Unnamed Attraction',
      location: {
        id: `loc-${Date.now()}`,
        type: 'location',
        name: placeDetails.name || selectedPlace.name || '',
        address: attractionAddress,
        city: '',
        country: '',
        coordinates: {
          lat: placeDetails.lat,
          lng: placeDetails.lng
        },
        placeId: selectedPlace.placeId
      },
      category: category || autoCategory,
      startDateTime: visitDate,
      duration: parseInt(duration) || 60,
      cost: cost ? parseFloat(cost) : 0,
      rating: placeDetails.rating || undefined,
      bookingRequired: false,
      placeId: selectedPlace.placeId,
      formattedAddress: attractionAddress,
      openingHours: placeDetails.openingHours || undefined,
      website: placeDetails.website || undefined
    }

    console.log('Created attraction object:', attraction)

    onAddAttraction(attraction)

    // Reset form
    setSelectedPlace(null)
    setPlaceDetails(null)
    setSearchQuery('')
    setVisitDateTime('')
    setDuration('60')
    setCost('')
    setCategory('sight')
  }

  return (
    <Box>
      <Stack spacing={2}>
        {/* Search Field */}
        <Autocomplete
          freeSolo
          options={suggestions}
          getOptionLabel={(option) => 
            typeof option === 'string' ? option : option.name || option.formattedAddress || ''
          }
          isOptionEqualToValue={(option, value) => 
            typeof option === 'string' || typeof value === 'string' 
              ? option === value 
              : option.placeId === value.placeId
          }
          filterOptions={(x) => x}
          value={selectedPlace}
          onChange={(_, newValue) => {
            if (typeof newValue !== 'string') {
              setSelectedPlace(newValue)
            }
          }}
          onInputChange={(_, newInputValue) => {
            setSearchQuery(newInputValue)
          }}
          loading={searching}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Attractions & Activities"
              placeholder="Museums, restaurants, parks..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <AttractionsIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {searching && <CircularProgress size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.placeId}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.formattedAddress}
                </Typography>
                <Box mt={0.5}>
                  {option.types.slice(0, 3).map((type) => (
                    <Chip
                      key={type}
                      label={type.replace(/_/g, ' ')}
                      size="small"
                      sx={{ mr: 0.5, fontSize: '0.7rem', height: '18px' }}
                    />
                  ))}
                </Box>
              </Box>
            </li>
          )}
        />

        {/* Category Selection */}
        <Box>
          <Typography variant="body2" gutterBottom>
            Category
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['sight', 'activity', 'restaurant', 'shopping', 'entertainment', 'other'].map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setCategory(cat as any)}
                color={category === cat ? 'primary' : 'default'}
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Box>
        </Box>

        {/* Visit Details */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Visit Date & Time"
              value={visitDateTime}
              onChange={(e) => setVisitDateTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
            <TextField
              fullWidth
              type="number"
              label="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">min</InputAdornment>
              }}
            />
          </Box>

          <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
            <TextField
              fullWidth
              type="number"
              label="Cost (optional)"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
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

      {/* Place Details */}
      {placeDetails && !loading && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {placeDetails.name}
            </Typography>

            {placeDetails.rating && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Rating value={placeDetails.rating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {placeDetails.rating} {placeDetails.userRatingsTotal && `(${placeDetails.userRatingsTotal} reviews)`}
                </Typography>
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {placeDetails.address}
              </Typography>
            </Box>

            {placeDetails.openingHours && (
              <Box mb={2}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Opening Hours:
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <AccessTimeIcon fontSize="small" color={placeDetails.openingHours.openNow ? 'success' : 'error'} />
                  <Typography variant="body2" color={placeDetails.openingHours.openNow ? 'success.main' : 'error.main'}>
                    {placeDetails.openingHours.openNow ? 'Open Now' : 'Closed'}
                  </Typography>
                </Box>
                {placeDetails.openingHours.weekdayText && placeDetails.openingHours.weekdayText.length > 0 && (
                  <Box ml={3}>
                    {placeDetails.openingHours.weekdayText.map((text, idx) => (
                      <Typography key={idx} variant="caption" display="block" color="text.secondary">
                        {text}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {placeDetails.website && (
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <WebIcon fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  component="a"
                  href={placeDetails.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Visit Website
                </Typography>
              </Box>
            )}

            {placeDetails.types && placeDetails.types.length > 0 && (
              <Box mb={2}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Categories:
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {placeDetails.types.slice(0, 5).map((type) => (
                    <Chip key={type} label={type.replace(/_/g, ' ')} size="small" />
                  ))}
                </Box>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleAddAttraction}
              disabled={!selectedPlace}
            >
              Add to Trip
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
