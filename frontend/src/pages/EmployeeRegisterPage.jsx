import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function EmployeeRegisterPage() {
  const navigate = useNavigate()
  const { registerEmployee, isAuthenticated, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated && user?.role === 'employee') {
    return (
      <Navigate
        to={user.profile_complete ? '/employee' : '/employee/setup'}
        replace
      />
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await registerEmployee(email, password)
      navigate('/employee/setup')
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to create account. Try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create employee account"
      subtitle="Register with your work email and password, then complete your profile."
      backTo="/employee/login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <label className="form-field">
          <span>Work email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
            autoComplete="email"
          />
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            required
            autoComplete="new-password"
            minLength={6}
          />
        </label>

        <label className="form-field">
          <span>Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
            minLength={6}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="form-footer">
        Already registered? <Link to="/employee/login">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
