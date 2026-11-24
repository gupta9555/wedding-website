import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Overview from './Overview.jsx'
import MyProfile from './MyProfile.jsx'
import MyServices from './MyServices.jsx'
import ServiceForm from './ServiceForm.jsx'
import ProviderBookings from './ProviderBookings.jsx'

const links = [
  { to: '/provider', label: 'Overview', end: true },
  { to: '/provider/profile', label: 'Business Profile', end: false },
  { to: '/provider/services', label: 'Services', end: false },
  { to: '/provider/bookings', label: 'Booking Requests', end: false },
]

export default function ProviderDashboard() {
  return (
    <DashboardLayout title="Provider Dashboard" links={links}>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="services" element={<MyServices />} />
        <Route path="services/new" element={<ServiceForm />} />
        <Route path="services/:id/edit" element={<ServiceForm />} />
        <Route path="bookings" element={<ProviderBookings />} />
        <Route path="*" element={<Navigate to="/provider" replace />} />
      </Routes>
    </DashboardLayout>
  )
}
