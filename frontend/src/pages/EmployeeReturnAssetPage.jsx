import { useCallback, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import DashboardLayout from '../components/DashboardLayout'
import QrScanner from '../components/QrScanner'
import { useAuth } from '../context/AuthContext'

export default function EmployeeReturnAssetPage() {
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
        const result = await api.returnAssetByScan(token, decodedText)
        setSuccess(result)
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
      title="Return an asset"
      subtitle="Scan the asset QR code to mark it as returned."
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
          Scanner not working? Contact the IT team to return the asset manually.
        </p>
      </section>
    </DashboardLayout>
  )
}
