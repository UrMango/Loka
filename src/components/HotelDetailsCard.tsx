import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  Divider,
  Button,
  Collapse,
  ImageList,
  ImageListItem,
  Link,
} from '@mui/material';
import {
  LocationOn,
  DirectionsCar,
  Schedule,
  ExpandMore,
  Phone,
  Language,
  AttachMoney,
} from '@mui/icons-material';
import { hotelApi, type HotelDetails } from '../services/hotelApi';

interface HotelDetailsCardProps {
  hotel: HotelDetails;
  showDistance?: boolean;
}

// Helper function to get price level display
const getPriceLevelDisplay = (level: number | null | undefined) => {
  if (level === null || level === undefined) return null;
  const symbols = ['Free', '$', '$$', '$$$', '$$$$'];
  return symbols[level] || null;
};

export const HotelDetailsCard: React.FC<HotelDetailsCardProps> = ({
  hotel,
  showDistance = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Load photo URLs
    if (hotel.photos && hotel.photos.length > 0) {
      const loadPhotos = async () => {
        try {
          // Load main photo (larger)
          const mainUrl = await hotelApi.getPhotoUrl(hotel.photos![0].photoReference, 800);
          setMainPhotoUrl(mainUrl);

          // Load thumbnail photos
          const urls = await Promise.all(
            hotel.photos!.slice(0, 4).map(photo => 
              hotelApi.getPhotoUrl(photo.photoReference, 200)
            )
          );
          setPhotoUrls(urls);
        } catch (error) {
          console.error('Error loading photos:', error);
        }
      };
      loadPhotos();
    }
  }, [hotel.photos]);

  return (
    <Card elevation={3} sx={{ width: '100%' }}>
      {mainPhotoUrl && (
        <CardMedia
          component="img"
          height="200"
          image={mainPhotoUrl}
          alt={hotel.name}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div">
            {hotel.name}
          </Typography>
          {hotel.priceLevel !== null && hotel.priceLevel !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachMoney fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                {getPriceLevelDisplay(hotel.priceLevel)}
              </Typography>
            </Box>
          )}
        </Box>

        {hotel.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Rating value={hotel.rating} precision={0.1} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              {hotel.rating.toFixed(1)}
            </Typography>
            {hotel.userRatingsTotal && (
              <Typography variant="caption" color="text.secondary">
                ({hotel.userRatingsTotal.toLocaleString()} reviews)
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <LocationOn color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {hotel.address}
          </Typography>
        </Box>

        {/* Contact Information */}
        {(hotel.phoneNumber || hotel.website) && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {hotel.phoneNumber && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="caption">{hotel.phoneNumber}</Typography>
              </Box>
            )}
            {hotel.website && (
              <Link href={hotel.website} target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Language fontSize="small" />
                <Typography variant="caption">Website</Typography>
              </Link>
            )}
          </Box>
        )}

        {showDistance && hotel.distance && hotel.duration && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Distance from Airport
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsCar color="action" fontSize="small" />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {hotel.distance.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Distance
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule color="action" fontSize="small" />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {hotel.duration.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Drive time
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}

        {hotel.types && hotel.types.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {hotel.types.slice(0, 3).map((type) => (
              <Chip
                key={type}
                label={type.replace(/_/g, ' ')}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {/* Expandable section for photos and reviews */}
        {(photoUrls.length > 1 || (hotel.reviews && hotel.reviews.length > 0)) && (
          <>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                size="small"
                endIcon={<ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show Less' : `Show More (${photoUrls.length > 1 ? 'Photos' : ''}${photoUrls.length > 1 && hotel.reviews?.length ? ' & ' : ''}${hotel.reviews?.length ? 'Reviews' : ''})`}
              </Button>
            </Box>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
              {photoUrls.length > 1 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Photos
                  </Typography>
                  <ImageList cols={3} gap={8} sx={{ mt: 1 }}>
                    {photoUrls.map((url, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={url}
                          alt={`${hotel.name} photo ${index + 1}`}
                          loading="lazy"
                          style={{ borderRadius: 4, objectFit: 'cover', height: '100px' }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {hotel.reviews && hotel.reviews.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recent Reviews
                  </Typography>
                  {hotel.reviews.map((review, index) => (
                    <Box key={index} sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {review.authorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {review.relativeTimeDescription}
                        </Typography>
                      </Box>
                      <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {review.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Collapse>
          </>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Coordinates: {hotel.lat.toFixed(4)}, {hotel.lng.toFixed(4)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
