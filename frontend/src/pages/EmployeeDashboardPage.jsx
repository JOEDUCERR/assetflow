import { Link, Navigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

export default function EmployeeDashboardPage() {
  const { user, logout } = useAuth()

  if (!user || user.role !== 'employee') {
    return <Navigate to="/employee/login" replace />
  }

  if (!user.profile_complete) {
    return <Navigate to="/employee/setup" replace />
  }

  return (
    <DashboardLayout
      eyebrow="Employee portal"
      title={`Welcome, ${user.name}`}
      subtitle={`${user.designation} · ${user.emp_id}`}
      actions={
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Sign out
        </button>
      }
    >
      <div className="action-grid">
        <Link to="/employee/take" className="action-card action-card-take">
          <h2>Take an asset</h2>
          <p>Scan the asset QR code to check out equipment.</p>
          <span className="action-cta">Open scanner →</span>
        </Link>

        <Link to="/employee/return" className="action-card action-card-return">
          <h2>Return an asset</h2>
          <p>Scan the asset QR code when returning it to IT.</p>
          <span className="action-cta">Open scanner →</span>
        </Link>
      </div>

      <p className="dashboard-note">
        If the QR scanner does not work, contact the IT team to assign or return
        the asset manually.
      </p>
    </DashboardLayout>
  )
}
