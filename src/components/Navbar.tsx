'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const pathname = usePathname()
  const router = useRouter()

  // Sticky, transparent background on scroll
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/market', label: 'Market' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/trade', label: 'Trade' },
    { href: '/about', label: 'About' },
  ]
  const authLinks = isAuthenticated
    ? [
        { href: '/portfolio', label: 'Portfolio' },
        { href: '/kyc', label: 'KYC' },
        { href: '/settings', label: 'Settings' },
        { href: '/profile', label: 'Profile' },
      ]
    : [
        { href: '/auth/signin', label: 'Login' },
        { href: '/auth/signup', label: 'Register' },
      ]

  return (
    <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 shadow-xl border-b border-border backdrop-blur-lg' : 'bg-transparent'}`} style={{backdropFilter: 'blur(12px)'}}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Brand/Logo */}
        <motion.div
          whileHover={{ scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => router.push('/dashboard')}
          tabIndex={0}
          role="button"
          aria-label="Go to dashboard"
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push('/dashboard') }}
        >
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary font-sans" style={{ letterSpacing: '-0.04em' }}>
            AssetBit
          </span>
        </motion.div>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {[...navLinks, ...authLinks].map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-4 py-2 font-semibold text-lg transition-colors duration-200 rounded-lg focus:outline-none group ${pathname === tab.href ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}
            >
              <span>{tab.label}</span>
              {/* Animated underline for selected tab */}
              <motion.span
                layoutId="nav-underline"
                className="absolute left-0 right-0 -bottom-1 h-1 rounded-full"
                style={{
                  background: pathname === tab.href ? 'linear-gradient(90deg, #2563eb 60%, #fbbf24 100%)' : 'transparent',
                  opacity: pathname === tab.href ? 1 : 0,
                  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)'
                }}
                animate={{
                  opacity: pathname === tab.href ? 1 : 0,
                  scaleX: pathname === tab.href ? 1 : 0.6
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="ml-2 px-4 py-2 font-semibold text-lg rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors duration-200 shadow-sm"
              style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}
            >
              Logout
            </button>
          )}
        </div>
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground hover:text-primary focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>
      {/* Mobile Nav Drawer */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-white/90 dark:bg-gray-900/90 shadow-lg backdrop-blur-md overflow-hidden border-b border-border"
      >
        <div className="flex flex-col gap-2 px-6 py-4">
          {[...navLinks, ...authLinks].map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-4 py-2 font-semibold text-lg rounded-lg transition-colors duration-200 focus:outline-none group ${pathname === tab.href ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}
              onClick={() => setIsOpen(false)}
            >
              <span>{tab.label}</span>
              <motion.span
                layoutId="nav-underline-mobile"
                className="absolute left-0 right-0 -bottom-1 h-1 rounded-full"
                style={{
                  background: pathname === tab.href ? 'linear-gradient(90deg, #2563eb 60%, #fbbf24 100%)' : 'transparent',
                  opacity: pathname === tab.href ? 1 : 0,
                  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)'
                }}
                animate={{
                  opacity: pathname === tab.href ? 1 : 0,
                  scaleX: pathname === tab.href ? 1 : 0.6
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => { setShowLogoutModal(true); setIsOpen(false) }}
              className="px-4 py-2 font-semibold text-lg rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors duration-200 shadow-sm"
              style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}
            >
              Logout
            </button>
          )}
        </div>
      </motion.div>
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Confirm Logout</h2>
            <p className="text-muted-foreground mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded bg-muted text-foreground hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutModal(false); signOut({ callbackUrl: '/' }) }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 