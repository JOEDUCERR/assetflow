import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

export default function RoleSelectPage() {
  return (
    <AuthLayout
      title="Welcome"
      subtitle="Choose how you want to sign in to AssetFlow."
    >
      <div className="role-grid">
        <Link to="/admin/login" className="role-card role-card-admin">
          <span className="role-icon" aria-hidden="true">
            🛡️
          </span>
          <h2>IT Admin</h2>
          <p>Manage assets, assignments, and returns across the organization.</p>
          <span className="role-cta">Sign in as admin →</span>
        </Link>

        <Link to="/employee/login" className="role-card role-card-employee">
          <span className="role-icon" aria-hidden="true">
            👤
          </span>
          <h2>Employee</h2>
          <p>Take or return assigned assets using your employee account.</p>
          <span className="role-cta">Sign in as employee →</span>
        </Link>
      </div>
    </AuthLayout>
  )
}
