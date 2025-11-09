import { Link, NavLink } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Container, Box, Chip } from '@mui/material'
import { Flight, Dashboard } from '@mui/icons-material'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Flight sx={{ mr: 1, color: 'primary.main' }} />
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 0, 
              mr: 4,
              textDecoration: 'none', 
              color: 'primary.main',
              fontWeight: 700
            }}
          >
            Meet Loca
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component={NavLink}
              to="/"
              startIcon={<Dashboard />}
              sx={({ palette }) => ({
                color: 'text.secondary',
                '&.active': { 
                  color: 'primary.main',
                  bgcolor: 'primary.50',
                  fontWeight: 600
                }
              })}
            >
              Dashboard
            </Button>
            <Button
              component={NavLink}
              to="/trip/new"
              startIcon={<Flight />}
              sx={({ palette }) => ({
                color: 'text.secondary',
                '&.active': { 
                  color: 'primary.main',
                  bgcolor: 'primary.50',
                  fontWeight: 600
                }
              })}
            >
              New Trip
            </Button>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip label="v2" size="small" variant="outlined" color="primary" />
          </Box>
        </Toolbar>
      </AppBar>
      <Container 
        maxWidth="xl" 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: 4,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Container>
    </Box>
  )
}
