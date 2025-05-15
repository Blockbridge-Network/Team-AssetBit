'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const Navbar = dynamic(() => import('./Navbar'), { ssr: false })

export default function NavbarConditional() {
  const pathname = usePathname()
  if (pathname?.startsWith('/auth/signin') || pathname?.startsWith('/auth/signup')) {
    return null
  }
  return <Navbar />
} 