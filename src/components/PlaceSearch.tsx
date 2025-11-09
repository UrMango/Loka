import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material';
import { Attractions, Restaurant, Park, Museum, LocationOn } from '@mui/icons-material';
import { placesApi, type PlaceSuggestion, type PlaceDetails } from '../services/placesApi';

interface PlaceSearchProps {
  onPlaceSelect: (placeDetails: PlaceDetails) => void;
  label?: string;
  placeholder?: string;
  types?: string; // e.g., "tourist_attraction|restaurant|park"
}

export const PlaceSearch: React.FC<PlaceSearchProps> = ({
  onPlaceSelect,
  label = "Search for attractions or places",
  placeholder = "e.g., Burj Khalifa, restaurants in Dubai...",
  types,
}) => {
  console.log('🎭 PlaceSearch component loaded!');
  
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Debounced search
  useEffect(() => {
    if (inputValue.length < 3) {
      setOptions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const suggestions = await placesApi.searchPlaces(inputValue, types);
        setOptions(suggestions);
      } catch (err: any) {
        console.error('Error searching places:', err);
        setError(err.message || 'Failed to search places');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue, types]);

  const handleSelect = async (suggestion: PlaceSuggestion | null) => {
    if (!suggestion) return;

    setFetchingDetails(true);
    try {
      const details = await placesApi.getPlaceDetails(suggestion.place_id);
      onPlaceSelect(details);
      setInputValue(''); // Clear the search after selection
      setOptions([]);
    } catch (err: any) {
      console.error('Error fetching place details:', err);
      setError(err.message || 'Failed to fetch place details');
    } finally {
      setFetchingDetails(false);
    }
  };

  const getIconForType = (types: string[]) => {
    if (types.includes('restaurant') || types.includes('food')) {
      return <Restaurant fontSize="small" color="action" />;
    }
    if (types.includes('park')) {
      return <Park fontSize="small" color="action" />;
    }
    if (types.includes('museum')) {
      return <Museum fontSize="small" color="action" />;
    }
    if (types.includes('tourist_attraction') || types.includes('point_of_interest')) {
      return <Attractions fontSize="small" color="action" />;
    }
    return <LocationOn fontSize="small" color="action" />;
  };

  return (
    <Box>
      <Autocomplete
        freeSolo={false}
        options={options}
        loading={loading || fetchingDetails}
        value={null}
        inputValue={inputValue}
        onInputChange={(_, newValue) => {
          setInputValue(newValue);
        }}
        onChange={(_, newValue) => {
          if (newValue) {
            handleSelect(newValue);
          }
        }}
        getOptionLabel={(option) => option.description}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props as any;
          return (
            <Box
              component="li"
              key={key}
              {...otherProps}
              sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}
            >
              {getIconForType(option.types)}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  {option.structured_formatting?.main_text || option.description}
                </Typography>
                {option.structured_formatting?.secondary_text && (
                  <Typography variant="caption" color="text.secondary">
                    {option.structured_formatting.secondary_text}
                  </Typography>
                )}
                <Box sx={{ mt: 0.5 }}>
                  {option.types.slice(0, 2).map((type) => (
                    <Chip
                      key={type}
                      label={type.replace(/_/g, ' ')}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, fontSize: '0.65rem', height: '18px' }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={!!error}
            helperText={error || 'Start typing to search for places'}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {(loading || fetchingDetails) ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        noOptionsText={
          inputValue.length < 3
            ? 'Type at least 3 characters to search'
            : 'No places found'
        }
      />

      {fetchingDetails && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Loading place details...
        </Typography>
      )}
    </Box>
  );
};
