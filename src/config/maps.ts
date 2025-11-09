export const GOOGLE_MAPS_API_KEY = 'AIzaSyCN_j0KQ_PRAyetGnMN2OZn_2MLunsswQI'

export const defaultMapConfig = {
  center: { lat: 48.8566, lng: 2.3522 }, // Paris by default
  zoom: 13,
  options: {
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
  }
}