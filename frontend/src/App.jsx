import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import SuperadminDashboard from './pages/SuperadminDashboard'
import LaundryDashboard from './pages/LaundryDashboard'
import Services from './pages/Services'
import Members from './pages/Members'
import InputOrder from './pages/InputOrder'
import EditOrder from './pages/EditOrder'
import Orders from './pages/Orders'
import ProductionTracking from './pages/ProductionTracking'
import PublicTracking from './pages/PublicTracking'
import Employees from './pages/Employees'
import CashierDashboard from './pages/CashierDashboard'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/track" element={<PublicTracking />} />

        <Route
          path="/superadmin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperadminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laundry-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin_laundry']}>
              <LaundryDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/services"
          element={
            <ProtectedRoute allowedRoles={['admin_laundry']}>
              <Services />
            </ProtectedRoute>
          }
        />

        <Route
          path="/members"
          element={
            <ProtectedRoute allowedRoles={['admin_laundry', 'kasir']}>
              <Members />
            </ProtectedRoute>
          }
        />

        <Route
          path="/input-order"
          element={
            <ProtectedRoute allowedRoles={['admin_laundry', 'kasir']}>
              <InputOrder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-order/:id"
          element={
            <ProtectedRoute allowedRoles={['admin_laundry', 'kasir']}>
              <EditOrder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['admin_laundry', 'kasir']}>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/production-tracking"
          element={
            <ProtectedRoute allowedRoles={['admin_laundry', 'kasir', 'produksi']}>
              <ProductionTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={['admin_laundry']}>
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cashier-dashboard"
          element={
            <ProtectedRoute allowedRoles={['kasir']}>
              <CashierDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['admin_laundry', 'kasir', 'produksi']}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
