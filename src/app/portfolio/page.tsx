'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { minerals, farmProduce } from '@/data/commodities'
import { Button } from '@/components/ui/button'
import { parseISO, format } from 'date-fns'
import LoadingScreen from '@/components/ui/LoadingScreen'

interface Holding {
  commodity: string;
  amount: number;
  currentPrice: number;
  value: number;
  change: number;
}

export default function Portfolio() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [chartData, setChartData] = useState<{ date: string, value: number }[]>([])
  const [userData, setUserData] = useState<any>(null)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (status === 'authenticated') {
      const local = loadPortfolioFromLocal()
      if (local.portfolio.length > 0) setHoldings(local.portfolio)
      if (local.transactions.length > 0) setRecentTransactions(local.transactions)
      fetchProfile()
    }
  }, [status, router, pathname])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' })
      const data = await res.json()
      setUserData(data)
      // Build holdings from portfolio
      const allAssets = [...minerals, ...farmProduce]
      const portfolio = data.portfolio || []
      const holdings = portfolio.map((item: any) => {
        const asset = allAssets.find(a => a.symbol === item.symbol)
        return {
          commodity: asset?.name || item.symbol,
          amount: item.amount,
          currentPrice: asset?.price || 0,
          value: (asset?.price || 0) * item.amount,
          change: parseFloat((asset?.change || '0').replace('%','')),
        }
      })
      setHoldings(holdings)
      setPortfolioValue(holdings.reduce((sum: number, h: Holding) => sum + h.value, 0))
      // Generate chart data from transaction history
      if (Array.isArray(data.transactions)) {
        let runningValue = 0
        const chartPoints: { date: string, value: number }[] = []
        // Sort transactions by timestamp ascending
        const sortedTx = [...data.transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        sortedTx.forEach((tx: any) => {
          if (tx.type === 'buy') {
            runningValue += tx.total || 0
          } else if (tx.type === 'sell') {
            runningValue -= tx.total || 0
          } else if (tx.type === 'trade') {
            // For trade, treat as sell of fromAsset and buy of toAsset
            runningValue -= tx.total || 0
            runningValue += (tx.toAmount * (allAssets.find(a => a.symbol === tx.toSymbol)?.price || 0))
          }
          chartPoints.push({
            date: format(parseISO(tx.timestamp), 'yyyy-MM-dd HH:mm'),
            value: runningValue
          })
        })
        setChartData(chartPoints)
      }
      setRecentTransactions(Array.isArray(data.transactions) ? data.transactions : [])
      savePortfolioToLocal(Array.isArray(data.portfolio) ? data.portfolio : [], Array.isArray(data.transactions) ? data.transactions : [])
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  if (status === 'loading') {
    return <LoadingScreen message="Loading portfolio..." />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <Button onClick={fetchProfile} variant="outline">Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${portfolioValue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{holdings.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>24h Change</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">+2.5%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={date => date.slice(5, 16)} />
                <YAxis />
                <Tooltip formatter={v => `$${v.toLocaleString()}`} labelFormatter={l => l} />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commodity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>24h Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding: Holding, index: number) => (
                <TableRow key={index}>
                  <TableCell>{holding.commodity}</TableCell>
                  <TableCell>{holding.amount}</TableCell>
                  <TableCell>${holding.currentPrice}</TableCell>
                  <TableCell>${holding.value}</TableCell>
                  <TableCell className={holding.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {holding.change}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Add utility functions for localStorage
function savePortfolioToLocal(portfolio: any[], transactions: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('portfolio', JSON.stringify(portfolio))
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }
}
function loadPortfolioFromLocal() {
  if (typeof window !== 'undefined') {
    const portfolio = localStorage.getItem('portfolio')
    const transactions = localStorage.getItem('transactions')
    return {
      portfolio: portfolio ? JSON.parse(portfolio) : [],
      transactions: transactions ? JSON.parse(transactions) : []
    }
  }
  return { portfolio: [], transactions: [] }
} 