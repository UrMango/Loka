import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import HomeNew from './pages/HomeNew'
import TripList from './pages/TripList'
import CreateTripWizard from './pages/CreateTripWizard'
import TripDetails from './pages/TripDetails'
import { theme } from './theme/theme'
import { GoogleMapsProvider } from './components/GoogleMapsProvider'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <GoogleMapsProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomeNew />} />
              <Route path="/trips" element={<TripList />} />
              <Route path="/trip/new" element={<CreateTripWizard />} />
              <Route path="/trip/:id" element={<TripDetails />} />
            </Routes>
          </Router>
        </GoogleMapsProvider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
