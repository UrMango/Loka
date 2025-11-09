import type { FC } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Rating
} from '@mui/material'
import { format } from 'date-fns'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import type { Hotel } from '../types/Hotel'

interface HotelCardProps {
  hotel: Hotel
  onEdit?: (hotel: Hotel) => void
  onDelete?: (hotelId: string) => void
}

const HotelCard: FC<HotelCardProps> = ({ hotel, onEdit, onDelete }) => {
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {hotel.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {hotel.formattedAddress || hotel.location?.address || 'Address not available'}
              </Typography>
            </Box>
            {hotel.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={hotel.rating} readOnly precision={0.5} size="small" />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {hotel.rating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onEdit && (
              <IconButton onClick={() => onEdit(hotel)} size="small" sx={{ color: 'primary.main' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton onClick={() => onDelete(hotel.id)} size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 2,
          bgcolor: '#f8fafc',
          p: 2,
          borderRadius: 2,
          mb: 2
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Check-in
            </Typography>
            <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
              {format(new Date(hotel.checkIn), 'MMM dd, yyyy')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Check-out
            </Typography>
            <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
              {format(new Date(hotel.checkOut), 'MMM dd, yyyy')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={`$${hotel.pricePerNight}/night`}
            sx={{ bgcolor: '#fce7f3', color: '#9f1239', fontWeight: 600 }}
            size="small"
          />
          <Chip
            label={hotel.roomType || 'Standard Room'}
            sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}
            size="small"
          />
          {hotel.bookingReference && (
            <Chip
              label="Confirmed"
              sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 600 }}
              size="small"
            />
          )}
        </Box>

        {hotel.amenities && hotel.amenities.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Amenities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {hotel.amenities.slice(0, 4).map((amenity, index) => (
                <Chip
                  key={index}
                  label={amenity}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
              {hotel.amenities.length > 4 && (
                <Chip
                  label={`+${hotel.amenities.length - 4} more`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default HotelCard
