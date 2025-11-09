import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import NewTripWizard from './pages/NewTripWizard'
import TripDetails from './pages/TripDetails'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trip/new" element={<NewTripWizard />} />
        <Route path="/trips/:id" element={<TripDetails />} />
      </Routes>
    </Layout>
  )
}
