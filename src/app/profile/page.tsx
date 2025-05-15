'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { minerals, farmProduce } from '@/data/commodities'
import { motion } from 'framer-motion'
import LoadingScreen from '@/components/ui/LoadingScreen'

interface KYCData {
  fullName: string
  dateOfBirth: string
  nationality: string
  address: string
  idType: string
  idNumber: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
  verificationDate?: string
}

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [kycData, setKycData] = useState<KYCData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  useEffect(() => {
    const fetchKYCData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/kyc/status')
        const data = await response.json()
        setKycData(data)
      } catch (error) {
        console.error('Error fetching KYC data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchKYCData()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      setUserData(data)
      setEditData(data)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  const handleEditChange = (e: any) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleEditSave = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (res.ok) {
        await fetchProfile()
        setEditOpen(false)
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
    }
  }

  if (status === 'loading' || !userData || isLoading) {
    return <LoadingScreen message="Loading profile..." />
  }

  // Portfolio assets
  const portfolio = userData.portfolio || []
  const allAssets = [...minerals, ...farmProduce]

  // Helper: Check if KYC is completed
  const isKycCompleted = userData.kycStatus === 'verified' || (
    userData.fullName && userData.dateOfBirth && userData.country && userData.address && userData.city && userData.state && userData.zipCode && userData.mobileNumber && userData.documentType && userData.documentNumber && userData.documentExpiry
  )

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: 'url(/images/SETTINGS_COMMODITY.png)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <Avatar className="w-16 h-16 shadow-lg ring-2 ring-primary/20">
            <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'User'} />
            <AvatarFallback className="bg-primary/20 text-primary-foreground">
              {session?.user?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Profile</h1>
            <p className="text-gray-400">View and manage your account information</p>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Information */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white font-medium">{kycData?.fullName || session?.user?.name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{session?.user?.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date of Birth</p>
                <p className="text-white font-medium">{kycData?.dateOfBirth || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Nationality</p>
                <p className="text-white font-medium">{kycData?.nationality || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>

          {/* KYC Status */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">KYC Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Verification Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    kycData?.verificationStatus === 'verified' ? 'bg-green-500' :
                    kycData?.verificationStatus === 'pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <p className="text-white font-medium capitalize">
                    {kycData?.verificationStatus || 'Not submitted'}
                  </p>
                </div>
              </div>
              {kycData?.verificationDate && (
                <div>
                  <p className="text-sm text-gray-400">Verified On</p>
                  <p className="text-white font-medium">{new Date(kycData.verificationDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">ID Type</p>
                <p className="text-white font-medium">{kycData?.idType || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">ID Number</p>
                <p className="text-white font-medium">{kycData?.idNumber || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Address Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white font-medium">{kycData?.address || 'Not provided'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input name="fullName" value={editData.fullName || ''} onChange={handleEditChange} placeholder="Full Name" />
            <Input name="mobileNumber" value={editData.mobileNumber || ''} onChange={handleEditChange} placeholder="Mobile Number" />
            <Input name="address" value={editData.address || ''} onChange={handleEditChange} placeholder="Address" />
          </div>
          <DialogFooter>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 