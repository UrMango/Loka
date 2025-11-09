import type { Airport } from '../types/Flight'

function waitForGoogleMaps(): Promise<typeof google> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google)
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkInterval)
          resolve(window.google)
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        reject(new Error('Google Maps failed to load'))
      }, 10000)
    }
  })
}

export async function searchAirportsWithGooglePlaces(query: string): Promise<Airport[]> {
  try {
    // Wait for Google Maps to be loaded
    await waitForGoogleMaps()
    
    const autocompleteService = new google.maps.places.AutocompleteService()
    const placesService = new google.maps.places.PlacesService(document.createElement('div'))

    // Search for airports using Places Autocomplete
    const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
      autocompleteService.getPlacePredictions(
        {
          input: query,
          types: ['airport']
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results)
          } else {
            reject(new Error('Failed to get airport predictions'))
          }
        }
      )
    })

    // Get detailed information for each airport
    const airports = await Promise.all(
      predictions.map(async (prediction) => {
        return new Promise<Airport>((resolve, reject) => {
          placesService.getDetails(
            {
              placeId: prediction.place_id,
              fields: ['name', 'formatted_address', 'geometry']
            },
            (place, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                // Extract airport code from prediction description (usually in parentheses)
                const codeMatch = prediction.description.match(/\(([^)]+)\)/)
                const code = codeMatch ? codeMatch[1] : ''
                
                // Extract city from address components
                const addressParts = prediction.structured_formatting.main_text.split(',')
                const city = addressParts[0].trim()
                
                resolve({
                  code,
                  name: place.name || '',
                  city,
                  country: addressParts[addressParts.length - 1]?.trim() || '',
                  location: {
                    lat: place.geometry?.location?.lat() || 0,
                    lng: place.geometry?.location?.lng() || 0
                  }
                })
              } else {
                reject(new Error('Failed to get airport details'))
              }
            }
          )
        })
      })
    )

    return airports
  } catch (error) {
    console.error('Error searching airports:', error)
    return []
  }
}