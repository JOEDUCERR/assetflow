import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

function formatDate(value) {
  return new Date(value).toLocaleString()
}

function formatAction(action) {
  return action.replace(/_/g, ' ')
}

export default function AdminAssetHistoryPage() {
  const { assetId } = useParams()
  const { user, token } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadHistory() {
      setLoading(true)
      setError('')
      try {
        const data = await api.getAssetHistory(token, assetId)
        setHistory(data)
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : 'Unable to load asset history',
        )
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'admin') {
      loadHistory()
    }
  }, [assetId, token, user])

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <DashboardLayout
      eyebrow="IT Admin"
      title="Asset history"
      subtitle="Timeline of assignments, returns, and admin actions."
      backTo="/admin"
    >
      <section className="dashboard-panel">
        {loading && <p>Loading history…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && history.length === 0 && (
          <p>No history recorded for this asset yet.</p>
        )}

        {!loading && history.length > 0 && (
          <div className="history-list">
            {history.map((entry) => (
              <article key={entry.id} className="history-item">
                <div className="history-item-header">
                  <strong>{formatAction(entry.action)}</strong>
                  <span>{formatDate(entry.created_at)}</span>
                </div>
                <p>By: {entry.performed_by_email}</p>
                {entry.employee_name && (
                  <p>
                    Employee: {entry.employee_name}
                    {entry.employee_id ? ` (${entry.employee_id})` : ''}
                  </p>
                )}
                {entry.notes && <p className="history-notes">{entry.notes}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
