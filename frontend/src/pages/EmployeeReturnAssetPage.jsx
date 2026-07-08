import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import QrScanner from '../components/QrScanner'
import { useAuth } from '../context/AuthContext'

export default function EmployeeReturnAssetPage() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [scanError, setScanError] = useState('')
  const [success, setSuccess] = useState(null)
  const [preview, setPreview] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [scannerActive, setScannerActive] = useState(true)

  useEffect(() => {
    if (!success) return undefined

    const timer = setTimeout(() => {
      navigate('/employee')
    }, 1200)

    return () => clearTimeout(timer)
  }, [navigate, success])

  const handleScan = useCallback(
    async (decodedText) => {
      if (processing) return

      setProcessing(true)
      setScannerActive(false)
      setScanError('')

      try {
        const asset = await api.previewAssetByScan(token, decodedText)
        setPreview({ asset, qrToken: decodedText })
      } catch (err) {
        setScanError(
          err instanceof ApiError
            ? `${err.message} Contact the IT team if you need help returning this asset.`
            : 'Scan failed. Contact the IT team if you need help returning this asset.',
        )
        setScannerActive(true)
      } finally {
        setProcessing(false)
      }
    },
    [processing, token],
  )

  async function handleConfirm() {
    if (!preview) return

    setProcessing(true)
    setScanError('')

    try {
      const result = await api.returnAssetByScan(token, preview.qrToken)
      setSuccess(result)
    } catch (err) {
      setScanError(
        err instanceof ApiError
          ? `${err.message} Contact the IT team if you need help returning this asset.`
          : 'Return failed. Contact the IT team if you need help returning this asset.',
      )
      setPreview(null)
      setScannerActive(true)
    } finally {
      setProcessing(false)
    }
  }

  function handleCancel() {
    setPreview(null)
    setScanError('')
    setScannerActive(true)
  }

  if (!user || user.role !== 'employee') {
    return <Navigate to="/employee/login" replace />
  }

  if (!user.profile_complete) {
    return <Navigate to="/employee/setup" replace />
  }

  if (success) {
    return (
      <DashboardLayout
        eyebrow="Employee portal"
        title="Asset returned"
        subtitle={success.message}
        backTo="/employee"
      >
        <section className="dashboard-panel success-panel">
          <p>
            <strong>{success.asset.asset_name}</strong> has been returned
            successfully.
          </p>
          <p>Returning to your dashboard…</p>
        </section>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      eyebrow="Employee portal"
      title="Return an asset"
      subtitle="Scan the asset QR code to mark it as returned."
      backTo="/employee"
    >
      <section className="dashboard-panel">
        {scanError && <div className="form-error">{scanError}</div>}
        {processing && <p className="scanner-status">Processing scan…</p>}

        {preview ? (
          <div className="success-panel">
            <h2>Confirm asset return</h2>
            <p>Asset Name: {preview.asset.asset_name}</p>
            <p>Serial Number: {preview.asset.asset_serial_no}</p>
            <p>Location: {preview.asset.asset_location_id}</p>
            <p>Current Status: {preview.asset.status}</p>
            <div className="header-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? 'Returning…' : 'Confirm'}
              </button>
            </div>
          </div>
        ) : (
          <QrScanner
            active={scannerActive}
            onScan={handleScan}
            onError={(message) => setScanError(message)}
          />
        )}

        <p className="dashboard-note">
          Scanner not working? Contact the IT team to return the asset manually.
        </p>
      </section>
    </DashboardLayout>
  )
}
