import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { commodityId, amount, price } = body

    if (!commodityId || !amount || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Verify the user has sufficient quantity of the commodity
    // 2. Create a transaction record
    // 3. Update the user's portfolio
    // 4. Update the commodity's price if needed
    // 5. Send notifications

    // For now, we'll just return a success response
    return NextResponse.json({
      success: true,
      message: 'Sell order processed successfully',
      transaction: {
        id: Math.random().toString(36).substring(7),
        commodityId,
        amount,
        price,
        total: amount * price,
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Sell error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 