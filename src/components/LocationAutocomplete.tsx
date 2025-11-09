import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { placesApi, type PlaceSuggestion } from '../services/placesApi';

interface LocationAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onLocationSelect: (location: { address: string; lat?: number; lng?: number; placeId?: string }) => void;
  error?: boolean;
  helperText?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onLocationSelect,
  error,
  helperText,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (inputValue.length < 3) {
      setOptions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const suggestions = await placesApi.searchPlaces(inputValue, '');
        setOptions(suggestions);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleSelect = async (suggestion: PlaceSuggestion | null) => {
    if (!suggestion) {
      onLocationSelect({ address: inputValue });
      return;
    }

    try {
      // Fetch full details to get coordinates
      const details = await placesApi.getPlaceDetails(suggestion.place_id);
      onLocationSelect({
        address: details.address,
        lat: details.lat,
        lng: details.lng,
        placeId: suggestion.place_id,
      });
      setInputValue(details.address);
    } catch (error) {
      console.error('Error fetching location details:', error);
      onLocationSelect({ address: suggestion.description });
      setInputValue(suggestion.description);
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      loading={loading}
      value={null}
      inputValue={inputValue}
      onInputChange={(_, newValue) => {
        setInputValue(newValue);
      }}
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') {
          onLocationSelect({ address: newValue });
        } else if (newValue) {
          handleSelect(newValue);
        }
      }}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.description
      }
      renderOption={(props, option) => {
        const { key, ...otherProps } = props as any;
        return (
          <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', gap: 1 }}>
            <LocationOn color="action" />
            <Box>
              <Typography variant="body2">
                {option.structured_formatting?.main_text || option.description}
              </Typography>
              {option.structured_formatting?.secondary_text && (
                <Typography variant="caption" color="text.secondary">
                  {option.structured_formatting.secondary_text}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
