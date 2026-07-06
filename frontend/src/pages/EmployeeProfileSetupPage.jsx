import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function EmployeeProfileSetupPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, completeProfile } = useAuth()
  const [name, setName] = useState('')
  const [empId, setEmpId] = useState('')
  const [designation, setDesignation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated || user?.role !== 'employee') {
    return <Navigate to="/employee/login" replace />
  }

  if (user.profile_complete) {
    return <Navigate to="/employee" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await completeProfile({ name, emp_id: empId, designation })
      navigate('/employee')
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to save profile. Try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Complete your profile"
      subtitle="Add your employee details. Your employee ID cannot be changed later."
      backTo="/employee/login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <label className="form-field">
          <span>Full name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
            required
            autoComplete="name"
          />
        </label>

        <label className="form-field">
          <span>Employee ID</span>
          <input
            type="text"
            value={empId}
            onChange={(event) => setEmpId(event.target.value)}
            placeholder="EMP-1024"
            required
          />
          <small className="field-note">This cannot be changed after setup.</small>
        </label>

        <label className="form-field">
          <span>Designation</span>
          <input
            type="text"
            value={designation}
            onChange={(event) => setDesignation(event.target.value)}
            placeholder="Software Engineer"
            required
          />
          <small className="field-note">
            You can update your designation later from your dashboard.
          </small>
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save and continue'}
        </button>
      </form>
    </AuthLayout>
  )
}
