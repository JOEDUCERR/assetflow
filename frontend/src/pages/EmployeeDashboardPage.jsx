import { Navigate } from 'react-router-dom'
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
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Employee portal</p>
          <h1>Welcome, {user.name}</h1>
          <p className="dashboard-subtitle">
            {user.designation} · {user.emp_id}
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Sign out
        </button>
      </header>

      <div className="action-grid">
        <article className="action-card action-card-take">
          <h2>Take an asset</h2>
          <p>Scan a QR code to check out equipment assigned to you.</p>
          <span className="action-badge">Phase 2</span>
        </article>

        <article className="action-card action-card-return">
          <h2>Return an asset</h2>
          <p>Scan the asset QR code when returning it to IT.</p>
          <span className="action-badge">Phase 2</span>
        </article>
      </div>

      <p className="dashboard-note">
        QR scanning and asset workflows will be added in the next phase. If
        scanning fails, contact the IT team for manual assignment.
      </p>
    </div>
  )
}
