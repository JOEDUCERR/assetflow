import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AdminAssetHistoryPage from './pages/AdminAssetHistoryPage'
import AdminCreateAssetPage from './pages/AdminCreateAssetPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminAssetDetailsPage from './pages/AdminAssetDetailsPage'
import AdminInventoryPage from './pages/AdminInventoryPage'
import AdminLoginPage from './pages/AdminLoginPage'
import EmployeeDashboardPage from './pages/EmployeeDashboardPage'
import EmployeeLoginPage from './pages/EmployeeLoginPage'
import EmployeeProfileSetupPage from './pages/EmployeeProfileSetupPage'
import EmployeeRegisterPage from './pages/EmployeeRegisterPage'
import EmployeeReturnAssetPage from './pages/EmployeeReturnAssetPage'
import EmployeeTakeAssetPage from './pages/EmployeeTakeAssetPage'
import RoleSelectPage from './pages/RoleSelectPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelectPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/assets" element={<AdminInventoryPage />} />
          <Route path="/admin/assets/new" element={<AdminCreateAssetPage />} />
          <Route path="/admin/assets/:assetId" element={<AdminAssetDetailsPage />} />
          <Route
            path="/admin/assets/:assetId/history"
            element={<AdminAssetHistoryPage />}
          />
          <Route path="/employee/login" element={<EmployeeLoginPage />} />
          <Route path="/employee/register" element={<EmployeeRegisterPage />} />
          <Route
            path="/employee/setup"
            element={<EmployeeProfileSetupPage />}
          />
          <Route path="/employee" element={<EmployeeDashboardPage />} />
          <Route path="/employee/take" element={<EmployeeTakeAssetPage />} />
          <Route path="/employee/return" element={<EmployeeReturnAssetPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
