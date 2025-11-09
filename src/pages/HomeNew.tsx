import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
} from '@mui/material'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import HotelIcon from '@mui/icons-material/Hotel'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AttractionsIcon from '@mui/icons-material/Attractions'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Layout from '../components/Layout'

const Home = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <FlightTakeoffIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Book Flights',
      description: 'Search and add flights to your itinerary with real-time data'
    },
    {
      icon: <HotelIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Find Hotels',
      description: 'Discover and book accommodations for your entire trip'
    },
    {
      icon: <DirectionsCarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Plan Transport',
      description: 'Arrange rides and transportation between locations'
    },
    {
      icon: <AttractionsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Explore Activities',
      description: 'Find attractions and things to do at your destination'
    }
  ]

  return (
    <Layout>
      <Box>
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
            color: 'white',
            py: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
              <Box sx={{ flex: { md: '0 0 58%' } }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  Plan Your Perfect Trip
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Create detailed itineraries with flights, hotels, transportation, and activities all in one place.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/trip/new')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Create New Trip
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/trips')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    View My Trips
                  </Button>
                </Stack>
              </Box>
              <Box sx={{ flex: { md: '0 0 42%' }, display: { xs: 'none', md: 'block' } }}>
                <Box
                  sx={{
                    fontSize: '15rem',
                    textAlign: 'center',
                    opacity: 0.3,
                  }}
                >
                  ✈️
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom fontWeight={700}>
              Everything You Need
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Plan every aspect of your journey from start to finish
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {features.map((feature, index) => (
              <Card
                key={index}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>

        {/* CTA Section */}
        <Box sx={{ bgcolor: '#f8fafc', py: 8 }}>
          <Container maxWidth="md">
            <Card
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h3" gutterBottom fontWeight={700}>
                Ready to Start Planning?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
                Create your first trip in minutes
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/trip/new')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                  },
                }}
              >
                Get Started Now
              </Button>
            </Card>
          </Container>
        </Box>
      </Box>
    </Layout>
  )
}

export default Home
