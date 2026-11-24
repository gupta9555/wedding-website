import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Providers from './pages/Providers.jsx'
import ProviderProfile from './pages/ProviderProfile.jsx'
import Blogs from './pages/Blogs.jsx'
import BlogDetail from './pages/BlogDetail.jsx'
import NotFound from './pages/NotFound.jsx'

import ClientDashboard from './pages/client/ClientDashboard.jsx'
import ProviderDashboard from './pages/provider/ProviderDashboard.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/providers/:id" element={<ProviderProfile />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />

            <Route
              path="/client/*"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/*"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
