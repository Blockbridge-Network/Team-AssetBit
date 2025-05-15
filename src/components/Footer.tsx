'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Footer() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">AssetBit</h3>
            <p className="text-gray-400 text-sm">
              Empowering global trade through blockchain technology
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/marketplace" className="text-gray-400 hover:text-white text-sm">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white text-sm">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white text-sm">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>12 Independence Avenue</li>
              <li>Ridge</li>
              <li>Accra, GA-123-4567</li>
              <li>Ghana</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Get in Touch</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: info@assetbit.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Support: support@assetbit.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} AssetBit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 