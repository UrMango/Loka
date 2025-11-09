import { useEffect, useState } from 'react'
import { listTrips } from '../services/api'
import { Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material'
import { Add, CalendarMonth, Flight } from '@mui/icons-material'

export default function Home() {
  const [trips, setTrips] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listTrips().then(setTrips).catch(e => setError(e.message))
  }, [])

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Your Trips
        </Typography>
        <Button
          component={Link}
          to="/trip/new"
          variant="contained"
          startIcon={<Add />}
          size="large"
        >
          Create New Trip
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!trips && !error && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {trips && trips.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 8, bgcolor: 'background.default' }}>
          <CardContent>
            <Flight sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No trips yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start planning your next adventure
            </Typography>
            <Button
              component={Link}
              to="/trip/new"
              variant="contained"
              startIcon={<Add />}
            >
              Create Your First Trip
            </Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {trips?.map((t) => (
          <Grid item xs={12} sm={6} md={4} key={t.id}>
            <Card>
              <CardActionArea component={Link} to={`/trips/${t.id}`}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t.name || 'Untitled Trip'}
                  </Typography>
                  {t.startDate && t.endDate && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                      <CalendarMonth fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {t.startDate} → {t.endDate}
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
                    {t.flights?.length > 0 && (
                      <Chip size="small" label={`${t.flights.length} flights`} />
                    )}
                    {t.hotels?.length > 0 && (
                      <Chip size="small" label={`${t.hotels.length} hotels`} />
                    )}
                    {t.attractions?.length > 0 && (
                      <Chip size="small" label={`${t.attractions.length} places`} />
                    )}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
