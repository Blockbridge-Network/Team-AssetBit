'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BrowserProvider, Contract, parseUnits } from 'ethers'
import { Switch } from '@/components/ui/switch'
import { ASSETBIT_REGISTRY_ADDRESS, ASSETBIT_REGISTRY_ABI } from '@/contracts/AssetBitRegistry'
import { COMMODITY_TOKEN_ABI, COMMODITY_TOKEN_CONFIGS } from '@/contracts/CommodityToken'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { format } from 'date-fns'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { getApiKey } from '@/lib/commodityMapping'
import Image from 'next/image'
import { minerals, farmProduce } from '@/data/commodities'

const portfolioData = [
  { date: 'Jan', value: 10000 },
  { date: 'Feb', value: 12000 },
  { date: 'Mar', value: 11500 },
  { date: 'Apr', value: 13000 },
  { date: 'May', value: 14000 },
  { date: 'Jun', value: 15000 },
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedCommodity, setSelectedCommodity] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [wallet, setWallet] = useState({ connected: false, address: '' })
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d')
  const [marketData, setMarketData] = useState<{
    price: number;
    change: number;
    trend: 'up' | 'down';
    history: Record<string, Array<{ time: number; price: number }>>;
  } | null>(null)
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [updateInterval, setUpdateInterval] = useState(60) // Default 60 seconds
  const [isAutoUpdate, setIsAutoUpdate] = useState(true)
  const [showTechnicalIndicators, setShowTechnicalIndicators] = useState(false)
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['sma'])
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)
  const [showSellDialog, setShowSellDialog] = useState(false)
  const [sellRecipient, setSellRecipient] = useState('')
  const [onChainEvents, setOnChainEvents] = useState<Array<{
    type: string;
    asset: any;
    amount: number;
    price: number;
    date: string;
    status: string;
    txHash: string;
  }>>([])
  const sellButtonRef = useRef(null)
  const [showKycPrompt, setShowKycPrompt] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [showKycBanner, setShowKycBanner] = useState(false)

  const [holdings, setHoldings] = useState<Array<{
    id: string;
    name: string;
    symbol: string;
    amount: number;
    value: number;
    change: string;
    image?: string;
  }>>([])

  const [recentTransactions, setRecentTransactions] = useState<Array<{
    id?: number;
    type: string;
    asset?: string;
    name?: string;
    symbol?: string;
    amount: number;
    price: number;
    date?: string;
    timestamp?: string;
    status?: string;
  }>>([])

  // Add state for trade modal
  const [showTradeDialog, setShowTradeDialog] = useState(false)
  const [tradeFrom, setTradeFrom] = useState('')
  const [tradeTo, setTradeTo] = useState('')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeResult, setTradeResult] = useState<{ received: number, fee: number } | null>(null)

  // Move fetchEvents above useEffect
  const fetchEvents = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      console.warn('Ethereum provider not available')
      return
    }
    try {
      const provider = new BrowserProvider(window.ethereum as any)
      const contract = new Contract(ASSETBIT_REGISTRY_ADDRESS, ASSETBIT_REGISTRY_ABI, provider)
      const registeredEvents = await contract.queryFilter('AssetRegistered')
      const transferredEvents = await contract.queryFilter('AssetTransferred')
      const allEvents = [
        ...registeredEvents.map(e => ({
          type: 'Buy',
          asset: (e as any).args?.name || '',
          amount: 1,
          price: 0,
          date: (e as any).block && (e as any).block.timestamp ?
            new Date(Number((e as any).block.timestamp) * 1000).toLocaleString() :
            new Date().toLocaleString(),
          status: 'On-chain',
          txHash: e.transactionHash
        })),
        ...transferredEvents.map(e => ({
          type: 'Sell',
          asset: '',
          amount: 1,
          price: 0,
          date: (e as any).block && (e as any).block.timestamp ?
            new Date(Number((e as any).block.timestamp) * 1000).toLocaleString() :
            new Date().toLocaleString(),
          status: 'On-chain',
          txHash: e.transactionHash
        }))
      ].sort((a, b) => (a.date < b.date ? 1 : -1))
      setOnChainEvents(allEvents)
    } catch (err) {
      console.error('Error fetching on-chain events:', err)
    }
  }

  // Fetch on-chain events
  useEffect(() => {
    fetchEvents()
  }, [])

  // Replace the CommodityIcon function with a proper Image component implementation
  function CommodityIcon({ symbol, name }: { symbol: string; name: string }) {
    const getImagePath = () => {
      // Find the commodity in our local data
      const commodity = [...holdings].find(c => c.symbol === symbol);
      
      // Use the image path if available, or generate a fallback path based on symbol
      if (commodity?.image) {
        return commodity.image;
      }
      
      // Make sure symbol is defined before calling toLowerCase()
      return symbol ? `/images/${symbol.toLowerCase()}.png` : '/images/placeholder.png';
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 relative flex-shrink-0">
          <Image
            src={getImagePath()}
            alt={name || 'Commodity'}
            fill
            sizes="24px"
            className="rounded-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
        <span>{name}</span>
      </div>
    )
  }

  const timeframes = ['5m', '15m', '1h', '4h', '1d', '1w', '1mo']

  // Sonic Token ERC-20 contract address and ABI (replace with your actual address)
  const SONIC_TOKEN_ADDRESS = '0xYourSonicTokenAddressHere'
  const ERC20_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function decimals() public view returns (uint8)"
  ]

  // Add minimal ERC20 ABI for transfer
  const MINIMAL_ERC20_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function decimals() public view returns (uint8)",
    "function balanceOf(address account) public view returns (uint256)"
  ]

  // Fetch market data when commodity is selected
  const fetchMarketData = async () => {
    if (!selectedCommodity) return

    setIsLoadingMarketData(true)
    try {
      // Use the correct endpoint for commodity prices with mapped symbol
      const response = await fetch(`/api/commodity-prices?commodity=${getApiKey(selectedCommodity)}`)
      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setMarketData(data)
        setLastUpdate(new Date())
        toast.success('Prices updated successfully')
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
      toast.error('Failed to fetch market data')
    } finally {
      setIsLoadingMarketData(false)
    }
  }

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' })
      const data = await res.json()
      setUserData(data)
      
      // Enhance portfolio data with images from commodities data
      const allCommodities = [...minerals, ...farmProduce]
      const enhancedPortfolio = Array.isArray(data.portfolio) 
        ? data.portfolio.map((item: any) => {
            // Find matching commodity to get image
            const matchingCommodity = allCommodities.find(c => 
              c.symbol === item.symbol || c.name === item.name
            )
            
            // Create a safe image path
            const imagePath = matchingCommodity?.image || 
              (item.symbol ? `/images/${item.symbol.toLowerCase()}.png` : '/images/placeholder.png')
            
            return {
              ...item,
              image: item.image || imagePath
            }
          })
        : []
      
      setHoldings(enhancedPortfolio)
      
      // Process transactions
      if (data.transactions) {
        // Sort by most recent first
        const sortedTransactions = [...data.transactions].sort((a: any, b: any) => {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0)
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0)
          return dateB.getTime() - dateA.getTime()
        })
        
        // Take the most recent 10
        setRecentTransactions(sortedTransactions.slice(0, 10))
      }
      
      const walletConnector = document.getElementById('walletConnector')
      if (!data.kycVerified && walletConnector) {
        setShowKycBanner(true)
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      toast.error('Failed to load your profile')
      // Fallback to local data
      const local = loadPortfolioFromLocal()
      setHoldings(local.portfolio)
      setRecentTransactions(local.transactions.slice(0, 10))
    }
  }

  // Handle authentication state changes
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Handle authenticated state and fetch profile
  useEffect(() => {
    if (status === 'authenticated') {
      const local = loadPortfolioFromLocal()
      if (local.portfolio.length > 0) setHoldings(local.portfolio)
      if (local.transactions.length > 0) setRecentTransactions(local.transactions)
      fetchProfile()
    }
  }, [status])

  // Handle wallet connection
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.selectedAddress) {
      setWallet({ connected: true, address: window.ethereum.selectedAddress })
    }
  }, [])

  // Fetch market data when commodity is selected
  useEffect(() => {
    if (selectedCommodity) {
      fetchMarketData()
      
      if (isAutoUpdate) {
        const interval = setInterval(fetchMarketData, updateInterval * 1000)
        return () => clearInterval(interval)
      }
    }
  }, [selectedCommodity, updateInterval, isAutoUpdate])

  // On mount, check if user previously chose 'Maybe Later' for KYC
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const kycLater = localStorage.getItem('kycMaybeLater')
      if (kycLater === 'true') {
        setShowKycBanner(true)
        setShowKycPrompt(false)
      }
    }
  }, [])

  if (status === 'loading' || loading) {
    return <LoadingScreen message="Loading dashboard..." />
  }

  // Helper to get commodity config by symbol or name
  function getCommodityConfig(symbolOrName: string) {
    return COMMODITY_TOKEN_CONFIGS.find(
      c => c.symbol.toLowerCase() === symbolOrName.toLowerCase() || c.commodityType.toLowerCase() === symbolOrName.toLowerCase()
    )
  }

  const handleBuy = async () => {
    if (!selectedCommodity || !amount || Number(amount) <= 0) {
      toast.error('Please select a commodity and enter a valid amount.')
      return
    }
    if (!wallet.connected) {
      toast.error('Please connect your MetaMask wallet first.')
      return
    }
    const tokenConfig = getCommodityConfig(selectedCommodity)
    if (!tokenConfig || !tokenConfig.address) {
      toast.error('Token config not found for selected commodity.')
      return
    }
    try {
      const provider = new BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const commodityToken = new Contract(tokenConfig.address, tokenConfig.abi, signer)
      const assetBitRegistry = new Contract(ASSETBIT_REGISTRY_ADDRESS, ASSETBIT_REGISTRY_ABI, signer)
      let decimals = 18
      try {
        if (typeof commodityToken.decimals === 'function') {
          decimals = await commodityToken.decimals()
        }
      } catch (decErr) {}
      const value = parseUnits(amount, decimals)
      const balance = await commodityToken.balanceOf(wallet.address)
      if (balance < value) {
        toast.error('Insufficient token balance.')
        return
      }
      const allowance = await commodityToken.allowance(wallet.address, ASSETBIT_REGISTRY_ADDRESS)
      if (allowance < value) {
        const approveTx = await commodityToken.approve(ASSETBIT_REGISTRY_ADDRESS, value)
        await approveTx.wait()
      }
      const tx = await assetBitRegistry.registerAsset(tokenConfig.commodityType, `Purchased ${amount} via dApp`)
      await tx.wait()
      toast.success(`Bought and registered ${amount} ${tokenConfig.commodityType}`)
      setAmount('')
      // Update local state without loading screen
      const res = await fetch('/api/user/profile', { credentials: 'include' })
      const data = await res.json()
      const portfolio = Array.isArray(data.portfolio) ? data.portfolio : []
      const idx = portfolio.findIndex((h: any) => h.symbol === tokenConfig.symbol)
      let updatedPortfolio
      if (idx !== -1) {
        updatedPortfolio = [...portfolio]
        updatedPortfolio[idx] = {
          ...updatedPortfolio[idx],
          amount: updatedPortfolio[idx].amount + Number(amount),
          value: marketData ? marketData.price * (updatedPortfolio[idx].amount + Number(amount)) : updatedPortfolio[idx].value,
        }
      } else {
        updatedPortfolio = [
          ...portfolio,
          {
            id: tokenConfig.address,
            name: tokenConfig.commodityType,
            symbol: tokenConfig.symbol,
            amount: Number(amount),
            value: marketData ? marketData.price * Number(amount) : 0,
            change: '+0%'
          }
        ]
      }
      const transactions = [
        ...(data.transactions || []),
        {
          type: 'buy',
          symbol: tokenConfig.symbol,
          name: tokenConfig.commodityType,
          amount: Number(amount),
          price: marketData ? marketData.price : 0,
          total: Number(amount) * (marketData ? marketData.price : 0),
          tokens: (Number(amount) * (marketData ? marketData.price : 0)) / 3800,
          timestamp: new Date().toISOString(),
          wallet: wallet.address,
        }
      ]
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ portfolio: updatedPortfolio, transactions }),
      })
      setHoldings(updatedPortfolio)
      setRecentTransactions(transactions)
      savePortfolioToLocal(updatedPortfolio, transactions)
      await fetchProfile()
    } catch (err: any) {
      let message = 'Transaction failed or rejected.'
      if (err?.data?.message) message = err.data.message
      else if (err?.message) message = err.message
      toast.error(message)
      console.error(err)
    }
  }

  const handleSell = async () => {
    if (!selectedCommodity || !amount || Number(amount) <= 0 || !sellRecipient) {
      toast.error('Please select a commodity, enter a valid amount, and provide a recipient address.')
      return
    }
    const holding = holdings.find((h: any) => h.symbol === selectedCommodity)
    if (!holding || holding.amount < Number(amount)) {
      toast.error('Not enough asset to sell or invalid commodity.')
      return
    }
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' })
      const user = await res.json()
      const updatedHoldings = holdings.map((h: any) =>
        h.symbol === selectedCommodity
          ? { ...h, amount: h.amount - Number(amount), value: h.value - (h.value / h.amount) * Number(amount) }
          : h
      ).filter((h: any) => h.amount > 0)
      const transactions = [
        {
          type: 'sell',
          symbol: holding.symbol,
          name: holding.name,
          amount: Number(amount),
          price: holding.value / holding.amount,
          total: (holding.value / holding.amount) * Number(amount),
          timestamp: new Date().toISOString(),
          status: 'Completed',
          recipient: sellRecipient,
        },
        ...(user.transactions || [])
      ]
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ portfolio: updatedHoldings, transactions }),
      })
      setHoldings(updatedHoldings)
      setRecentTransactions(transactions)
      toast.success('Sale successful!')
      setAmount('')
      setSellRecipient('')
    } catch (err) {
      toast.error('Sale failed.')
      console.error(err)
    }
  }

  // Calculate stats
  const totalValue = holdings.reduce((sum: any, h: any) => sum + h.value, 0)
  const totalAssets = holdings.length
  const change24h = '+3.2%'

  // Calculate technical indicators
  const calculateIndicators = (data: Array<{ time: number; price: number }>) => {
    if (!data || data.length === 0) return { sma: [], ema: [], rsi: [] }

    // Simple Moving Average (SMA)
    const sma = data.map((_, i) => {
      if (i < 9) return null // Need at least 10 points for SMA
      const sum = data.slice(i - 9, i + 1).reduce((acc, d) => acc + d.price, 0)
      return { time: data[i].time, value: sum / 10 }
    })

    // Exponential Moving Average (EMA)
    const ema = data.map((_, i) => {
      if (i < 9) return null // Need at least 10 points for EMA
      const multiplier = 2 / (10 + 1)
      let ema = data.slice(i - 9, i + 1).reduce((acc, d) => acc + d.price, 0) / 10
      for (let j = i - 9; j <= i; j++) {
        ema = (data[j].price - ema) * multiplier + ema
      }
      return { time: data[i].time, value: ema }
    })

    // Relative Strength Index (RSI)
    const rsi = data.map((_, i) => {
      if (i < 14) return null // Need at least 15 points for RSI
      const changes = data.slice(i - 14, i + 1).map((d, idx) => {
        if (idx === 0) return 0
        return d.price - data[i - 14 + idx - 1].price
      })
      const gains = changes.filter(c => c > 0).reduce((acc, c) => acc + c, 0) / 14
      const losses = Math.abs(changes.filter(c => c < 0).reduce((acc, c) => acc + c, 0)) / 14
      const rs = gains / losses
      return { time: data[i].time, value: 100 - (100 / (1 + rs)) }
    })

    return { sma, ema, rsi }
  }

  // Define userName and userEmail before using them
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';

  // Add utility functions for localStorage
  function savePortfolioToLocal(portfolio: any[], transactions: any[]) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('assetbit_portfolio', JSON.stringify(portfolio))
      localStorage.setItem('assetbit_transactions', JSON.stringify(transactions))
    } catch (e) {
      console.error('Error saving portfolio to localStorage:', e)
    }
  }
  function loadPortfolioFromLocal() {
    try {
      if (typeof window === 'undefined') return { portfolio: [], transactions: [] }
      
      const portfolio = JSON.parse(localStorage.getItem('assetbit_portfolio') || '[]')
      const transactions = JSON.parse(localStorage.getItem('assetbit_transactions') || '[]')
      
      // Enhance with images if not present
      const allCommodities = [...minerals, ...farmProduce]
      
      const enhancedPortfolio = portfolio.map((item: any) => {
        if (item.image) return item // Already has image
        
        // Find matching commodity to get image
        const matchingCommodity = allCommodities.find(c => 
          c.symbol === item.symbol || c.name === item.name
        )
        
        return {
          ...item,
          image: matchingCommodity?.image || 
                 (item.symbol ? `/images/${item.symbol.toLowerCase()}.png` : '/images/placeholder.png')
        }
      })
      
      return { portfolio: enhancedPortfolio, transactions }
    } catch (e) {
      console.error('Error loading portfolio from localStorage:', e)
      return { portfolio: [], transactions: [] }
    }
  }

  // Trade calculation logic
  const handleTradeCalculate = () => {
    const fromAsset = holdings.find(h => h.symbol === tradeFrom)
    const toAsset = holdings.find(h => h.symbol === tradeTo)
    if (!fromAsset || !toAsset || !tradeAmount || Number(tradeAmount) <= 0) {
      setTradeResult(null)
      return
    }
    const priceA = fromAsset.value / fromAsset.amount
    const priceB = toAsset.value / toAsset.amount
    const quantityReceived = (priceA / priceB) * Number(tradeAmount)
    const fee = priceA * Number(tradeAmount) * 0.00001
    setTradeResult({ received: quantityReceived - fee, fee })
  }

  // Trade confirm logic
  const handleTradeConfirm = async () => {
    if (!tradeResult || !tradeFrom || !tradeTo || !tradeAmount) return
    // Update holdings
    setHoldings(prev => {
      const fromIdx = prev.findIndex(h => h.symbol === tradeFrom)
      const toIdx = prev.findIndex(h => h.symbol === tradeTo)
      if (fromIdx === -1 || toIdx === -1) return prev
      const updated = [...prev]
      updated[fromIdx] = {
        ...updated[fromIdx],
        amount: updated[fromIdx].amount - Number(tradeAmount),
        value: updated[fromIdx].value - (updated[fromIdx].value / updated[fromIdx].amount) * Number(tradeAmount)
      }
      updated[toIdx] = {
        ...updated[toIdx],
        amount: updated[toIdx].amount + tradeResult.received,
        value: updated[toIdx].value + (updated[toIdx].value / updated[toIdx].amount) * tradeResult.received
      }
      return updated
    })
    // Log trade in recent transactions
    setRecentTransactions(prev => [
      {
        type: 'trade',
        name: `${tradeFrom}→${tradeTo}`,
        amount: Number(tradeAmount),
        price: tradeResult.received,
        fee: tradeResult.fee,
        timestamp: new Date().toISOString(),
        status: 'Completed',
      },
      ...prev
    ])
    setShowTradeDialog(false)
    setTradeFrom('')
    setTradeTo('')
    setTradeAmount('')
    setTradeResult(null)
  }

  return (
    <>
      {/* KYC Prompt Dialog */}
      <Dialog open={showKycPrompt} onOpenChange={setShowKycPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>KYC Required</DialogTitle>
          </DialogHeader>
          <div className="mb-4">To continue using all features, please complete your KYC verification.</div>
          <DialogFooter>
            <Button onClick={() => { setShowKycPrompt(false); router.push('/kyc') }}>Proceed to KYC</Button>
            <Button variant="outline" onClick={() => { setShowKycPrompt(false); setShowKycBanner(true); if (typeof window !== 'undefined') localStorage.setItem('kycMaybeLater', 'true') }}>Maybe Later</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* KYC NOT COMPLETE Banner - now directly under header */}
      {showKycBanner && (
        <div className="fixed top-20 left-0 w-full z-30 flex justify-center pointer-events-none">
          <div className="bg-red-100 border border-red-400 text-red-700 text-sm text-center py-2 px-6 font-semibold rounded shadow-md pointer-events-auto animate-fade-in-up" style={{maxWidth: '480px'}}>
            KYC verification required to unlock all features.
          </div>
        </div>
      )}
      {/* Main dashboard content with top margin for header */}
      <div className="pt-28">
        <div className="container mx-auto px-4 py-8">
          {/* Wallet connect button */}
          <div className="flex justify-end mb-4">
            {wallet.connected ? (
              <div className="text-green-400 text-sm font-mono">Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</div>
            ) : (
              <Button onClick={async () => {
                if (typeof window === 'undefined' || !window.ethereum || typeof window.ethereum.request !== 'function') {
                  toast.error('MetaMask is not installed!')
                  return
                }
                try {
                  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
                  setWallet({ connected: true, address: accounts[0] })
                  toast.success('Wallet connected!')
                } catch (err) {
                  toast.error('Wallet connection failed.')
                }
              }} className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">Connect Wallet</Button>
            )}
          </div>
          {/* Welcome and stats */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={session?.user?.image || undefined} alt={userName} />
                <AvatarFallback>{userName[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-white">Welcome, {userName}!</h2>
                <p className="text-gray-400 text-sm">{userEmail}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Card className="w-40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
                <CardContent className="py-4">
                  <div className="text-xs text-gray-200">Portfolio Value</div>
                  <div className="text-xl font-bold">${totalValue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="w-32 bg-gradient-to-br from-secondary to-secondary/80 text-white shadow-lg">
                <CardContent className="py-4">
                  <div className="text-xs text-gray-200">Assets</div>
                  <div className="text-xl font-bold">{totalAssets}</div>
                </CardContent>
              </Card>
              <Card className="w-32 bg-gradient-to-br from-green-500 to-green-400 text-white shadow-lg">
                <CardContent className="py-4">
                  <div className="text-xs text-gray-200">24h Change</div>
                  <div className="text-xl font-bold">{change24h}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Portfolio chart and asset summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>Track your portfolio value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={portfolioData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#8884d8" />
                    <YAxis stroke="#8884d8" />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Asset Summary</CardTitle>
                <CardDescription>Your current holdings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>24h Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.length > 0 ? (
                      holdings.map((asset, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <CommodityIcon symbol={asset.symbol} name={asset.name} />
                          </TableCell>
                          <TableCell>{asset.amount.toLocaleString()}</TableCell>
                          <TableCell>${asset.value.toLocaleString()}</TableCell>
                          <TableCell className={asset.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                            {asset.change}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No assets in portfolio
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Buy/Sell Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Buy Commodity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="buy-commodity">Commodity</Label>
                    <Select 
                      value={selectedCommodity} 
                      onValueChange={setSelectedCommodity}
                    >
                      <SelectTrigger id="buy-commodity">
                        {selectedCommodity ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 relative flex-shrink-0">
                              <Image
                                src={`/images/${selectedCommodity.toLowerCase()}.png`}
                                alt={selectedCommodity}
                                fill
                                sizes="20px"
                                className="rounded-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                }}
                              />
                            </div>
                            <span>{selectedCommodity}</span>
                          </div>
                        ) : (
                          <span>Select commodity</span>
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {[...minerals, ...farmProduce].map((commodity) => (
                          <SelectItem key={commodity.id} value={commodity.symbol}>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 relative flex-shrink-0">
                                <Image
                                  src={commodity.image || `/images/${commodity.symbol.toLowerCase()}.png`}
                                  alt={commodity.name}
                                  fill
                                  sizes="20px"
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                  }}
                                />
                              </div>
                              <span>{commodity.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buy-amount">Amount</Label>
                    <Input
                      id="buy-amount"
                      placeholder="Enter amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={!selectedCommodity || !amount || loading || Number(amount) <= 0}
                    onClick={handleBuy}
                  >
                    {loading ? 'Processing...' : 'Buy'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sell Commodity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sell-commodity">Commodity</Label>
                    <Select 
                      value={selectedAssetId?.toString() || ''} 
                      onValueChange={(value) => setSelectedAssetId(Number(value))}
                    >
                      <SelectTrigger id="sell-commodity">
                        {selectedAssetId !== null ? (
                          <div className="flex items-center gap-2">
                            {holdings.find(h => h.id === selectedAssetId?.toString()) && (
                              <>
                                <div className="w-5 h-5 relative flex-shrink-0">
                                  <Image
                                    src={holdings.find(h => h.id === selectedAssetId?.toString())?.image || 
                                         `/images/${holdings.find(h => h.id === selectedAssetId?.toString())?.symbol.toLowerCase()}.png`}
                                    alt={holdings.find(h => h.id === selectedAssetId?.toString())?.name || ''}
                                    fill
                                    sizes="20px"
                                    className="rounded-full object-cover"
                                    onError={(e) => {
                                      // Fallback if image fails to load
                                      (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                    }}
                                  />
                                </div>
                                <span>{holdings.find(h => h.id === selectedAssetId?.toString())?.name}</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span>Select commodity to sell</span>
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {holdings.map((holding) => (
                          <SelectItem key={holding.id} value={holding.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 relative flex-shrink-0">
                                <Image
                                  src={holding.image || `/images/${holding.symbol.toLowerCase()}.png`}
                                  alt={holding.name}
                                  fill
                                  sizes="20px"
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                  }}
                                />
                              </div>
                              <span>{holding.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sell-amount">Amount</Label>
                    <Input
                      id="sell-amount"
                      placeholder="Enter amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipient-address">Recipient Address</Label>
                    <Input
                      id="recipient-address"
                      placeholder="0x..."
                      value={sellRecipient}
                      onChange={(e) => setSellRecipient(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    ref={sellButtonRef}
                    disabled={selectedAssetId === null || !amount || loading || Number(amount) <= 0}
                    onClick={() => setShowSellDialog(true)}
                  >
                    {loading ? 'Processing...' : 'Sell'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commodity Price Section */}
          {selectedCommodity && marketData ? (
            <div className="my-8 p-4 bg-gray-800 rounded-lg shadow-md relative">
              <div className="flex items-center gap-4 mb-2">
                <CommodityIcon
                  symbol={selectedCommodity}
                  name={selectedCommodity.charAt(0).toUpperCase() + selectedCommodity.slice(1)}
                />
                <div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    {marketData.price != null ? `$${marketData.price.toFixed(2)}` : '-'}
                    {marketData.trend === 'up' ? (
                      <span className="text-green-400">▲</span>
                    ) : (
                      <span className="text-red-400">▼</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Current Price
                    {lastUpdate && (
                      <span className="ml-2 text-gray-500">
                        (Updated {lastUpdate.toLocaleTimeString()})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchMarketData}
                    disabled={isLoadingMarketData}
                    className="flex items-center gap-2"
                  >
                    {isLoadingMarketData ? (
                      <LoadingScreen message="Updating prices..." />
                    ) : (
                      <>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 4v6h-6M1 20v-6h6" />
                          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                        </svg>
                        Refresh
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="auto-update" className="text-xs text-gray-400">Auto Update</Label>
                    <Switch
                      id="auto-update"
                      checked={isAutoUpdate}
                      onCheckedChange={setIsAutoUpdate}
                    />
                  </div>
                  {isAutoUpdate && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="update-interval" className="text-xs text-gray-400">Interval (s)</Label>
                      <Select
                        value={updateInterval.toString()}
                        onValueChange={(value) => setUpdateInterval(parseInt(value))}
                      >
                        <SelectTrigger className="h-8 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30s</SelectItem>
                          <SelectItem value="60">1m</SelectItem>
                          <SelectItem value="300">5m</SelectItem>
                          <SelectItem value="600">10m</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      className={`px-2 py-1 rounded text-xs font-semibold ${selectedTimeframe === tf ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                      onClick={() => setSelectedTimeframe(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-400">24h High</div>
                  <div className="text-lg font-bold text-white">
                    {marketData.price != null ? `$${(marketData.price * 1.02).toFixed(2)}` : '-'}
                  </div>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-400">24h Low</div>
                  <div className="text-lg font-bold text-white">
                    {marketData.price != null ? `$${(marketData.price * 0.98).toFixed(2)}` : '-'}
                  </div>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-400">24h Volume</div>
                  <div className="text-lg font-bold text-white">
                    {marketData.price != null ? `$${(marketData.price * 1000).toLocaleString()}` : '-'}
                  </div>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-400">Market Cap</div>
                  <div className="text-lg font-bold text-white">
                    {marketData.price != null ? `$${(marketData.price * 1000000).toLocaleString()}` : '-'}
                  </div>
                </div>
              </div>

              {/* Technical Indicators Toggle */}
              <div className="flex items-center gap-4 mb-4">
                <Label htmlFor="technical-indicators" className="text-sm text-gray-400">
                  Technical Indicators
                </Label>
                <Switch
                  id="technical-indicators"
                  checked={showTechnicalIndicators}
                  onCheckedChange={setShowTechnicalIndicators}
                />
                {showTechnicalIndicators && (
                  <div className="flex gap-2">
                    <Button
                      variant={selectedIndicators.includes('sma') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedIndicators(prev =>
                          prev.includes('sma')
                            ? prev.filter(i => i !== 'sma')
                            : [...prev, 'sma']
                        )
                      }}
                    >
                      SMA
                    </Button>
                    <Button
                      variant={selectedIndicators.includes('ema') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedIndicators(prev =>
                          prev.includes('ema')
                            ? prev.filter(i => i !== 'ema')
                            : [...prev, 'ema']
                        )
                      }}
                    >
                      EMA
                    </Button>
                    <Button
                      variant={selectedIndicators.includes('rsi') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedIndicators(prev =>
                          prev.includes('rsi')
                            ? prev.filter(i => i !== 'rsi')
                            : [...prev, 'rsi']
                        )
                      }}
                    >
                      RSI
                    </Button>
                  </div>
                )}
              </div>

              {/* Chart */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketData.history[selectedTimeframe]}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      stroke="#8884d8" 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis stroke="#8884d8" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip 
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#6366f1" 
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                    {showTechnicalIndicators && selectedIndicators.includes('sma') && (
                      <Line
                        type="monotone"
                        data={calculateIndicators(marketData.history[selectedTimeframe]).sma}
                        dataKey="value"
                        stroke="#ff7300"
                        dot={false}
                        name="SMA"
                      />
                    )}
                    {showTechnicalIndicators && selectedIndicators.includes('ema') && (
                      <Line
                        type="monotone"
                        data={calculateIndicators(marketData.history[selectedTimeframe]).ema}
                        dataKey="value"
                        stroke="#387908"
                        dot={false}
                        name="EMA"
                      />
                    )}
                    {showTechnicalIndicators && selectedIndicators.includes('rsi') && (
                      <Line
                        type="monotone"
                        data={calculateIndicators(marketData.history[selectedTimeframe]).rsi}
                        dataKey="value"
                        stroke="#ff0000"
                        dot={false}
                        name="RSI"
                        yAxisId="rsi"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {isLoadingMarketData && (
                <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
                  <div className="text-white">Updating prices...</div>
                </div>
              )}
            </div>
          ) : selectedCommodity ? (
            <div className="my-8 p-4 bg-gray-800 rounded-lg shadow-md text-red-400">No market data available for {selectedCommodity}.</div>
          ) : null}

          {/* Recent Activity / Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx, index) => (
                      <TableRow key={index}>
                        <TableCell className={tx.type === 'Buy' || tx.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                          {tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1)}
                        </TableCell>
                        <TableCell>
                          <CommodityIcon 
                            symbol={tx.symbol || ''} 
                            name={tx.name || tx.asset || ''}
                          />
                        </TableCell>
                        <TableCell>{typeof tx.amount === 'number' ? tx.amount.toFixed(4) : tx.amount}</TableCell>
                        <TableCell>
                          {typeof tx.price === 'number' ? `$${tx.price.toFixed(2)}` : tx.price || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tx.status === 'Completed' || tx.status === 'completed' ? 
                            'bg-green-500/20 text-green-500' : 
                            tx.status === 'Pending' || tx.status === 'pending' ? 
                            'bg-yellow-500/20 text-yellow-500' : 
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {tx.status || 'Completed'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter Recipient Address</DialogTitle>
              </DialogHeader>
              <Input
                autoFocus
                placeholder="0x..."
                value={sellRecipient}
                onChange={e => setSellRecipient(e.target.value)}
                className="mb-4"
              />
              <DialogFooter>
                <Button
                  onClick={async () => {
                    if (!sellRecipient) {
                      toast.error('Recipient address is required.')
                      return
                    }
                    setShowSellDialog(false)
                    setLoading(true)
                    try {
                      const provider = new BrowserProvider(window.ethereum as any)
                      const signer = await provider.getSigner()
                      const assetBitRegistry = new Contract(ASSETBIT_REGISTRY_ADDRESS, ASSETBIT_REGISTRY_ABI, signer)
                      const tx = await assetBitRegistry.transferAsset(
                        typeof selectedAssetId === 'string' ? BigInt(selectedAssetId) : selectedAssetId,
                        sellRecipient
                      )
                      await tx.wait()
                      setLoading(false)
                      toast.success(`Asset ${selectedAssetId} transferred to ${sellRecipient}`)
                      setAmount('')
                      setSellRecipient('')
                      setHoldings(prev => prev.filter(h => Number(h.id) !== selectedAssetId))
                      setRecentTransactions(prev => [
                        {
                          id: prev.length ? Math.max(...prev.map(t => typeof t.id === 'number' ? t.id : 0)) + 1 : 1,
                          type: 'Sell',
                          asset: selectedCommodity.charAt(0).toUpperCase() + selectedCommodity.slice(1),
                          amount: Number(amount),
                          price: marketData ? marketData.price : 0,
                          date: new Date().toISOString().slice(0, 10),
                          status: 'Completed',
                        },
                        ...prev
                      ])
                      fetchProfile()
                    } catch (err: any) {
                      setLoading(false)
                      let message = 'Transaction failed or rejected.'
                      if (err?.data?.message) message = err.data.message
                      else if (err?.message) message = err.message
                      toast.error(message)
                      console.error(err)
                    }
                  }}
                  className="w-full"
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Glassy trade modal */}
          <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
            <DialogContent className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Trade Assets</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="trade-from">From Asset</Label>
                  <Select value={tradeFrom} onValueChange={setTradeFrom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset to trade from" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border border-gray-600 shadow-lg rounded-lg max-h-64 overflow-y-auto">
                      {holdings.map((h: any) => (
                        <SelectItem key={h.symbol} value={h.symbol}>{h.name} ({h.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trade-to">To Asset</Label>
                  <Select value={tradeTo} onValueChange={setTradeTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset to receive" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border border-gray-600 shadow-lg rounded-lg max-h-64 overflow-y-auto">
                      {holdings.filter((h: any) => h.symbol !== tradeFrom).map((h: any) => (
                        <SelectItem key={h.symbol} value={h.symbol}>{h.name} ({h.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trade-amount">Amount to Trade</Label>
                  <Input
                    id="trade-amount"
                    type="number"
                    min="0.00000001"
                    step="any"
                    value={tradeAmount || ''}
                    onChange={e => setTradeAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-white/20 border border-white/30 text-white placeholder-gray-300"
                  />
                </div>
                <Button onClick={handleTradeCalculate} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">Calculate</Button>
                {tradeResult && (
                  <div className="bg-white/10 rounded-lg p-4 text-white">
                    <div>Quantity Received: <span className="font-bold">{tradeResult.received.toFixed(6)}</span></div>
                    <div>Trade Fee: <span className="font-bold text-yellow-300">${tradeResult.fee.toFixed(6)}</span></div>
                  </div>
                )}
                <Button onClick={handleTradeConfirm} className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black font-bold" disabled={!tradeResult}>Confirm Trade</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add a button to open the trade modal in the dashboard UI */}
          <Button onClick={() => setShowTradeDialog(true)} className="mt-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold shadow-lg">Trade Assets</Button>
        </div>
      </div>
    </>
  )
} 