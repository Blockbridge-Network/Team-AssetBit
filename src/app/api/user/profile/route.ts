import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const email = session.user?.email
  if (!email) {
    return NextResponse.json({ error: 'No email in session' }, { status: 400 })
  }
  let user = await prisma.user.findUnique({
    where: { email },
    include: { portfolio: true, transactions: true },
  })
  if (!user) {
    // Create user if not exists
    user = await prisma.user.create({
      data: { email, name: session.user?.name || '', image: session.user?.image || '' },
      include: { portfolio: true, transactions: true },
    })
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    kycStatus: user.kycStatus,
    portfolio: user.portfolio,
    transactions: user.transactions,
  })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const email = session.user?.email
  if (!email) {
    return NextResponse.json({ error: 'No email in session' }, { status: 400 })
  }
  const body = await request.json()
  const { portfolio, transactions } = body
  // Update or create user
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({ data: { email, name: session.user?.name || '', image: session.user?.image || '' } })
  }
  // Delete old portfolio and transactions
  await prisma.portfolio.deleteMany({ where: { userId: user.id } })
  await prisma.transaction.deleteMany({ where: { userId: user.id } })
  // Create new portfolio
  if (Array.isArray(portfolio)) {
    for (const item of portfolio) {
      await prisma.portfolio.create({
        data: {
          userId: user.id,
          symbol: item.symbol,
          name: item.name,
          amount: item.amount,
          value: item.value,
          change: item.change || '+0%'
        }
      })
    }
  }
  // Create new transactions
  if (Array.isArray(transactions)) {
    for (const tx of transactions) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: tx.type,
          symbol: tx.symbol,
          name: tx.name,
          amount: tx.amount,
          price: tx.price,
          total: tx.total,
          tokens: tx.tokens || 0,
          timestamp: tx.timestamp ? new Date(tx.timestamp) : new Date(),
          wallet: tx.wallet || '',
        }
      })
    }
  }
  // Return updated user
  const updated = await prisma.user.findUnique({
    where: { email },
    include: { portfolio: true, transactions: true },
  })
  return NextResponse.json({
    id: updated?.id,
    email: updated?.email,
    name: updated?.name,
    image: updated?.image,
    kycStatus: updated?.kycStatus,
    portfolio: updated?.portfolio,
    transactions: updated?.transactions,
  })
} 