import { useEffect, useState } from 'react'
import { listTrips, Trip } from '../services/api'
import { CircularProgress, Typography, Stack, Card, CardContent, Button } from '@mui/material'
import { Link } from 'react-router-dom'

export default function Trips() {
  const [trips, setTrips] = useState<Trip[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listTrips().then(setTrips).catch(e => setError(e.message))
  }, [])

  if (error) return <Typography color="error">Error: {error}</Typography>
  if (!trips) return <CircularProgress />

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={700}>Trips</Typography>
      {trips.length === 0 && <Typography>No trips yet.</Typography>}
      {trips.map(t => (
        <Card key={t.id} component={Link} to={`/trips/${t.id}`} sx={{ textDecoration: 'none' }}>
          <CardContent>
            <Typography variant="h6">{t.name || 'Untitled Trip'}</Typography>
            {t.startDate && t.endDate && (
              <Typography variant="body2" color="text.secondary">{t.startDate} → {t.endDate}</Typography>
            )}
          </CardContent>
        </Card>
      ))}
      <Button variant="contained" component={Link} to="/trip/new">New Trip</Button>
    </Stack>
  )
}
