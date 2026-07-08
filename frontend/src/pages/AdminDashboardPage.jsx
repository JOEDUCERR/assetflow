import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [assignTarget, setAssignTarget] = useState(null)
  const [empId, setEmpId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadAssets = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.listAssets(token, true)
      setAssets(data)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to load assigned assets',
      )
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadAssets()
  }, [loadAssets])

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  async function handleManualReturn(assetId) {
    setActionError('')
    setActionLoading(true)
    try {
      await api.manualReturnAsset(token, assetId)
      await loadAssets()
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Unable to return asset',
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function handleManualAssign(event) {
    event.preventDefault()
    if (!assignTarget) return

    setActionError('')
    setActionLoading(true)
    try {
      await api.manualAssignAsset(token, assignTarget.id, empId)
      setAssignTarget(null)
      setEmpId('')
      await loadAssets()
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Unable to assign asset',
      )
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <DashboardLayout
      eyebrow="IT Admin"
      title="Assigned assets"
      subtitle={`Signed in as ${user.email}`}
      actions={
        <div className="header-actions">
          <Link to="/admin/assets" className="btn btn-secondary">
            View All Assets
          </Link>
          <Link to="/admin/assets/new" className="btn btn-primary">
            Create asset
          </Link>
          <button type="button" className="btn btn-secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      }
    >
      {error && <div className="form-error">{error}</div>}
      {actionError && <div className="form-error">{actionError}</div>}

      <section className="dashboard-panel">
        {loading ? (
          <p>Loading assigned assets…</p>
        ) : assets.length === 0 ? (
          <p>
            No assets are currently assigned. Create an asset and assign it
            manually or via employee QR scan.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Serial no.</th>
                  <th>Location</th>
                  <th>Assigned to</th>
                  <th>Assigned at</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.asset_name}</td>
                    <td>{asset.asset_serial_no}</td>
                    <td>{asset.asset_location_id}</td>
                    <td>
                      {asset.assigned_to
                        ? `${asset.assigned_to.name} (${asset.assigned_to.emp_id})`
                        : '—'}
                    </td>
                    <td>{formatDate(asset.assigned_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-small btn-secondary"
                          onClick={() =>
                            navigate(`/admin/assets/${asset.id}/history`)
                          }
                        >
                          History
                        </button>
                        <button
                          type="button"
                          className="btn btn-small btn-secondary"
                          onClick={() => {
                            setAssignTarget(asset)
                            setEmpId('')
                          }}
                        >
                          Assign
                        </button>
                        <button
                          type="button"
                          className="btn btn-small btn-primary"
                          disabled={actionLoading}
                          onClick={() => handleManualReturn(asset.id)}
                        >
                          Return
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {assignTarget && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Manually assign asset</h2>
            <p>
              Assign <strong>{assignTarget.asset_name}</strong> to an employee
              using their employee ID.
            </p>
            <form className="auth-form" onSubmit={handleManualAssign}>
              <label className="form-field">
                <span>Employee ID</span>
                <input
                  value={empId}
                  onChange={(event) => setEmpId(event.target.value)}
                  placeholder="EMP-001"
                  required
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAssignTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Assigning…' : 'Assign asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
