'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BrowserProvider } from 'ethers'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password')
    } else if (res?.ok) {
      router.push('/dashboard')
    }
  }

  const handleMetaMaskLogin = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not available. Please install MetaMask.')
      return
    }
    try {
      const provider = new BrowserProvider(window.ethereum as any)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const walletAddress = await signer.getAddress()
      // Call backend to create session
      const res = await fetch('/api/auth/metamask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress }),
        credentials: 'include',
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError('MetaMask login failed.')
      }
    } catch (err) {
      setError('MetaMask login failed or was rejected.')
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative" style={{ backgroundImage: 'url(/images/login.png)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl p-8 border border-border backdrop-blur-md">
          <h2 className="text-center text-3xl font-extrabold text-primary mb-2 tracking-tight">Sign in to your account</h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">create a new account</Link>
          </p>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field w-full"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-field w-full pr-16"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input id="remember-me" name="remember-me" type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-primary text-sm hover:underline">Forgot your password?</Link>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">Or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="btn-secondary w-full" onClick={handleMetaMaskLogin}>MetaMask</button>
              <button type="button" className="btn-secondary w-full" disabled>WalletConnect</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 