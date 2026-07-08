import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function assignedTo(asset) {
  if (!asset?.assigned_to) return 'Available'
  return `${asset.assigned_to.emp_id} - ${asset.assigned_to.name}`
}

export default function AdminAssetDetailsPage() {
  const { assetId } = useParams()
  const { user, token } = useAuth()
  const [asset, setAsset] = useState(null)
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAssetDetails() {
      setLoading(true)
      setError('')
      try {
        const [assetData, qrData] = await Promise.all([
          api.getAsset(token, assetId),
          api.getAssetQr(token, assetId),
        ])
        setAsset(assetData)
        setQr(qrData)
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : 'Unable to load asset details',
        )
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'admin') {
      loadAssetDetails()
    }
  }, [assetId, token, user])

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <DashboardLayout
      eyebrow="IT Admin"
      title="Asset Details"
      subtitle={asset ? asset.asset_name : 'Review asset information.'}
      backTo="/admin/assets"
    >
      <section className="dashboard-panel qr-result">
        {loading && <p>Loading asset details…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && asset && (
          <>
            {qr?.qr_code_data_url && (
              <div className="qr-preview">
                <img
                  src={qr.qr_code_data_url}
                  alt={`QR code for ${asset.asset_name}`}
                />
              </div>
            )}

            <div className="qr-details">
              <p>Asset Name: {asset.asset_name}</p>
              <p>Serial Number: {asset.asset_serial_no}</p>
              <p>Asset UUID: {asset.id}</p>
              <p>Location: {asset.asset_location_id}</p>
              <p>Status: {asset.status}</p>
              <p>Assigned To: {assignedTo(asset)}</p>
              <p>Created Date: {formatDate(asset.created_at)}</p>
            </div>

            <div className="header-actions">
              {qr?.qr_code_data_url && (
                <a
                  className="btn btn-secondary"
                  href={qr.qr_code_data_url}
                  download={`${asset.asset_serial_no}-qr.png`}
                >
                  Download QR
                </a>
              )}
              <Link
                to={`/admin/assets/${asset.id}/history`}
                className="btn btn-primary"
              >
                View History
              </Link>
            </div>
          </>
        )}
      </section>
    </DashboardLayout>
  )
}
