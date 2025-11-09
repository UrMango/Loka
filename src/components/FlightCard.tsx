import type { FC } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material'
import { format } from 'date-fns'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import FlightIcon from '@mui/icons-material/Flight'
import type { Flight } from '../types/Flight'

interface FlightCardProps {
  flight: Flight
  onEdit?: (flight: Flight) => void
  onDelete?: (flightId: string) => void
}

const FlightCard: FC<FlightCardProps> = ({ flight, onEdit, onDelete }) => {
  return (
    <Card 
      sx={{ 
        mb: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {flight.airline}
            </Typography>
            <Chip 
              label={`Flight ${flight.flightNumber}`} 
              size="small"
              sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 600 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onEdit && (
              <IconButton onClick={() => onEdit(flight)} size="small" sx={{ color: 'primary.main' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton onClick={() => onDelete(flight.id)} size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr', 
          gap: 3, 
          alignItems: 'center',
          bgcolor: '#f8fafc',
          p: 2,
          borderRadius: 2,
          mb: 2
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Departure
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
              {(flight as any).departureAirportCode || flight.departureAirport?.code || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(flight as any).departureCity || flight.departureAirport?.city || 'N/A'}
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
              {(flight as any).departureTimeLocal 
                ? (flight as any).departureTimeLocal 
                : format(new Date(flight.departureDateTime), 'MMM dd, HH:mm')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
            <FlightIcon sx={{ fontSize: 28, color: 'primary.main', transform: 'rotate(90deg)' }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Arrival
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
              {(flight as any).arrivalAirportCode || flight.arrivalAirport?.code || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(flight as any).arrivalCity || flight.arrivalAirport?.city || 'N/A'}
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
              {(flight as any).arrivalTimeLocal 
                ? (flight as any).arrivalTimeLocal 
                : format(new Date(flight.arrivalDateTime), 'MMM dd, HH:mm')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={`$${flight.price.toLocaleString()}`}
            sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 600 }}
            size="small"
          />
          {flight.layovers > 0 && (
            <Chip
              label={`${flight.layovers} ${flight.layovers === 1 ? 'stop' : 'stops'}`}
              sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}
              size="small"
            />
          )}
          {flight.bookingConfirmation && (
            <Chip
              label="Confirmed"
              sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 600 }}
              size="small"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default FlightCard