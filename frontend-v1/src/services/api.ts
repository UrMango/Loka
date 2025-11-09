import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

export type Trip = {
  id: string
  name: string
  startDate?: string
  endDate?: string
  destinations?: string[]
}

export async function listTrips() {
  const res = await api.get<Trip[]>('/trips')
  return res.data
}

export async function getTrip(id: string) {
  const res = await api.get<Trip>(`/trips/${id}`)
  return res.data
}

export async function createTrip(data: Partial<Trip>) {
  const res = await api.post<Trip>('/trips', data)
  return res.data
}
