import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import AdminOverview from './AdminOverview.jsx'
import ManageProviders from './ManageProviders.jsx'

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/providers', label: 'Providers', end: false },
]

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard" links={links}>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="providers" element={<ManageProviders />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardLayout>
  )
}
