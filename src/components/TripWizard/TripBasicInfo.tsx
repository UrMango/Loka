import { TextField, Box, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'

interface TripBasicInfoProps {
  tripData: any
  setTripData: (data: any) => void
}

export default function TripBasicInfo({ tripData, setTripData }: TripBasicInfoProps) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trip Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Let's start with the basics. What's your trip name and when are you traveling?
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        <TextField
          fullWidth
          required
          label="Trip Name"
          placeholder="e.g., Summer Vacation to Paris"
          value={tripData.name}
          onChange={(e) => setTripData({ ...tripData, name: e.target.value })}
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <DatePicker
              label="Start Date *"
              value={tripData.startDate}
              onChange={(date) => setTripData({ ...tripData, startDate: date })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <DatePicker
              label="End Date *"
              value={tripData.endDate}
              onChange={(date) => setTripData({ ...tripData, endDate: date })}
              minDate={tripData.startDate || undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
          </Box>
        </Box>

        <TextField
          fullWidth
          type="number"
          label="Budget (Optional)"
          placeholder="e.g., 5000"
          value={tripData.budget || ''}
          onChange={(e) => setTripData({ ...tripData, budget: e.target.value })}
          InputProps={{
            startAdornment: '$'
          }}
          helperText="You can leave this empty and set it later"
        />
      </Box>
    </Box>
  )
}
