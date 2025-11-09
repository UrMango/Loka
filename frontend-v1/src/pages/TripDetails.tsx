import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTrip, Trip } from '../services/api'
import { Typography, CircularProgress, Stack, Card, CardContent, Button } from '@mui/material'

export default function TripDetails() {
  const { id } = useParams<{ id: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getTrip(id).then(setTrip).catch(e => setError(e.message))
    }
  }, [id])

  if (error) return <Typography color="error">Error: {error}</Typography>
  if (!trip) return <CircularProgress />

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={700}>{trip.name || 'Untitled Trip'}</Typography>
      <Card>
        <CardContent>
          <Typography variant="subtitle1">ID: {trip.id}</Typography>
          {trip.startDate && trip.endDate && (
            <Typography variant="body2" color="text.secondary">{trip.startDate} → {trip.endDate}</Typography>
          )}
          {trip.destinations && trip.destinations.length > 0 && (
            <Typography variant="body2" mt={1}>Destinations: {trip.destinations.join(', ')}</Typography>
          )}
        </CardContent>
      </Card>
      <Stack direction="row" spacing={2}>
        <Button component={Link} to="/trips" variant="outlined">Back</Button>
      </Stack>
    </Stack>
  )
}
