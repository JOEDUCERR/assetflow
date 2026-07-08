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
                    <td>{asset.status}</td>
                    <td>{assignedTo(asset)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-small btn-secondary"
                        onClick={() => navigate(`/admin/assets/${asset.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
