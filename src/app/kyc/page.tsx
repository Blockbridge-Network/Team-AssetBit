'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { countries } from 'countries-list'

export default function KYC() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    country: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    mobileNumber: '',
    documentType: 'passport',
    documentNumber: '',
    documentExpiry: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || status !== 'authenticated') {
      toast.error('You must be signed in to submit KYC information.')
      return
    }
    try {
      // Only send relevant KYC fields
      const kycData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        mobileNumber: formData.mobileNumber,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        documentExpiry: formData.documentExpiry,
        kycStatus: 'pending',
      }
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kycData),
      })
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      toast.success('KYC information submitted successfully')
      router.push('/profile')
    } catch (error) {
      toast.error('Failed to submit KYC information')
      console.error('KYC submission error:', error)
    }
  }

  // Get all countries from the countries-list package
  const countryList = Object.entries(countries).map(([code, country]) => ({
    code,
    name: country.name,
  })).sort((a, b) => a.name.localeCompare(b.name))

  useEffect(() => {
    if (status === 'authenticated') {
      // Fetch user profile to check KYC status
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          const isKycCompleted = data.kycStatus === 'verified' || (
            data.fullName && data.dateOfBirth && data.country && data.address && data.city && data.state && data.zipCode && data.mobileNumber && data.documentType && data.documentNumber && data.documentExpiry
          )
          if (isKycCompleted) {
            router.push('/profile')
          }
        })
    }
  }, [status, router])

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Complete Your KYC Verification</h1>
          <p className="mt-2 text-gray-300">
            Please provide the following information to complete your account verification
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  className="input-field w-full"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  required
                  className="input-field w-full"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  required
                  className="input-field w-full"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4">Address Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  className="input-field w-full"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="">Select a country</option>
                  {countryList.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  className="input-field w-full"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    className="input-field w-full"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    className="input-field w-full"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-300 mb-1">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    className="input-field w-full"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4">Document Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-300 mb-1">
                  Document Type
                </label>
                <select
                  id="documentType"
                  name="documentType"
                  required
                  className="input-field w-full"
                  value={formData.documentType}
                  onChange={handleChange}
                >
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID</option>
                </select>
              </div>
              <div>
                <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-300 mb-1">
                  Document Number
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  name="documentNumber"
                  required
                  className="input-field w-full"
                  value={formData.documentNumber}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="documentExpiry" className="block text-sm font-medium text-gray-300 mb-1">
                  Document Expiry Date
                </label>
                <input
                  type="date"
                  id="documentExpiry"
                  name="documentExpiry"
                  required
                  className="input-field w-full"
                  value={formData.documentExpiry}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="consent" className="ml-2 block text-sm text-gray-300">
                I consent to the processing of my personal data for KYC verification
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary"
            >
              Submit Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 