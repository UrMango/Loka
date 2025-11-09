import type { ReactNode } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { Box, CircularProgress, Typography } from '@mui/material';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';

interface GoogleMapsProviderProps {
  children: ReactNode;
}

const libraries: ("places")[] = ['places'];

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      loadingElement={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2,
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Loading Google Maps...
          </Typography>
        </Box>
      }
      preventGoogleFontsLoading={true}
      onLoad={() => {
        console.log('Google Maps loaded successfully');
      }}
      onError={(error) => {
        console.error('Google Maps failed to load:', error);
      }}
    >
      {children}
    </LoadScript>
  );
}