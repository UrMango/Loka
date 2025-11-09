import { useState, useCallback, useMemo, useEffect } from 'react'
import { 
  GoogleMap, 
  Marker, 
  DirectionsRenderer,
  Autocomplete,
  Polyline,
  OverlayView
} from '@react-google-maps/api'
import {
  Box,
  CircularProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  List
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit'
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DraggableLocation } from './DraggableLocation'
import { FlightInfoBox } from './FlightInfoBox'
import type { Flight } from '../types/Flight'
import { GOOGLE_MAPS_API_KEY, defaultMapConfig } from '../config/maps'

interface MapLocation {
  id: string
  lat: number
  lng: number
  title: string
  address?: string
}

interface TripMapProps {
  locations: MapLocation[]
  flights?: Flight[]
  showDirections?: boolean
  height?: string | number
  onLocationsChange?: (locations: MapLocation[]) => void
  editable?: boolean
}

type TravelMode = 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING'

const TripMap = ({ 
  locations = [], 
  flights = [],
  showDirections = true, 
  height = 400,
  onLocationsChange,
  editable = false
}: TripMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVING')
  const [loading, setLoading] = useState(false)

  const [selectedFlight, setSelectedFlight] = useState<string | null>(null)

  // Helper function to get airport coordinates
  const getAirportCoordinates = (code: string) => {
    // This should be replaced with actual airport coordinate lookup
    const airportCoords: Record<string, google.maps.LatLngLiteral> = {
      'TLV': { lat: 32.0055, lng: 34.8854 },
      'DXB': { lat: 25.2532, lng: 55.3657 },
      'JFK': { lat: 40.6413, lng: -73.7781 },
      'LHR': { lat: 51.4700, lng: -0.4543 },
      'CDG': { lat: 49.0097, lng: 2.5479 },
      // Add more airports as needed
    }
    return airportCoords[code]
  }

  const center = useMemo(() => {
    const bounds = new google.maps.LatLngBounds()
    
    // Add locations to bounds
    locations.forEach(location => {
      bounds.extend({ lat: location.lat, lng: location.lng })
    })
    
    // Add flight departure and arrival points to bounds
    flights?.forEach(flight => {
      const departureCoords = getAirportCoordinates(flight.departureAirport)
      const arrivalCoords = getAirportCoordinates(flight.arrivalAirport)
      
      if (departureCoords && arrivalCoords) {
        bounds.extend(departureCoords)
        bounds.extend(arrivalCoords)
      }
    })
    
    return bounds.isEmpty() 
      ? (locations.length > 0 ? locations[0] : defaultMapConfig.center)
      : bounds.getCenter().toJSON()
  }, [locations, flights])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Calculate and display directions when there are multiple locations
  const onSearchBoxLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setSearchBox(autocomplete)
  }, [])

  const onPlaceSelected = useCallback(() => {
    if (searchBox) {
      const place = searchBox.getPlace()
      if (place.geometry?.location) {
        const newLocation: MapLocation = {
          id: crypto.randomUUID(),
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          title: place.name || '',
          address: place.formatted_address
        }
        onLocationsChange?.([...locations, newLocation])
      }
    }
  }, [searchBox, locations, onLocationsChange])

  const handleTravelModeChange = useCallback((_: React.MouseEvent<HTMLElement>, newMode: TravelMode) => {
    if (newMode) {
      setTravelMode(newMode)
    }
  }, [])

  const calculateDirections = useCallback(async () => {
    if (locations.length < 2 || !map) return

    setLoading(true)
    const directionsService = new google.maps.DirectionsService()
    const origin = locations[0]
    const destination = locations[locations.length - 1]
    const waypoints = locations.slice(1, -1).map(location => ({
      location: new google.maps.LatLng(location.lat, location.lng),
      stopover: true
    }))

    try {
      const result = await directionsService.route({
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints,
        travelMode: google.maps.TravelMode[travelMode]
      })
      setDirectionsResponse(result)
    } catch (error) {
      console.error('Error calculating directions:', error)
    } finally {
      setLoading(false)
    }
  }, [locations, map, travelMode])

  useEffect(() => {
    if (showDirections) {
      calculateDirections()
    }
  }, [calculateDirections, showDirections])

  const handleLocationRemove = useCallback((locationId: string) => {
    onLocationsChange?.(locations.filter(loc => loc.id !== locationId))
  }, [locations, onLocationsChange])

  const handleLocationReorder = useCallback((dragIndex: number, hoverIndex: number) => {
    const newLocations = [...locations]
    const [draggedItem] = newLocations.splice(dragIndex, 1)
    newLocations.splice(hoverIndex, 0, draggedItem)
    onLocationsChange?.(newLocations)
  }, [locations, onLocationsChange])

  return (
      <Box sx={{ display: 'flex', gap: 2, height }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && (
          <>
            {editable && (
              <Paper sx={{ width: 300, p: 2, overflow: 'auto' }}>
                <Autocomplete onLoad={onSearchBoxLoad} onPlaceChanged={onPlaceSelected}>
                  <TextField
                    fullWidth
                    placeholder="Search for a location"
                    sx={{ mb: 2 }}
                  />
                </Autocomplete>

                <DndProvider backend={HTML5Backend}>
                  <List>
                    {locations.map((location, index) => (
                      <DraggableLocation
                        key={location.id}
                        location={location}
                        index={index}
                        onMove={handleLocationReorder}
                        onRemove={handleLocationRemove}
                      />
                    ))}
                  </List>
                </DndProvider>
              </Paper>
            )}

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {showDirections && (
                <Paper sx={{ p: 1, mb: 2 }}>
                  <ToggleButtonGroup
                    value={travelMode}
                    exclusive
                    onChange={handleTravelModeChange}
                    size="small"
                  >
                    <ToggleButton value="DRIVING">
                      <DirectionsCarIcon />
                    </ToggleButton>
                    <ToggleButton value="WALKING">
                      <DirectionsWalkIcon />
                    </ToggleButton>
                    <ToggleButton value="TRANSIT">
                      <DirectionsTransitIcon />
                    </ToggleButton>
                    <ToggleButton value="BICYCLING">
                      <DirectionsBikeIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Paper>
              )}

              <Box sx={{ flex: 1, position: 'relative' }}>
                {loading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      zIndex: 1
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}

                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={center}
                  zoom={defaultMapConfig.zoom}
                  options={defaultMapConfig.options}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                >
                  {/* Render locations */}
                  {!showDirections && locations.map((location) => (
                    <Marker
                      key={location.id}
                      position={{ lat: location.lat, lng: location.lng }}
                      title={location.title}
                    />
                  ))}
                  
                  {/* Render flight paths and info boxes */}
                  {flights.map((flight) => {
                    const departureCoords = getAirportCoordinates(flight.departureAirport)
                    const arrivalCoords = getAirportCoordinates(flight.arrivalAirport)
                    
                    if (!departureCoords || !arrivalCoords) return null

                    // Calculate the midpoint for the info box
                    const midpoint = {
                      lat: (departureCoords.lat + arrivalCoords.lat) / 2,
                      lng: (departureCoords.lng + arrivalCoords.lng) / 2
                    }

                    return (
                      <div key={flight.id}>
                        <Polyline
                          path={[departureCoords, arrivalCoords]}
                          options={{
                            strokeColor: selectedFlight === flight.id ? '#2196f3' : '#757575',
                            strokeWeight: selectedFlight === flight.id ? 3 : 2,
                            strokeOpacity: 0.8,
                            geodesic: true
                          }}
                        />
                        <OverlayView
                          position={midpoint}
                          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                          <div onClick={(e) => e.stopPropagation()}>
                            <FlightInfoBox
                              flight={flight}
                              position={midpoint}
                              onShowRoute={() => setSelectedFlight(
                                selectedFlight === flight.id ? null : flight.id
                              )}
                              isSelected={selectedFlight === flight.id}
                            />
                          </div>
                        </OverlayView>
                        <Marker
                          position={departureCoords}
                          icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 7,
                            fillColor: '#4CAF50',
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: '#ffffff',
                          }}
                          title={`${flight.departureCity} (${flight.departureAirport})`}
                        />
                        <Marker
                          position={arrivalCoords}
                          icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 7,
                            fillColor: '#F44336',
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: '#ffffff',
                          }}
                          title={`${flight.arrivalCity} (${flight.arrivalAirport})`}
                        />
                      </div>
                    )
                  })}

                  {/* Render directions if needed */}
                  {showDirections && directionsResponse && (
                    <DirectionsRenderer 
                      directions={directionsResponse}
                      options={{
                        suppressMarkers: false,
                        markerOptions: {
                          visible: true
                        }
                      }}
                    />
                  )}
                </GoogleMap>
              </Box>
            </Box>
          </>
        )}
      </Box>
  )
}

export default TripMap