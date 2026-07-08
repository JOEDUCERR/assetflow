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

function csvValue(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
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

  function handleExportCsv() {
    const headers = [
      'Timestamp',
      'Action',
      'Employee Name',
      'Employee ID',
      'Performed By',
      'Notes',
    ]
    const rows = history.map((entry) => [
      formatDate(entry.created_at),
      formatAction(entry.action),
      entry.employee_name || '',
      entry.employee_id || '',
      entry.performed_by_email || '',
      entry.notes || '',
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map(csvValue).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `asset-history-${assetId}.csv`
    link.click()
    URL.revokeObjectURL(url)
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
          <>
            <div className="header-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleExportCsv}
              >
                Export History (CSV)
              </button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Performed By</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.created_at)}</td>
                      <td>{formatAction(entry.action)}</td>
                      <td>{entry.employee_name || '—'}</td>
                      <td>{entry.employee_id || '—'}</td>
                      <td>{entry.performed_by_email || '—'}</td>
                      <td>{entry.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </DashboardLayout>
  )
}
