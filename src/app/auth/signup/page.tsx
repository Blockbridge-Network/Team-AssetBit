'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }
      setSuccess('Registration successful! Logging you in...')
      // Auto-login after registration
      const loginRes = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })
      setLoading(false)
      if (loginRes?.ok) {
        router.push('/dashboard')
      } else {
        setError('Registration succeeded but login failed. Please sign in.')
      }
    } catch (err) {
      setError('Server error. Please try again later.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative" style={{ backgroundImage: 'url(/images/signUp.png)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl p-8 border border-border backdrop-blur-md">
          <h2 className="text-center text-3xl font-extrabold text-primary mb-2 tracking-tight">Create your account</h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Or{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">sign in to your existing account</Link>
          </p>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field w-full"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input-field w-full pr-16"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input-field w-full pr-16"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-500 text-sm text-center">{success}</div>}
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input id="terms" name="terms" type="checkbox" required className="rounded border-gray-300" />
              I agree to the{' '}
              <Link href="/terms" className="font-medium text-primary hover:underline">Terms of Service</Link>{' '}and{' '}
              <Link href="/privacy" className="font-medium text-primary hover:underline">Privacy Policy</Link>
            </label>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">Or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="btn-secondary w-full" disabled>MetaMask</button>
              <button type="button" className="btn-secondary w-full" disabled>WalletConnect</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 