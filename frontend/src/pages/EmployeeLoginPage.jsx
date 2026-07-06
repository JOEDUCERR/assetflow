import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function EmployeeLoginPage() {
  const navigate = useNavigate()
  const { loginEmployee, isAuthenticated, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    setLoading(true)

    try {
      const loggedInUser = await loginEmployee(email, password)
      navigate(loggedInUser.profile_complete ? '/employee' : '/employee/setup')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to sign in. Try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Employee sign in"
      subtitle="Sign in to take or return company assets."
      backTo="/"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <label className="form-field">
          <span>Email</span>
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
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            minLength={6}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="form-footer">
        First time here?{' '}
        <Link to="/employee/register">Create an employee account</Link>
      </p>
    </AuthLayout>
  )
}
