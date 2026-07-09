import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

export default function AdminAssetRequestsPage() {
  const { user, token } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.listAssetRequests(token)
      setRequests(data)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to load asset requests',
      )
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadRequests()
    }
  }, [loadRequests, user])

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  async function handleStatus(requestId, status) {
    setActionLoading(true)
    setError('')
    try {
      await api.updateAssetRequestStatus(token, requestId, status)
      await loadRequests()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to update request',
      )
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <DashboardLayout
      eyebrow="IT Admin"
      title="Asset Requests"
      subtitle="Review employee asset requests."
      backTo="/admin"
    >
      {error && <div className="form-error">{error}</div>}

      <section className="dashboard-panel">
        {loading ? (
          <p>Loading asset requests…</p>
        ) : requests.length === 0 ? (
          <p>No asset requests submitted yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Category</th>
                  <th>Requested Asset</th>
                  <th>Purpose</th>
                  <th>Expected Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.employee_name || '—'}</td>
                    <td>{request.employee_id || '—'}</td>
                    <td>{request.category}</td>
                    <td>{request.requested_asset_name || '—'}</td>
                    <td>{request.purpose}</td>
                    <td>{request.expected_duration || '—'}</td>
                    <td>{request.status}</td>
                    <td>
                      {request.status === 'Pending' ? (
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn btn-small btn-primary"
                            disabled={actionLoading}
                            onClick={() => handleStatus(request.id, 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-small btn-secondary"
                            disabled={actionLoading}
                            onClick={() => handleStatus(request.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        '—'
                      )}
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
