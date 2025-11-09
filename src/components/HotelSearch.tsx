import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  Typography,
  Paper,
} from '@mui/material';
import { hotelApi, type HotelSuggestion, type HotelDetails } from '../services/hotelApi';

// Re-export for convenience
export type { HotelDetails };

interface HotelSearchProps {
  onHotelSelect: (hotelDetails: HotelDetails) => void;
  originLocation?: string; // e.g., "Dubai International Airport" for distance calculation
  label?: string;
  placeholder?: string;
}

export const HotelSearch: React.FC<HotelSearchProps> = ({
  onHotelSelect,
  originLocation,
  label = 'Search for Hotel',
  placeholder = 'Type hotel name or location...',
}) => {
  console.log('🏨 HotelSearch component loaded!')
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<HotelSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<HotelSuggestion | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Debounced search for autocomplete
  useEffect(() => {
    if (inputValue.length < 3) {
      setOptions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const suggestions = await hotelApi.searchHotels(inputValue);
        setOptions(suggestions);
      } catch (err: any) {
        console.error('Error fetching hotel suggestions:', err);
        setError('Failed to fetch hotel suggestions. Please try again.');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleSelectHotel = async (suggestion: HotelSuggestion | null) => {
    if (!suggestion) {
      setSelectedOption(null);
      return;
    }

    setSelectedOption(suggestion);
    setFetchingDetails(true);
    setError(null);

    try {
      // Fetch hotel details
      const details = await hotelApi.getHotelDetails(suggestion.placeId);

      // If origin location provided, calculate distance
      let distanceInfo;
      if (originLocation) {
        try {
          distanceInfo = await hotelApi.calculateDistance(
            originLocation,
            `${details.lat},${details.lng}`
          );
        } catch (distErr) {
          console.warn('Could not calculate distance:', distErr);
        }
      }

      const hotelDetails: HotelDetails = {
        placeId: suggestion.placeId,
        name: details.name,
        address: details.address,
        rating: details.rating,
        lat: details.lat,
        lng: details.lng,
        types: details.types,
        ...(distanceInfo && {
          distance: distanceInfo.distance,
          duration: distanceInfo.duration,
        }),
      };

      onHotelSelect(hotelDetails);
    } catch (err: any) {
      console.error('Error fetching hotel details:', err);
      setError('Failed to fetch hotel details. Please try again.');
    } finally {
      setFetchingDetails(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Autocomplete
        options={options}
        loading={loading}
        value={selectedOption}
        onChange={(_, newValue) => handleSelectHotel(newValue)}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option
          return option.name || option.formattedAddress || ''
        }}
        isOptionEqualToValue={(option, value) => option.placeId === value.placeId}
        filterOptions={(x) => x} // Disable built-in filtering (we use API results)
        noOptionsText={
          inputValue.length < 3
            ? 'Type at least 3 characters to search'
            : loading
            ? 'Searching...'
            : 'No hotels found'
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading || fetchingDetails ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.placeId}>
            <Box>
              <Typography variant="body1">
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.formattedAddress}
              </Typography>
            </Box>
          </li>
        )}
        PaperComponent={(props) => (
          <Paper {...props} elevation={8} />
        )}
        disabled={fetchingDetails}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {fetchingDetails && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Fetching hotel details...
          </Typography>
        </Box>
      )}
    </Box>
  );
};
