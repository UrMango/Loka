import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  Collapse,
  ImageList,
  ImageListItem,
  Link,
  Alert,
} from '@mui/material';
import {
  Phone,
  Language,
  Schedule,
  AttachMoney,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { placesApi, type PlaceDetails } from '../services/placesApi';

interface PlaceDetailsCardProps {
  place: PlaceDetails;
}

export const PlaceDetailsCard: React.FC<PlaceDetailsCardProps> = ({ place }) => {
  const [expanded, setExpanded] = useState(false);
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Load main photo
  useEffect(() => {
    if (place.photos && place.photos.length > 0) {
      placesApi.getPhotoUrl(place.photos[0].photoReference, 800).then(setMainPhotoUrl);
    }
  }, [place.photos]);

  // Load gallery photos when expanded
  useEffect(() => {
    if (expanded && place.photos && place.photos.length > 1) {
      const loadPhotos = async () => {
        const urls = await Promise.all(
          place.photos!.slice(1, 5).map((photo) =>
            placesApi.getPhotoUrl(photo.photoReference, 200)
          )
        );
        setPhotoUrls(urls);
      };
      loadPhotos();
    }
  }, [expanded, place.photos]);

  const getPriceLevelDisplay = (level?: number | null) => {
    if (level === undefined || level === null) return 'N/A';
    if (level === 0) return 'Free';
    return '$'.repeat(level);
  };

  return (
    <Card sx={{ mb: 2 }}>
      {mainPhotoUrl && (
        <CardMedia
          component="img"
          height="200"
          image={mainPhotoUrl}
          alt={place.name}
        />
      )}

      <CardContent>
        {/* Name and Rating */}
        <Typography variant="h6" gutterBottom>
          {place.name}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {place.rating && (
            <>
              <Rating value={place.rating} precision={0.1} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {place.rating}
                {place.userRatingsTotal && ` (${place.userRatingsTotal.toLocaleString()} reviews)`}
              </Typography>
            </>
          )}
        </Box>

        {/* Address */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {place.address}
        </Typography>

        {/* Price Level */}
        {place.priceLevel !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <AttachMoney fontSize="small" />
            <Typography variant="body2">
              {getPriceLevelDisplay(place.priceLevel)}
            </Typography>
          </Box>
        )}

        {/* Opening Hours */}
        {place.openingHours && (
          <Alert
            severity={place.openingHours.openNow ? 'success' : 'error'}
            icon={place.openingHours.openNow ? <CheckCircle /> : <Cancel />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" fontWeight="bold">
              {place.openingHours.openNow ? 'Open Now' : 'Closed'}
            </Typography>
          </Alert>
        )}

        {/* Types/Categories */}
        {place.types && place.types.length > 0 && (
          <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
            {place.types.slice(0, 4).map((type) => (
              <Chip
                key={type}
                label={type.replace(/_/g, ' ')}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {/* Contact Info */}
        <Box display="flex" flexDirection="column" gap={1} mb={2}>
          {place.phoneNumber && (
            <Box display="flex" alignItems="center" gap={1}>
              <Phone fontSize="small" />
              <Typography variant="body2">{place.phoneNumber}</Typography>
            </Box>
          )}
          {place.website && (
            <Box display="flex" alignItems="center" gap={1}>
              <Language fontSize="small" />
              <Link href={place.website} target="_blank" rel="noopener">
                <Typography variant="body2">Visit Website</Typography>
              </Link>
            </Box>
          )}
        </Box>

        {/* Expand Button */}
        <Button
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          fullWidth
          variant="outlined"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </Button>

        {/* Expandable Content */}
        <Collapse in={expanded}>
          <Box mt={2}>
            {/* Opening Hours Details */}
            {place.openingHours?.weekdayText && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1}>
                  <Schedule fontSize="small" />
                  Opening Hours
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                  {place.openingHours.weekdayText.map((text, index) => (
                    <Typography key={index} variant="body2" component="li" sx={{ mb: 0.5 }}>
                      {text}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* Photo Gallery */}
            {photoUrls.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Photos
                </Typography>
                <ImageList cols={3} gap={8}>
                  {photoUrls.map((url, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={url}
                        alt={`${place.name} ${index + 1}`}
                        loading="lazy"
                        style={{ height: 120, objectFit: 'cover' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {/* Reviews */}
            {place.reviews && place.reviews.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Recent Reviews
                </Typography>
                {place.reviews.slice(0, 3).map((review, index) => (
                  <Box key={index} mb={2} p={1.5} bgcolor="grey.50" borderRadius={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {review.authorName}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {review.text}
                    </Typography>
                    {review.relativeTimeDescription && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        {review.relativeTimeDescription}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default PlaceDetailsCard;
