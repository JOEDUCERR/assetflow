import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import QrScanner from '../components/QrScanner'
import { useAuth } from '../context/AuthContext'

export default function EmployeeTakeAssetPage() {
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
            ? `${err.message} Contact the IT team to assign the asset manually.`
            : 'Scan failed. Contact the IT team to assign the asset manually.',
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
      const result = await api.takeAssetByScan(token, preview.qrToken)
      setSuccess(result)
    } catch (err) {
      setScanError(
        err instanceof ApiError
          ? `${err.message} Contact the IT team to assign the asset manually.`
          : 'Assignment failed. Contact the IT team to assign the asset manually.',
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
        title="Asset taken"
        subtitle={success.message}
        backTo="/employee"
      >
        <section className="dashboard-panel success-panel">
          <p>
            <strong>{success.asset.asset_name}</strong> is now assigned to you.
          </p>
          <p>Serial: {success.asset.asset_serial_no}</p>
          <p>Returning to your dashboard…</p>
        </section>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      eyebrow="Employee portal"
      title="Take an asset"
      subtitle="Point your camera at the asset QR code to check it out."
      backTo="/employee"
    >
      <section className="dashboard-panel">
        {scanError && <div className="form-error">{scanError}</div>}
        {processing && <p className="scanner-status">Processing scan…</p>}

        {preview ? (
          <div className="success-panel">
            <h2>Confirm asset</h2>
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
                {processing ? 'Assigning…' : 'Confirm'}
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
          Scanner not working? Contact the IT team to assign the asset manually
          using your employee ID ({user.emp_id}).
        </p>
      </section>
    </DashboardLayout>
  )
}
