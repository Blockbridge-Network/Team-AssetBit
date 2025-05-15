import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const kycData = await prisma.kyc.findUnique({
      where: {
        userEmail: session.user.email
      },
      select: {
        fullName: true,
        dateOfBirth: true,
        nationality: true,
        address: true,
        idType: true,
        idNumber: true,
        verificationStatus: true,
        verificationDate: true
      }
    })

    if (!kycData) {
      return NextResponse.json(
        { error: 'KYC data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(kycData)
  } catch (error) {
    console.error('Error fetching KYC status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 