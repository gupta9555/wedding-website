import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import MyBookings from './MyBookings.jsx'
import ClientProfile from './ClientProfile.jsx'
import Favorites from './Favorites.jsx'

const links = [
  { to: '/client/bookings', label: 'My Bookings', end: false },
  { to: '/client/favorites', label: 'Saved Providers', end: false },
  { to: '/client/profile', label: 'Profile', end: false },
]

export default function ClientDashboard() {
  return (
    <DashboardLayout title="Client Dashboard" links={links}>
      <Routes>
        <Route index element={<Navigate to="bookings" replace />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="profile" element={<ClientProfile />} />
      </Routes>
    </DashboardLayout>
  )
}
