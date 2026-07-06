import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import EmployeeDashboardPage from './pages/EmployeeDashboardPage'
import EmployeeLoginPage from './pages/EmployeeLoginPage'
import EmployeeProfileSetupPage from './pages/EmployeeProfileSetupPage'
import EmployeeRegisterPage from './pages/EmployeeRegisterPage'
import RoleSelectPage from './pages/RoleSelectPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelectPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/employee/login" element={<EmployeeLoginPage />} />
          <Route path="/employee/register" element={<EmployeeRegisterPage />} />
          <Route
            path="/employee/setup"
            element={<EmployeeProfileSetupPage />}
          />
          <Route path="/employee" element={<EmployeeDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
