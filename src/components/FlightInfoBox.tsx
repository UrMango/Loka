import { Box, Paper, Typography, Button } from '@mui/material'
import type { Flight } from '../types/Flight'
import FlightIcon from '@mui/icons-material/Flight'

interface FlightInfoBoxProps {
  flight: Flight
  position: google.maps.LatLngLiteral
  onShowRoute: () => void
  isSelected: boolean
}

export function FlightInfoBox({ flight, position, onShowRoute, isSelected }: FlightInfoBoxProps) {
  // Calculate flight duration in hours and minutes
  const durationMs = flight.arrivalDateTime.getTime() - flight.departureDateTime.getTime()
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        left: position.lng,
        top: position.lat,
        transform: 'translate(-50%, -50%)',
        padding: 1,
        minWidth: 200,
        backgroundColor: isSelected ? 'primary.light' : 'background.paper',
        borderRadius: 1,
        '&:hover': {
          backgroundColor: 'primary.light',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <FlightIcon color="primary" />
        <Typography variant="subtitle1" component="div">
          {flight.airline} {flight.flightNumber}
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        {flight.departureCity} ({flight.departureAirport}) →{' '}
        {flight.arrivalCity} ({flight.arrivalAirport})
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        Duration: {hours}h {minutes}m
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        Departure: {flight.departureDateTime.toLocaleTimeString()}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        Arrival: {flight.arrivalDateTime.toLocaleTimeString()}
      </Typography>

      <Button
        variant={isSelected ? "contained" : "outlined"}
        size="small"
        fullWidth
        onClick={onShowRoute}
        sx={{ mt: 1 }}
      >
        {isSelected ? 'Hide Route' : 'Show Route'}
      </Button>
    </Paper>
  )
}