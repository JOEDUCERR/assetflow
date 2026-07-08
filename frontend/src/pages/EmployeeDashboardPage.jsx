import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

export default function EmployeeDashboardPage() {
  const { user, token, logout } = useAuth()
  const [assets, setAssets] = useState([])
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [assetsError, setAssetsError] = useState('')

  const loadMyAssets = useCallback(async () => {
    setLoadingAssets(true)
    setAssetsError('')
    try {
      const data = await api.getMyAssets(token)
      setAssets(data)
    } catch (err) {
      setAssetsError(
        err instanceof ApiError ? err.message : 'Unable to load your assets',
      )
    } finally {
      setLoadingAssets(false)
    }
  }, [token])

  useEffect(() => {
    if (user?.role === 'employee' && user.profile_complete) {
      loadMyAssets()
    }
  }, [loadMyAssets, user])

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

      <section className="dashboard-panel">
        <h2>My Assets</h2>
        {assetsError && <div className="form-error">{assetsError}</div>}
        {loadingAssets ? (
          <p>Loading your assets…</p>
        ) : assets.length === 0 ? (
          <p>No assets are currently assigned to you.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Serial Number</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.asset_name}</td>
                    <td>{asset.asset_serial_no}</td>
                    <td>{asset.asset_location_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="dashboard-note">
        If the QR scanner does not work, contact the IT team to assign or return
        the asset manually.
      </p>
    </DashboardLayout>
  )
}
