import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

const ASSET_CATEGORIES = [
  'Desktop',
  'Laptop',
  'Monitor',
  'Keyboard',
  'Mouse',
  'Headphones',
  'Phone',
  'Printer',
  'Cable',
  'Network Device',
  'Storage Device',
  'Other',
]

export default function EmployeeAssetRequestPage() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [category, setCategory] = useState('')
  const [requestedAssetId, setRequestedAssetId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [expectedDuration, setExpectedDuration] = useState('')
  const [assetOptions, setAssetOptions] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadAssetOptions() {
      try {
        const data = await api.listRequestableAssets(token)
        setAssetOptions(data)
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : 'Unable to load assets',
        )
      }
    }

    if (user?.role === 'employee' && user.profile_complete) {
      loadAssetOptions()
    }
  }, [token, user])

  const filteredAssets = useMemo(
    () =>
      category
        ? assetOptions.filter((asset) => asset.category === category)
        : [],
    [assetOptions, category],
  )

  if (!user || user.role !== 'employee') {
    return <Navigate to="/employee/login" replace />
  }

  if (!user.profile_complete) {
    return <Navigate to="/employee/setup" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.createAssetRequest(token, {
        category,
        requested_asset_id: requestedAssetId || null,
        purpose,
        expected_duration: expectedDuration || null,
      })
      navigate('/employee')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to submit request',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout
      eyebrow="Employee portal"
      title="Request Asset"
      subtitle="Submit an asset request for admin review."
      backTo="/employee"
    >
      <section className="dashboard-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <label className="form-field">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                setRequestedAssetId('')
              }}
              required
            >
              <option value="">Select category</option>
              {ASSET_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Specific Asset</span>
            <select
              value={requestedAssetId}
              onChange={(event) => setRequestedAssetId(event.target.value)}
              disabled={!category}
            >
              <option value="">No specific asset</option>
              {filteredAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.asset_name} - {asset.asset_serial_no}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Purpose</span>
            <textarea
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="Describe why this asset is needed"
              required
            />
          </label>

          <label className="form-field">
            <span>Expected Duration</span>
            <input
              value={expectedDuration}
              onChange={(event) => setExpectedDuration(event.target.value)}
              placeholder="2 weeks"
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </section>
    </DashboardLayout>
  )
}
