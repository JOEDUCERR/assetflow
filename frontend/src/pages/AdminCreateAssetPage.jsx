import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
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

export default function AdminCreateAssetPage() {
  const { user, token } = useAuth()
  const [assetName, setAssetName] = useState('')
  const [locationId, setLocationId] = useState('')
  const [serialNo, setSerialNo] = useState('')
  const [category, setCategory] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null)

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await api.createAsset(token, {
        asset_name: assetName,
        asset_location_id: locationId,
        asset_serial_no: serialNo,
        category,
        manufacturer,
        model,
      })
      setCreated(result)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to create asset',
      )
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <DashboardLayout
        eyebrow="IT Admin"
        title="Asset created"
        subtitle="Print or save this QR code. Employees will scan it to take or return the asset."
        backTo="/admin"
      >
        <section className="dashboard-panel qr-result">
          <div className="qr-preview">
            <img
              src={created.qr_code_data_url}
              alt={`QR code for ${created.asset.asset_name}`}
            />
          </div>
          <div className="qr-details">
            <p>
              <strong>{created.asset.asset_name}</strong>
            </p>
            <p>Serial: {created.asset.asset_serial_no}</p>
            <p>Category: {created.asset.category}</p>
            <p>Manufacturer: {created.asset.manufacturer}</p>
            <p>Model: {created.asset.model}</p>
            <p>Location: {created.asset.asset_location_id}</p>
            <p>Status: {created.asset.status}</p>
          </div>
          <div className="header-actions">
            <Link to="/admin/assets/new" className="btn btn-secondary">
              Create another
            </Link>
            <Link to="/admin" className="btn btn-primary">
              Back to dashboard
            </Link>
          </div>
        </section>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      eyebrow="IT Admin"
      title="Create asset"
      subtitle="Add asset details. A unique QR code will be generated after submission."
      backTo="/admin"
    >
      <section className="dashboard-panel">
        <form className="auth-form asset-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <label className="form-field">
            <span>Asset name</span>
            <input
              value={assetName}
              onChange={(event) => setAssetName(event.target.value)}
              placeholder="Dell Latitude 7420"
              required
            />
          </label>

          <label className="form-field">
            <span>Location ID</span>
            <input
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
              placeholder="LOC-IT-01"
              required
            />
          </label>

          <label className="form-field">
            <span>Serial number</span>
            <input
              value={serialNo}
              onChange={(event) => setSerialNo(event.target.value)}
              placeholder="SN-123456789"
              required
            />
          </label>

          <label className="form-field">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
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
            <span>Manufacturer</span>
            <input
              value={manufacturer}
              onChange={(event) => setManufacturer(event.target.value)}
              placeholder="Dell"
              required
            />
          </label>

          <label className="form-field">
            <span>Model</span>
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Latitude 7420"
              required
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create asset & generate QR'}
          </button>
        </form>
      </section>
    </DashboardLayout>
  )
}
