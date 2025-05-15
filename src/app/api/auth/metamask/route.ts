import { NextResponse } from 'next/server'

// In-memory session store for demo
const sessions: Record<string, any> = {}

export async function POST(request: Request) {
  const { wallet } = await request.json()
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
  }
  // For demo: set a session cookie (in production, use JWT or a real session store)
  sessions[wallet] = { wallet, loggedIn: true, timestamp: Date.now() }
  // Set a cookie for the session (for demo)
  const response = NextResponse.json({ success: true, wallet })
  response.cookies.set('metamask_wallet', wallet, { path: '/', httpOnly: false })
  return response
} 