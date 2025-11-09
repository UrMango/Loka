import { useState } from 'react'
import { createTrip } from '../services/api'
import { TextField, Stack, Button, Typography, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function NewTrip() {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const trip = await createTrip({ name })
      navigate(`/trips/${trip.id}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>Create Trip</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Trip Name" value={name} onChange={e => setName(e.target.value)} required />
        <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
      </Stack>
    </form>
  )
}
