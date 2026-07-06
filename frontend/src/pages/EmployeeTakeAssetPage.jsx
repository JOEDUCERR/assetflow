import { useCallback, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import QrScanner from '../components/QrScanner'
import { useAuth } from '../context/AuthContext'

export default function EmployeeTakeAssetPage() {
  const { user, token } = useAuth()
  const [scanError, setScanError] = useState('')
  const [success, setSuccess] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [scannerActive, setScannerActive] = useState(true)

  const handleScan = useCallback(
    async (decodedText) => {
      if (processing) return

      setProcessing(true)
      setScannerActive(false)
      setScanError('')

      try {
        const result = await api.takeAssetByScan(token, decodedText)
        setSuccess(result)
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
          <Link to="/employee" className="btn btn-primary">
            Back to portal
          </Link>
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

        <QrScanner
          active={scannerActive}
          onScan={handleScan}
          onError={(message) => setScanError(message)}
        />

        <p className="dashboard-note">
          Scanner not working? Contact the IT team to assign the asset manually
          using your employee ID ({user.emp_id}).
        </p>
      </section>
    </DashboardLayout>
  )
}
