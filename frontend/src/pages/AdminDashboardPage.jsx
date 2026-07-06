import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">IT Admin</p>
          <h1>Asset management</h1>
          <p className="dashboard-subtitle">
            Signed in as {user.email}. Full asset tools arrive in the next phase.
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Sign out
        </button>
      </header>

      <section className="dashboard-panel">
        <h2>Coming next</h2>
        <ul className="feature-list">
          <li>View all currently assigned assets</li>
          <li>Create assets and generate QR codes</li>
          <li>Manual assign and return by employee ID</li>
          <li>Asset history lookup</li>
        </ul>
      </section>
    </div>
  )
}
