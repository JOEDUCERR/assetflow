import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

function assignedTo(asset) {
  if (!asset.assigned_to) return 'Available'
  return `${asset.assigned_to.emp_id} - ${asset.assigned_to.name}`
}

export default function AdminInventoryPage() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
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
      const data = await api.listAssets(token)
      setAssets(data)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to load inventory',
      )
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAssets()
    }
  }, [loadAssets, user])

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
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
      title="Inventory"
      subtitle="All assets registered in AssetFlow."
      backTo="/admin"
      actions={
        <Link to="/admin/assets/new" className="btn btn-primary">
          Create Asset
        </Link>
      }
    >
      {error && <div className="form-error">{error}</div>}
      {actionError && <div className="form-error">{actionError}</div>}

      <section className="dashboard-panel">
        {loading ? (
          <p>Loading inventory…</p>
        ) : assets.length === 0 ? (
          <p>No assets have been created yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Serial Number</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Assigned To</th>
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
                      <span className={`status-badge status-badge-${asset.status}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td>{assignedTo(asset)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-small btn-secondary"
                          onClick={() => navigate(`/admin/assets/${asset.id}`)}
                        >
                          View
                        </button>
                        {asset.status === 'available' && (
                          <button
                            type="button"
                            className="btn btn-small btn-primary"
                            onClick={() => {
                              setAssignTarget(asset)
                              setEmpId('')
                            }}
                          >
                            Assign
                          </button>
                        )}
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
